# BRAC Document Validation Engine (DVE) Prototype
## Complete Codebase Handover Documentation

This document represents the **authoritative, exhaustive state** of the BRAC Bank Document Validation Engine (DVE) prototype. It is designed as a complete handover artifact for a new developer, capturing exactly what the code does, how all pieces connect, and the architectural decisions embodied in the implementation. It requires no external context to understand.

---

## 1. System Purpose and Scope

The BRAC Bank Document Validation Engine (DVE) is a React-based frontend prototype that simulates an AI-assisted quality control layer for document uploads at branch and field levels. 

### 1.1 What the Application Does
The system intercepts document images (cheques, loan applications, NIDs) at submission time, runs them through a simulated ML pipeline (classification, OCR extraction, rule-based validation), and surfaces structured, actionable warnings to operators without blocking their workflow. 

The application is framed within a mobile viewport (`390px` by `844px`) rendered on a desktop screen, reflecting how a field agent would use it on a tablet or phone.

### 1.2 What is Out of Scope (Not Implemented)
- **Backend API & Databases:** All persistence is in-memory (Zustand). There is no backend service.
- **Real ML/OCR:** All OCR extractions, image quality checks, and signature detections are deterministically mocked or randomized.
- **Authentication:** Sessions are simulated via a generated client session string; operator identities are hardcoded or randomized mock strings.
- **Financial Flows:** Disbursement, fees, and actual settlement logic do not exist.

---

## 2. Technology Stack and Tooling

### 2.1 Dependencies
- **React (18) & React DOM:** Core UI library.
- **React Router DOM:** Client-side routing (`createBrowserRouter`).
- **Zustand:** Lightweight global state management.
- **Framer Motion:** UI transitions, micro-interactions, and route animations.
- **Lucide React:** Iconography.
- **Tailwind CSS:** Utility classes for styling (though many components still use inline CSS variables).

### 2.2 Build, Quality, and Testing
- **Vite:** Local dev server and production bundler.
- **TypeScript:** Strict type checking across the entire project.
- **ESLint:** Code linting with flat config (`eslint.config.js`).
- **Vitest:** Test runner for utility and rule functions (`vite.config.ts` configured with `globals: true`).

---

## 3. Folder and Module Organization

The codebase is contained entirely within the `src/` directory.

```text
src/
├── main.tsx                 // React root entry point
├── App.tsx                  // Router setup & main layout wrapper
├── types/                   // Core domain interfaces (Document, OCR, Rules, Logging)
├── constants/               // App modes (DEMO, RANDOM, MANUAL)
├── engine/                  // Pure function validation engine (Registry, Executor, Builder)
├── rules/                   // Individual rule logic (Cheque, Loan, NID)
├── store/                   // Zustand state stores
├── hooks/                   // Orchestration (useDocumentValidation) and utilities
├── screens/                 // Full-screen React route views
├── components/              // Reusable UI blocks categorized by domain
├── mock/                    // Simulated OCR data, AI classifiers, historical logs
└── utils/                   // Helpers (amount parsing, date validation, delays)
```

---

## 4. Domain Models and Type System

The type system (`src/types/`) is the source of truth for all data structures passing through the application.

### 4.1 Document and Workflow Types
- `DocumentType`: Enum covering `CHEQUE`, `LOAN_FORM`, `NID`, `ACCOUNT_OPENING_FORM`, and `UNKNOWN`.
- `WorkflowType`: The application routes based on workflows (`cheque-processing`, `loan-application`, `kyc-verification`), which `documentStore` maps directly to a `DocumentType`.

### 4.2 OCR and AI Mock Types
- `MockOCRResult`: The central payload returned by the mock extraction layer. It contains:
  - `fields`: A union of `ChequeFields`, `LoanFormFields`, or `NIDFields`.
  - `imageQuality`: Scores for blur, skew, lighting.
  - `signatureDetection`: Confidence and bounding box for signatures.
  - `confidence`: Overall and per-field confidence scores.

### 4.3 Validation Types
- `ValidationRule`: Defines a rule's metadata (`id`, `severity`, `category`) and a `validate(ocrResult)` pure function.
- `ValidationResult`: The outcome of a single rule check, containing a `Warning` if the rule failed.
- `DocumentValidationReport`: The aggregated output of the validation engine, containing all warnings, overall status (`PASS` or `WARNINGS`), and OCR confidence metrics. **Crucially**, `canProceed` is permanently hardcoded to `true` (warning-only philosophy).

### 4.4 Logging Types
- `ErrorLogEntry`: Represents a fully processed document interaction, recording the operator ID, document type, generated warnings, and the operator's final action (`NO_WARNINGS`, `RETURNED_TO_REVIEW`, `PROCEEDED_WITH_WARNINGS`).

---

## 5. Global State Management (Zustand)

State is highly modularized across several stores, strictly avoiding direct cross-store mutations (except where orchestration hooks combine them).

1. **`appStore`**: Manages global configuration, like the current `AppMode` (`DEMO_MODE`, `RANDOM_MODE`, `MANUAL_MODE`), the mock `operatorId`, `branchCode`, and a unique `sessionId` initialized on load.
2. **`documentStore`**: Handles the currently selected `File`, the active `workflowType`, and the `documentType`. In Demo and Manual modes, it also holds the `selectedScenarioId` and `manualInjections`.
3. **`ruleStore`**: Maintains a dictionary of enabled/disabled rule IDs (`enabledRuleIds`). This allows the Dashboard to toggle active rules at runtime.
4. **`validationStore`**: Holds the pipeline's transient state. It tracks `isProcessing`, the `processingStep` (0-4), the `currentReport` (final validation output), and the `currentOCRResult`.
5. **`logStore`**: An in-memory ledger initialized with mock historical data (`mock/historicalLog.ts`). It exposes an `addEntry` action and derived selector methods like `getStats` and `getTopErrors` to feed the analytics Dashboard.

---

## 6. The Validation Engine

The Validation Engine (`src/engine/`) is a series of pure functions completely decoupled from React and Zustand.

### 6.1 Rule Registry (`RuleRegistry.ts`)
Houses the `ALL_RULES` array, importing the 8 implemented rules from `src/rules/`. It exposes `getRulesForDocument`, which filters rules based on their defined `documentTypes` and whether they are active in `ruleStore`.

### 6.2 Rule Executor (`RuleExecutor.ts`)
Iterates over the active rules, running `rule.validate(ocrResult)`. 
**Invariant:** Fail-open design. If a rule's internal logic throws an exception, the executor catches it and returns a passing result with an `executionError` flag attached, guaranteeing that a broken rule does not block document submission.

### 6.3 Report Builder (`ReportBuilder.ts`)
Aggregates the individual `ValidationResult` objects. It computes average OCR confidence, sorts warnings by severity (`HIGH` -> `MEDIUM` -> `LOW`), and determines the `overallStatus`.

### 6.4 Implemented Rules
- **Cheque:**
  - `CHQ_AMOUNT_MISMATCH` (HIGH): Parses the written amount text and compares it to the numeric amount.
  - `CHQ_SIGNATURE_MISSING` (HIGH): Fails if signature detection confidence is too low.
  - `CHQ_DATE_INVALID` (MEDIUM): Flags stale (6+ months) or far-future post-dated cheques.
  - `CHQ_PAYEE_BLANK` (HIGH): Ensures payee is present and not blank.
- **Loan:**
  - `LOAN_MANDATORY_FIELDS` (HIGH): Iterates defined mandatory fields and flags omissions.
  - `LOAN_GUARANTOR_MISSING` (MEDIUM): Checks for guarantor signature presence.
- **NID:**
  - `NID_IMAGE_QUALITY` (MEDIUM): Fails if `imageQuality.overallScore` is below threshold.
  - `NID_EXPIRY` (LOW): Flags expired NIDs (allows "Smart NID" with `null` expiry).

---

## 7. Mock AI and Simulation Layer

Because there is no real backend, `src/mock/` controls how data is simulated based on the `AppMode` set in `appStore`.

### 7.1 Modes of Operation
- **DEMO_MODE:** Uses fixed scenarios from `MOCK_SCENARIOS` (e.g., `CHEQUE_AMOUNT_MISMATCH`, `NID_EXPIRED`). These return hardcoded OCR JSON payloads that guarantee a specific set of warnings for presentation purposes.
- **RANDOM_MODE:** Generates synthetic `MockOCRResult` payloads via `generateRandomOCRResult`. It probabilistically introduces mismatched amounts, low confidences, and invalid dates to stress test the UI.
- **MANUAL_MODE:** Allows the operator (via `ManualInjectionPanel` in the UI) to force specific OCR mutations. It takes a clean base OCR result and injects errors (e.g., intentionally blanking the payee) to trigger rules manually.

### 7.2 The Pipeline Steps
The orchestrator simulates a real AI pipeline via async delays (`utils/delay.ts`):
1. `mockClassify()`: Simulates document type detection.
2. `mockOCRExtract()`: Dispatches to Demo/Random/Manual data generators and delays for 800–1500ms to simulate ML inference latency.
3. `mockSignatureDetection()` & `assessImageQuality()`: Supply sub-payloads for the OCR result.

---

## 8. Routing and Navigation Shell

The app uses `react-router-dom` in `App.tsx` and `main.tsx`.

### 8.1 The Shell
The root layout wraps all screens in `<MobileContainer>`, enforcing the phone viewport constraint. Route changes are animated using Framer Motion `<AnimatePresence>` and lazy-loaded via `React.lazy`.

### 8.2 Navigation Hierarchy
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `HomeScreen` | Entry. Offers workflow cards (Cheque, Loan, NID). |
| `/upload/:workflowType` | `UploadScreen` | Renders `DropZone`. In Demo Mode, shows `ScenarioSelector`. In Manual Mode, shows `ManualInjectionPanel`. |
| `/processing` | `ProcessingScreen` | Renders the simulated 4-step pipeline UI. Redirects to `/result` when done. |
| `/result` | `ResultScreen` | Renders either `PassBanner` or `WarningPanel`. |
| `/result/warning/:ruleId` | `WarningDetailScreen` | Full-screen breakdown of a single warning. |
| `/result/review` | `ReviewScreen` | Shows the document image overlaid with severity-colored Bounding Boxes. |
| `/result/confirm` | `ConfirmProceedScreen` | Modal confirming the user's intent to bypass warnings. |
| `/dashboard` | `DashboardScreen` | Analytics view powered by `logStore.getStats()`. |
| `/dashboard/rules` | `RuleManagerScreen` | Toggles rule activation states in `ruleStore`. |

### 8.3 Global Navigation
`BottomNav.tsx` is fixed at the bottom, offering links to Home (`/`) and Dashboard (`/dashboard`). It conditionally hides itself during the `/processing`, `/result/confirm`, and `/result/review` steps.

---

## 9. Key Hooks and Orchestration

### 9.1 `useDocumentValidation.ts`
This is the heart of the application's runtime sequence, triggered when `ProcessingScreen` mounts.
1. Marks `validationStore.startProcessing()`.
2. Steps through `mockClassify` and `mockOCRExtract`, awaiting simulated delays.
3. Synchronously executes `ValidationEngine.run()` using active rules from `ruleStore`.
4. Saves the generated `DocumentValidationReport` and `MockOCRResult` into `validationStore`.
5. Commits a preliminary `ErrorLogEntry` to `logStore` with an action of `RETURNED_TO_REVIEW` (if warnings exist) or `NO_WARNINGS`.
6. Navigates the router to `/result`.

### 9.2 `useLogProceed.ts`
Called when the user clicks "Confirm & Proceed" on the confirmation modal. It looks up the active log entry, updates its action to `PROCEEDED_WITH_WARNINGS`, applies a timestamp, and marks all warnings as acknowledged.

---

## 10. Component System Architecture

Components are strictly segregated by domain to avoid monolithic structures.

### 10.1 UI/UX Implementation Notes
- **Styling:** CSS Variables defined in `index.css` form the core design system (`--brand-red`, `--severity-high`). Components frequently use inline React `style` objects bound to these variables. Tailwind is installed and available but secondary.
- **Bounding Boxes:** `AnnotatedImageOverlay.tsx` draws boxes over documents based on percentage-relative coordinates (0 to 1) provided by the Mock OCR, ensuring they map correctly over the responsive `MockDocumentPlaceholder`.
- **Loading Stepper:** `ProcessingSteps.tsx` visually maps directly to the `validationStore.processingStep` index, delivering an authentic "system at work" feel.
- **Animations:** High severity warnings utilize CSS keyframes (`severity-shimmer`) defined in `index.css` to catch the operator's eye upon mounting.

---

## 11. End-to-End Workflow (Happy Path vs. Exception Path)

### Workflow 1: The Clean Document (Happy Path)
1. User clicks **Cheque Processing** on `HomeScreen`.
2. In `UploadScreen`, they select the `CHEQUE_CLEAN` scenario (Demo Mode) or upload an image.
3. `DropZone` navigates to `/processing`.
4. `useDocumentValidation` runs; all rules pass.
5. Router hits `/result`. `ResultScreen` reads `warningCount === 0` and renders `PassBanner.tsx`.
6. User clicks **Proceed**, returning home.

### Workflow 2: The Error Investigation (Exception Path)
1. User processes a cheque where numeric/written amounts differ.
2. `ProcessingScreen` completes; `ResultScreen` mounts `WarningPanel.tsx` because `warningCount > 0`.
3. User sees a HIGH severity card for "Amount Mismatch".
4. User clicks **View in Document**. The app routes to `/result/warning/:ruleId`, showing detailed advice.
5. User clicks **Review Document Image**. The app routes to `/result/review` displaying the cheque with a red box drawn around the amount field.
6. User determines the system is correct, hits Back, and clicks **Proceed Anyway**.
7. `ConfirmProceedScreen` modal appears. User confirms. `useLogProceed` marks the log as `PROCEEDED_WITH_WARNINGS`.
8. Over on the `/dashboard`, the "Proceed with Warnings Rate" KPI updates instantly, and the horizontal bar chart logs an additional hit for `CHQ_AMOUNT_MISMATCH`.

---

## 12. Important Constraints and Invariants

- **Warning-Only Philosophy:** The system is explicitly designed never to hard-block an operator. `DocumentValidationReport.canProceed` is irrevocably `true`.
- **Fail-Open Execution:** If `Rule.validate()` throws an exception, the rule engine swallows it, logs a system error, and allows the document to pass.
- **Manual vs. Rule Toggles:** 
  - `ManualInjectionPanel` mutates the mock OCR output to *provoke* errors.
  - `RuleManagerScreen` (`ruleStore`) governs whether the engine *listens* for those errors. An injected error will not flag if its corresponding rule is disabled.

---

## 13. Known Limitations and Future Scalability

- **No Persistence:** If the user refreshes the browser window, all logs, analytics, and session IDs are wiped.
- **Route Edges:** The Processing Screen "Try Again" fallback navigates to `/upload`, which requires a parameter (`/upload/:workflowType`) in the router. If triggered, it may fail silently.
- **Account Opening Rules:** The type `ACCOUNT_OPENING_FORM` exists, but no rules are implemented for it, and no workflow route selects it.
- **Phase 2 Evolution:** Moving this codebase to production requires zero changes to the UI, stores, or engine. Developers only need to replace `mockOCR.ts` with real `fetch` calls to an OCR backend and replace `logStore` with a POST API.

---

## 14. Getting Started

### Local Development
```bash
npm install
npm run dev
```

### Testing
Run `npm run test` to execute the Vitest suite covering `amountParser.ts` and `amountMismatch.test.ts`.

### Authoring New Rules
To add a new rule:
1. Create `src/rules/domain/myNewRule.ts` conforming to `ValidationRule`.
2. Import and append it to `ALL_RULES` inside `src/engine/RuleRegistry.ts`.
3. (Optional) Create a `MockScenario` in `src/mock/mockScenarios.ts` to trigger it reliably in Demo Mode.

*End of Document.*