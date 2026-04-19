# BRAC DVE Prototype — Complete Codebase State Documentation

This document describes the **current, implemented state** of the BRAC Document Validation Engine (DVE) prototype in the `dve` workspace. It is a handover artifact for a new developer: it reflects **what the code actually does**, how modules connect, and how data moves through the system—without relying on external context.

**File name note:** the canonical documentation file in the repository is `CODEBASE_STATE_DOCUMENTATION.md` (this file).

---

## 1) System Purpose and Scope

### 1.1 What the application is

The application is a **single-page React + TypeScript** prototype that simulates **branch-side document validation** for a bank context. It presents a **phone-framed** primary viewport with optional **desktop side panels**, and walks an operator through:

1. Choosing a **workflow** (mapped to a document family).
2. **Uploading** or selecting a **mock** document image.
3. A **simulated AI pipeline**: classify → OCR extract → rule validation → report.
4. Viewing **pass** or **warning** outcomes, drilling into **warning detail**, optional **annotated document review**, and a **compliance-style proceed** path.
5. Viewing **operational analytics** and toggling **which validation rules run** at runtime.

### 1.2 What is explicitly out of scope (not implemented)

- Real backend APIs, databases, or network persistence.
- Real OCR/ML models; all extraction and classification are **mocked**.
- Authentication, authorization, or per-user sessions beyond a **generated client session id** string.
- Server-side audit trails; logging is **in-memory** in the browser only.
- Financial product flows such as **disbursement, fees, or settlement**—they are **not** part of this codebase (no modules, routes, or domain types for them).

---

## 2) Technology Stack and Tooling

### 2.1 Runtime dependencies (`package.json`)

| Package | Role |
| --- | --- |
| `react`, `react-dom` | UI |
| `react-router-dom` | Client-side routing (`createBrowserRouter`) |
| `zustand` | Global client state (multiple small stores) |
| `framer-motion` | Transitions and micro-interactions |
| `lucide-react` | Icon set |

### 2.2 Build and quality tooling

| Tool | Role |
| --- | --- |
| `vite` | Dev server and production bundler |
| `@vitejs/plugin-react` | React refresh and JSX transform |
| `typescript` | Static typing (`tsconfig.app.json` for app code) |
| `eslint` + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` | Linting (`eslint.config.js`, flat config) |
| `tailwindcss` + `postcss` + `autoprefixer` | Utility CSS; **most UI still uses inline `style` objects** with CSS variables |
| `vitest` | Unit tests (configured in `vite.config.ts` with `test.globals: true`) |

### 2.3 NPM scripts

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `vite` | Local development |
| `build` | `tsc -b && vite build` | Typecheck project references then production build |
| `preview` | `vite preview` | Serve production build locally |
| `lint` | `eslint .` | Lint source |
| `test` | `vitest` | Run unit tests |

---

## 3) Repository and Source Layout

### 3.1 Top-level files (non-exhaustive but relevant)

| Path | Purpose |
| --- | --- |
| `index.html` | Vite entry HTML; mounts `#root`, loads `/src/main.tsx`, `favicon.svg` |
| `vite.config.ts` | Vite + React plugin; **Vitest** `test` block (`globals: true`) |
| `package.json` | Dependencies and scripts |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | TypeScript project layout |
| `tailwind.config.ts` | Tailwind content globs; maps theme colors to CSS variables |
| `postcss.config.js` | PostCSS pipeline for Tailwind |
| `eslint.config.js` | ESLint flat config; ignores `dist` |
| `README.md` | May still reflect Vite template defaults—**do not assume** it matches product behavior |

### 3.2 `public/` (static assets served at site root)

| Path | Purpose |
| --- | --- |
| `public/assets/mock-documents/cheque-sample.svg` | Demo “cheque” image for `MockDocumentPicker` |
| `public/assets/mock-documents/loan-form-sample.svg` | Demo loan form image |
| `public/assets/mock-documents/nid-sample.svg` | Demo NID image |
| `public/favicon.svg`, `public/icons.svg` | Icons |

These SVGs are **fetched at runtime** (`fetch('/assets/mock-documents/...')`) and wrapped in `File` objects to feed the same upload pipeline as user files.

### 3.3 `src/` application structure (authoritative inventory)

The following paths exist under `src/` as of this documentation pass:

| Area | Paths |
| --- | --- |
| Entry | `main.tsx`, `App.tsx`, `index.css`, `App.css` |
| Types | `types/*.ts` |
| Constants | `constants/appModes.ts` |
| Utils | `utils/*.ts` (+ tests) |
| Mock / simulation | `mock/**/*.ts` |
| Rules | `rules/cheque/*`, `rules/loan/*`, `rules/nid/*` (+ one rule test) |
| Engine | `engine/*.ts` |
| State | `store/*.ts` |
| Hooks | `hooks/*.ts` |
| Components | `components/common/*`, `layout/*`, `upload/*`, `processing/*`, `validation/*`, `dashboard/*` |
| Screens | `screens/*.tsx` |
| Assets | `assets/*.svg` (Vite-bundled static imports if used) |

**Note:** `src/App.css` is **not** imported by the running app (`main.tsx` imports `index.css` only). It is legacy/starter residue unless wired in later.

---

## 4) Runtime Entry, Router, and Navigation Shell

### 4.1 `src/main.tsx`

- Enables `React.StrictMode`.
- Imports global styles from `src/index.css`.
- Renders root `<App />` into `#root`.

### 4.2 `src/App.tsx`

**Router:** `createBrowserRouter` with a single parent route `/` that renders `RootLayout`.

**`RootLayout`:**

- Wraps children in `MobileContainer`.
- Wraps `Outlet` in `Suspense` (fallback: plain “Loading…” text).
- Wraps `Outlet` in `AnimatePresence` with `mode="wait"` for route transition coordination.

**Lazy loading:** Every screen is `React.lazy`-imported so each route chunk loads on demand.

**Exported `PageTransition`:** Framer Motion wrapper (fade/slide). Some screens pass `disableExit` to avoid exit animations where it would feel wrong (e.g. processing).

### 4.3 Route table (implemented)

| Path | Screen component | Role |
| --- | --- | --- |
| `/` | `HomeScreen` | Workflow selection |
| `/upload/:workflowType` | `UploadScreen` | Upload / demo / manual injection |
| `/processing` | `ProcessingScreen` | Runs validation pipeline once on mount |
| `/result` | `ResultScreen` | Pass banner or warning panel |
| `/result/warning/:ruleId` | `WarningDetailScreen` | Full-screen warning detail for one rule |
| `/result/review` | `ReviewScreen` | Annotated image overlay |
| `/result/confirm` | `ConfirmProceedScreen` | Compliance confirmation modal flow |
| `/dashboard` | `DashboardScreen` | Analytics |
| `/dashboard/rules` | `RuleManagerScreen` | Rule toggles |

**Parameters:** `workflowType` must be one of `cheque-processing` | `loan-application` | `kyc-verification`. Invalid values are not strictly validated by the router; `UploadScreen` maps known workflows and defaults title fallback carefully.

### 4.4 Global bottom navigation (`components/layout/BottomNav.tsx`)

- Fixed height bar with **Home** (`/`) and **Dashboard** (`/dashboard`).
- **Hidden** when `pathname` is **exactly** one of: `/processing`, `/result/confirm`, `/result/review`.
- **Visible** on `/result`, `/result/warning/:ruleId`, and other routes not in the hidden list.

This means the warning detail route **keeps** bottom nav visible unless changed later.

---

## 5) Styling and Design System

### 5.1 `src/index.css`

Defines:

- Google font imports: **DM Serif Display**, **Inter**, **JetBrains Mono**.
- CSS variables for brand colors, surfaces, severity colors, status pass colors, typography, radii.
- Keyframe animations including `severity-shimmer`, `breathe`, `orb-drift`, `line-fill`, `bbox-pulse`.
- Utility class `.phone-scroll-content` for scrollbar hiding in the phone viewport.

### 5.2 `tailwind.config.ts`

- `content`: `./index.html`, `./src/**/*.{ts,tsx}`.
- `theme.extend.colors` maps Tailwind color keys to `var(--...)` CSS variables.

### 5.3 Implementation reality

- Most screens and components use **inline style objects** referencing CSS variables (e.g. `color: 'var(--text-primary)'`).
- Tailwind is available but **not** the dominant styling approach in `src/`.

---

## 6) Domain Model and Type System

Types are split into focused modules under `src/types/` and re-exported selectively via `src/types/index.ts` (explicit exports; **no** `export *`).

### 6.1 `types/document.ts`

- **`DocumentType`:** `CHEQUE` | `LOAN_FORM` | `NID` | `ACCOUNT_OPENING_FORM` | `UNKNOWN`.
- **`WorkflowType`:** `cheque-processing` | `loan-application` | `kyc-verification`.
- **`BoundingBox`:** normalized rectangle (`x`, `y`, `w`, `h` in **0–1** coordinates relative to image width/height).

**Workflow → document mapping (implemented in `documentStore.setWorkflow`):**

| Workflow | Document type |
| --- | --- |
| `cheque-processing` | `CHEQUE` |
| `loan-application` | `LOAN_FORM` |
| `kyc-verification` | `NID` |

### 6.2 `types/ocr.ts`

**Quality and detection:**

- `ImageQualityResult` — `overallScore`, `lighting`, `blur`, `skew`.
- `SignatureDetectionResult` — `signaturePresent`, `signatureZoneScore`, `signaturePosition` (`BoundingBox | null`).
- `ConfidenceScores` — `overall` plus `perField` string-keyed map.

**Structured field models:**

- `ChequeFields` — amounts, payee, date, MICR, crossing flag, etc.
- `LoanFormFields` — applicant info, `mandatoryFields[]`, `guarantorSection`, signatures, dates.
- `NIDFields` — identity fields; **`expiryDate` may be `null` for “Smart NID”** scenarios.
- `AccountOpeningFields` — account opening template (not heavily exercised by current workflows but present for type completeness).
- `DocumentFields` — union of the above.

**Envelope:**

- `MockOCRResult` — `documentType`, `imageQuality`, `processingTimeMs`, `fields`, `signatureDetection`, `confidence`, `rawText`.

**Type guards (used heavily in rules and mock mutation):**

- `isChequeFields`, `isLoanFormFields`, `isNIDFields`, `isAccountOpeningFields`.

### 6.3 `types/rules.ts`

- **`Severity`:** `HIGH` | `MEDIUM` | `LOW`.
- **`RuleCategory`:** seven fixed categories (amount, completeness, signature, date, image, identity, format consistency).
- **`ValidationRule`:** metadata (`id`, `documentTypes`, `name`, `description`, `severity`, `phase`, `enabled`, `category`) plus `validate(ocrResult) => ValidationResult`.

**Architectural note:** `enabled` on each `ValidationRule` is **definition metadata**. Runtime enable/disable is **only** driven by `ruleStore` (see §10).

### 6.4 `types/validation.ts`

- **`Warning`:** rich UI/legal-style warning with `title`, `message`, `detail`, `suggestedAction`, optional `affectedField`, optional `boundingBox` for overlays.
- **`ValidationResult`:** per-rule outcome; may include `executionError` string if the rule threw (see engine).
- **`DocumentValidationReport`:** aggregates results; `overallStatus` is `PASS` | `WARNINGS`.
- **`canProceed`:** typed as **literal `true`** — the system **never** sets this to `false`; proceed is a UX/policy concern, not encoded as a boolean gate in types.

### 6.5 `types/logging.ts`

- **`OperatorAction`:** `NO_WARNINGS` | `RETURNED_TO_REVIEW` | `PROCEEDED_WITH_WARNINGS`.
- **`TriggeredWarning`:** compact warning snapshot stored in logs (rule id, severity, message, acknowledged flag).
- **`ErrorLogEntry`:** connects operator/branch/session metadata with validation output and eventual operator decision timestamps.
- **Analytics DTOs:** `ValidationStats`, `TopError`, `EvolutionRecommendation`, `EvolutionStatus`.

---

## 7) Constants and Utilities

### 7.1 `constants/appModes.ts`

Defines **`AppMode`:** `DEMO_MODE` | `RANDOM_MODE` | `MANUAL_MODE` with `DEFAULT_APP_MODE = DEMO_MODE` and `APP_MODE_LABELS`.

**Important:** Comments in this file describe **Manual** mode as “field-level overrides.” The **implemented** Manual UX is **`ManualInjectionPanel`** (rule toggles that mutate OCR output), not a generic form editor. Treat comments as **aspirational** vs the code path in §12.3.

### 7.2 `utils/delay.ts`

- `simulateDelay(minMs, maxMs)` — random wait used to simulate network/processing time.

### 7.3 `utils/idGenerator.ts`

- Generates string IDs using timestamp + counter padding (`Date.now` base-36).

### 7.4 `utils/amountParser.ts`

- `parseAmountFromWords(text)` — parses English/Bangladesh-style amount phrases into `number | null`.
- Covered by `amountParser.test.ts` (Vitest).

### 7.5 `utils/dateValidator.ts`

- Validates ISO dates, staleness vs month threshold, “far future” vs day threshold, and `formatDate` with locale `en-BD`.

### 7.6 `utils/timeAgo.ts`

- Human-readable relative times for dashboard lists.

---

## 8) Mock Data and Simulation Layer

### 8.1 Static OCR datasets (`mock/mockData/`)

**Cheque (`chequeResults.ts`):** `CHEQUE_CLEAN`, `CHEQUE_AMOUNT_MISMATCH`, `CHEQUE_NO_SIGNATURE`, `CHEQUE_STALE_DATE`, `CHEQUE_MULTI_ISSUE`.

**Loan (`loanResults.ts`):** `LOAN_CLEAN`, `LOAN_INCOMPLETE_FIELDS`, `LOAN_NO_GUARANTOR`.

**NID (`nidResults.ts`):** `NID_CLEAN`, `NID_LOW_QUALITY`, `NID_EXPIRED` (dynamic past date where applicable).

### 8.2 Scenario registry (`mock/mockScenarios.ts`)

- Defines `MockScenario` records keyed in `MOCK_SCENARIOS`.
- Fields include `expectedWarningIds` and a `badge`: `CLEAN` | `WARNING` | `CRITICAL`.
- **`SCENARIO_LIST`** and `getScenariosForDocumentType(documentType)` filter scenarios for the demo selector.

**Count:** **11** scenarios (5 cheque, 3 loan, 3 NID) in the exported record.

### 8.3 Classifier (`mock/mockClassifier.ts`)

- `mockClassify(documentType)` — delays ~200–400ms; does not change state; acts as pipeline step 1.

### 8.4 Image quality (`mock/mockImageQuality.ts`)

- `assessImageQuality(file)` — produces synthetic quality metrics (used in data construction paths; pipeline primarily relies on embedded OCR results).

### 8.5 Signature detection (`mock/mockSignatureDetection.ts`)

- `mockSignatureDetection(options)` — produces a `SignatureDetectionResult`.

### 8.6 OCR orchestration (`mock/mockOCR.ts`) — core behavioral hub

**Exported function:** `mockOCRExtract(file, documentType, scenarioId?, mode, manualInjections?)`

**Delays:** waits ~900–1500ms before returning.

**Mode behavior:**

1. **`RANDOM_MODE`:** builds a synthetic `MockOCRResult` via `generateRandomOCRResult(documentType)`:
   - Randomizes confidences, amounts, dates, signature presence, etc.
   - Uses a **cheque-like `ChequeFields` object** for all document types in random mode for simplicity; rules still narrow by type.
   - Introduces **~30%** probability of amount mismatch between numeric and parsed written amounts.
2. **Scenario selected:** if `scenarioId` exists in `MOCK_SCENARIOS`, returns that scenario’s `ocrResult` **verbatim** (Demo mode’s primary path).
3. **Otherwise:** uses `getCleanScenario(documentType)` which maps:
   - `CHEQUE` → `CHEQUE_CLEAN`
   - `LOAN_FORM` → `LOAN_CLEAN`
   - `NID` → `NID_CLEAN`
   - `ACCOUNT_OPENING_FORM` → **`LOAN_CLEAN` OCR** (reused template)
   - `UNKNOWN` → `CHEQUE_CLEAN`

**`MANUAL_MODE`:** starts from the clean scenario for the document type, clones it, then applies **`applyManualInjections`**:

- Mutates cloned OCR fields to **force** conditions that trigger selected rules (e.g. set `writtenAmountParsed` to break amount equality, flip signature boolean, set stale dates, blank payee, empty mandatory loan fields, weaken guarantor signature, lower NID image score, set expired NID date).

**Important:** Manual injections are **orthogonal** to `ruleStore` toggles: injections make OCR “bad,” but a rule must still be **enabled** in `ruleStore` to appear in validation.

### 8.7 Historical seed (`mock/historicalLog.ts`)

- Exports `historicalLog` array (~50 entries) used to seed `logStore`.
- Rotates synthetic operator ids and branch codes; uses plausible `workflowType` strings and mixes document types.

---

## 9) Validation Engine

### 9.1 Registry (`engine/RuleRegistry.ts`)

- `ALL_RULES`: **8** `ValidationRule` objects (imports from `src/rules/**`).
- `getRuleById(id)`
- `getRulesForDocument(documentType, enabledRuleIds)` — filters **both** by document type membership **and** presence of rule id in `enabledRuleIds`.

**Separation of concerns:** This module **must not** import Zustand stores. Callers pass enabled ids explicitly.

### 9.2 Executor (`engine/RuleExecutor.ts`)

- `runAllRules(rules, ocrResult)` maps each rule to a `ValidationResult`.
- **Fail-open behavior:** If `rule.validate` throws, the executor logs a warning and returns `passed: true` with `executionError` populated—**no warning** is generated for that rule.

### 9.3 Report builder (`engine/ReportBuilder.ts`)

- `buildReport(results, documentType, ocrResult)`:
  - Collects warnings from failed rules.
  - Sorts warnings **HIGH → MEDIUM → LOW**.
  - Computes average OCR confidence from `ocrResult.confidence.perField` values, falling back to `overall` if the map is empty.

### 9.4 Orchestrator (`engine/ValidationEngine.ts`)

- `runValidation(ocrResult, documentType, enabledRuleIds)` — the single entry point used by the UI pipeline:
  1. Resolve active rules via registry.
  2. Execute all rules.
  3. Build `DocumentValidationReport`.

---

## 10) Rule Modules (`src/rules/`)

Each rule is a `ValidationRule` object. Below is behavior-oriented summary.

### 10.1 Cheque (`rules/cheque/`)

| File | ID | Severity | Behavior summary |
| --- | --- | --- | --- |
| `amountMismatch.ts` | `CHQ_AMOUNT_MISMATCH` | HIGH | Compares `numericAmount` vs `writtenAmountParsed`; passes if either amount null; guarded by `isChequeFields`. Covered by `amountMismatch.test.ts`. |
| `signatureMissing.ts` | `CHQ_SIGNATURE_MISSING` | HIGH | Fails if signature detection says not present. |
| `dateInvalid.ts` | `CHQ_DATE_INVALID` | MEDIUM | Unreadable date, stale beyond threshold, or far-future beyond threshold (via `dateValidator`). |
| `payeeBlank.ts` | `CHQ_PAYEE_BLANK` | HIGH | Detects missing/blank payee. |

### 10.2 Loan (`rules/loan/`)

| File | ID | Severity | Behavior summary |
| --- | --- | --- | --- |
| `mandatoryFields.ts` | `LOAN_MANDATORY_FIELDS` | HIGH | Aggregates missing mandatory fields list. |
| `guarantorMissing.ts` | `LOAN_GUARANTOR_MISSING` | MEDIUM | Requires guarantor section present and signed. |

### 10.3 NID (`rules/nid/`)

| File | ID | Severity | Behavior summary |
| --- | --- | --- | --- |
| `imageQualityLow.ts` | `NID_IMAGE_QUALITY` | MEDIUM | Fails if overall image quality below threshold. |
| `expiryCheck.ts` | `NID_EXPIRY` | LOW | Smart NID (`expiryDate === null`) passes; past expiry fails. |

**Note:** `ACCOUNT_OPENING_FORM` has **no dedicated rules** in `ALL_RULES`; workflows in the UI never select it today.

---

## 11) Global State Management (Zustand)

There is **no** `src/store/index.ts` barrel; screens import stores directly.

### 11.1 `store/appStore.ts`

| State | Description |
| --- | --- |
| `mode` | `AppMode` |
| `operatorId` | Synthetic operator string |
| `branchCode` | Synthetic branch code |
| `sessionId` | Generated once at store creation |

| Actions | Description |
| --- | --- |
| `setMode` | Switch Demo/Random/Manual |
| `setOperatorId` | Change operator id for log entries |

### 11.2 `store/ruleStore.ts`

| State | Description |
| --- | --- |
| `enabledRuleIds` | `Record<string, boolean>` seeded from each rule’s static `enabled` flag |

| Actions | Description |
| --- | --- |
| `toggleRule(id)` | Flip boolean |
| `enableAll` / `disableAll` | Bulk |
| `getEnabledIds()` | Returns list of ids whose value is `true` |

### 11.3 `store/documentStore.ts`

| State | Description |
| --- | --- |
| `selectedFile` | Last picked `File` |
| `documentType` | Active document type |
| `selectedScenarioId` | Demo scenario key or `null` for “default/clean” |
| `manualInjections` | `string[]` of rule ids to force via OCR mutation in Manual mode |
| `imagePreviewUrl` | Object URL for preview |
| `workflowType` | Last workflow or `null` |

| Actions | Description |
| --- | --- |
| `setFile` | Revokes previous object URL, sets new file + URL |
| `setDocumentType` | Sets document type only |
| `setScenario` / `clearScenario` | Scenario selection |
| `setManualInjections` | Replace injection list |
| `setWorkflow` | Sets workflow, **maps document type**, clears `selectedScenarioId` and **`manualInjections`** |
| `clearDocument` | Clears file, url, scenario, **manual injections** |

### 11.4 `store/validationStore.ts`

| State | Description |
| --- | --- |
| `isProcessing` | Pipeline running |
| `processingStep` | `0 \| 1 \| 2 \| 3 \| 4` |
| `currentReport` | Latest `DocumentValidationReport` |
| `currentOCRResult` | Latest `MockOCRResult` or `null` |
| `currentLogEntryId` | Binds UI flows to a specific `ErrorLogEntry` |
| `processingError` | String or `null` — **exists** but pipeline hook does not currently call `setError` |

| Actions | Description |
| --- | --- |
| `startProcessing` | Sets processing flags |
| `setProcessingStep` | Updates step index |
| `setResult` | Saves report + OCR, clears `isProcessing` |
| `setCurrentLogEntryId` | Stores log entry correlation id |
| `setError` | Would mark error state (unused by current pipeline) |
| `clearResult` | Resets report/OCR/step/log id |

### 11.5 `store/logStore.ts`

| State | Description |
| --- | --- |
| `entries` | Initialized from `[...historicalLog]` copy |

| Writes | Description |
| --- | --- |
| `addEntry` | Appends a new entry; injects `id`, `timestamp`, `sessionId` from `appStore` |
| `updateEntryAction` | Sets `operatorAction` + `proceedTimestamp` |
| `markWarningAcknowledged` | Updates nested warnings + `acknowledgedWarningIds` |

| Reads (derived) | Description |
| --- | --- |
| `getStats` | Aggregates totals, STP rate, proceed-with-warnings rate, histograms |
| `getTopErrors(limit?)` | Sorts rule frequency using `ALL_RULES` for severity fallback |
| `getEvolutionRecommendations` | Returns **hard-coded** roadmap items (not computed from data) |

---

## 12) Hooks (`src/hooks/`)

### 12.1 `useDocumentValidation.ts`

**Exports:** `{ runValidationPipeline }`.

**Pipeline steps:**

1. `validationStore.startProcessing()`
2. Step 1: `mockClassify(documentType)`
3. Step 2: `mockOCRExtract(selectedFile, documentType, selectedScenarioId, appMode, manualInjections)`
4. Step 3: `simulateDelay` then `runValidation` with `ruleStore.getEnabledIds()`
5. Step 4: delay then `validationStore.setResult(report, ocrResult)`
6. `logStore.addEntry(...)`:
   - `NO_WARNINGS` if `warningCount === 0`
   - Else **`RETURNED_TO_REVIEW`** (conservative default until confirm)
7. `validationStore.setCurrentLogEntryId`
8. `navigate('/result')`

**Error handling:** On any thrown error, logs to console, synthesizes a **fallback report** with synthetic rule id `SYSTEM_PIPELINE_ERROR`, still logs a `RETURNED_TO_REVIEW` entry, and navigates to `/result`. **It does not call `validationStore.setError`.**

**Commentary block** at top of file documents the logging semantics for operator actions.

### 12.2 `useLogProceed.ts`

- `recordProceedDecision()` upgrades log entry to `PROCEEDED_WITH_WARNINGS`, sets timestamp, marks **all** warnings in `currentReport` acknowledged via `markWarningAcknowledged`.

### 12.3 `useErrorLog.ts`

- Read adapter exposing entries, stats, top errors, evolution recommendations, and a `recentEntries` slice for side panel.

### 12.4 `useScenario.ts`

- Wires `ScenarioSelector` to `MOCK_SCENARIOS` + `documentStore`.

### 12.5 `useCountUp.ts`

- RAF-based numeric animation for dashboard metrics.

---

## 13) UI Components (by folder)

### 13.1 Layout (`components/layout/`)

| Component | Responsibility |
| --- | --- |
| `MobileContainer.tsx` | Desktop 3-column shell; phone frame; hosts `StatusBar`, scroll region, `BottomNav`; side panels show branding and live stats via `useErrorLog`. |
| `StatusBar.tsx` | Decorative phone status row. |
| `AppModeSwitcher.tsx` | Switches `appStore.mode` with badges for Random/Manual. |
| `BottomNav.tsx` | Home + Dashboard links; conditional hide rules (see §4.4). |
| `AppHeader.tsx` | Title/back navigation helper. |

### 13.2 Common (`components/common/`)

| Component | Notes |
| --- | --- |
| `Button.tsx` | Variants/sizes, loading/disabled, optional icon, Framer tap scale |
| `Badge.tsx` | Small label chip |
| `Card.tsx` | Container |
| `Modal.tsx` | Modal primitive |

### 13.3 Upload (`components/upload/`)

| Component | Responsibility |
| --- | --- |
| `ScenarioSelector.tsx` | Collapsible “Demo Scenario” panel. **Note:** `UploadScreen` only mounts this in **`DEMO_MODE`**, so internal branches for other modes are **unreachable** in current wiring. Inside, `RANDOM_MODE` would show “scenarios disabled” if ever mounted. |
| `MockDocumentPicker.tsx` | **Demo only:** horizontal cards fetching SVG mock assets from `/public`, builds `File`, sets document type, optionally clears scenario when switching types, sets file, navigates to `/processing` after 700ms. |
| `ManualInjectionPanel.tsx` | **Manual only:** lists applicable `ALL_RULES` for current `documentType`; toggles inject **forced OCR mutations** via `manualInjections`. |
| `DropZone.tsx` | Drag/drop + file picker; validates **images**, **SVG**, **HEIC** by extension/type; 10MB max; on success sets file and navigates `/processing` after 700ms. |
| `ImageThumbnail.tsx` | Preview selected file |
| `MockDocumentPlaceholder.tsx` | Renders stylized document preview for overlay alignment |

### 13.4 Processing (`components/processing/`)

| Component | Responsibility |
| --- | --- |
| `ProcessingSteps.tsx` | Visual stepper for pipeline steps 1–4 with icons and animations |

### 13.5 Validation (`components/validation/`)

| Component | Responsibility |
| --- | --- |
| `PassBanner.tsx` | Success path UI |
| `WarningPanel.tsx` | Lists warnings via `WarningCard`, sticky footer actions: Review (`/result/review`), Proceed (`/result/confirm`) |
| `WarningCard.tsx` | Expand/collapse; acknowledges on expand when log id exists; navigates to **`/result/warning/:ruleId`** via “View in Document →” |
| `SeverityBadge.tsx` | Severity styling |
| `AnnotatedImageOverlay.tsx` | Draws bounding boxes from warnings atop `MockDocumentPlaceholder` |

### 13.6 Dashboard (`components/dashboard/`)

| Component | Responsibility |
| --- | --- |
| `StatsGrid.tsx` | Four KPI tiles with `useCountUp` |
| `TopErrorsChart.tsx` | Horizontal bar chart of frequent rules |
| `StpGauge.tsx` | Circular STP gauge |
| `RecentActivityList.tsx` | Latest log lines |
| `RuleToggleList.tsx` | Grouped toggles with `ruleStore` |

---

## 14) Screens (`src/screens/`)

| Screen | Behavior |
| --- | --- |
| `HomeScreen.tsx` | Navigates to `/upload/:workflowType` for three workflows. |
| `UploadScreen.tsx` | On param change, `setWorkflow`. Renders `ScenarioSelector` **only if `DEMO_MODE`**. Renders `ManualInjectionPanel` **only if `MANUAL_MODE`**. Renders `MockDocumentPicker` **only in `DEMO_MODE`** (with “or upload your own” separator). Always renders `DropZone`. |
| `ProcessingScreen.tsx` | On mount (once, ref-guarded), runs `runValidationPipeline()`. Step subtitles mention “8 validation checks” (matches 8 rules max). If `processingError` is set, shows failure UI with **Try Again** navigating to `/upload` (**note:** no route match for bare `/upload` in router—likely navigates to non-existent route unless app is hosted with redirect; worth fixing if observed). |
| `ResultScreen.tsx` | Redirects `/` if no report and not processing and no error; renders `PassBanner` vs `WarningPanel`. |
| `WarningDetailScreen.tsx` | Route param `ruleId`; finds warning in `currentReport`. Shows full message/detail/suggested action; optional “View in Document” if `boundingBox` present (navigates to review with `highlightRuleId` state); “Proceed Anyway” to `/result/confirm`. |
| `ReviewScreen.tsx` | Requires `currentReport`; resolves document type from OCR result vs report vs store; shows `AnnotatedImageOverlay` with optional `highlightRuleId` from `location.state`. |
| `ConfirmProceedScreen.tsx` | Overlay modal; confirm calls `recordProceedDecision`, shows success animation, returns home after delay. |
| `DashboardScreen.tsx` | Analytics-only view using `useErrorLog`. |
| `RuleManagerScreen.tsx` | Bulk enable/disable + `RuleToggleList`. |

---

## 15) End-to-End Flows

### Flow A — Demo scenario → processing → result

1. Operator chooses workflow on `HomeScreen`.
2. `UploadScreen` sets workflow + document type; in Demo mode selects a **scenario chip** (`selectedScenarioId`).
3. Operator uploads a file **or** uses `MockDocumentPicker` (fetches SVG → `File`).
4. `DropZone` or picker navigates to `/processing`.
5. `useDocumentValidation` runs; OCR returns **scenario payload** if id set and valid.
6. Validation runs with **enabled** rules only.
7. Logs entry + navigates `/result`.

### Flow B — Random mode stress

1. Switch to Random in `AppModeSwitcher`.
2. `UploadScreen` hides demo-only controls; operator uploads any allowed image.
3. `mockOCRExtract` returns **`generateRandomOCRResult`** — synthetic diversity, including probabilistic amount mismatch.

### Flow C — Manual injection testing

1. Switch to Manual mode.
2. Toggle one or more **Manual Error Injection** switches.
3. OCR layer applies **`applyManualInjections`** on top of **clean** baseline for that document type.
4. Validation produces warnings if corresponding rules remain **enabled** in `ruleStore`.

### Flow D — Warning drill-down

1. `WarningPanel` lists warnings.
2. Expand card → acknowledges (if log id exists).
3. “View in Document →” navigates to **`/result/warning/:ruleId`** (full detail page).
4. From detail, optionally open annotated review (`/result/review` with highlight) if bounding box exists.
5. Proceed path: `WarningPanel` footer or detail page → `/result/confirm` → `useLogProceed` updates log to `PROCEEDED_WITH_WARNINGS`.

### Flow E — Analytics + rule governance

1. `DashboardScreen` reads derived stats from in-memory `logStore`.
2. `RuleManagerScreen` mutates `ruleStore` only; static `ALL_RULES` definitions remain immutable.

---

## 16) Cross-Module Dependency Map (High Signal)

- **`App.tsx`** wires routes → **screens** → **hooks/stores/components**.
- **`useDocumentValidation`** is the **only** production orchestration path for validation; it depends on mock layer + engine + all relevant stores.
- **`engine/*`** depends on **`rules/*` + `types`** only (no React, no Zustand).
- **`ruleStore`** depends on static `ALL_RULES` metadata for seeding and labels.
- **`logStore.addEntry`** reads **`appStore.getState().sessionId`** imperatively (cross-store coupling).
- **`ManualInjectionPanel`** imports **`ALL_RULES`** directly to enumerate toggles.
- **`MockDocumentPicker`** imports **`MOCK_SCENARIOS`** only for **labels** when scenario matches document type.

---

## 17) Invariants and Behavioral Constraints

- **`DocumentValidationReport.canProceed` is always `true`** where a report is built through `ReportBuilder` (and in the synthetic pipeline error report).
- **Rule execution is fail-open** on exceptions (no warning for that rule).
- **Operator action semantics:** warnings initially log as `RETURNED_TO_REVIEW` until confirm updates to `PROCEEDED_WITH_WARNINGS` (see hook header comment).
- **Object URLs** for uploads are revoked on replacement/clear to mitigate leaks.
- **`getEvolutionRecommendations` is static content**, not ML-derived.
- **`validationStore.processingError` is currently unused** by the pipeline hook (errors become synthetic warning reports instead).

---

## 18) Known Limitations and Sharp Edges

- **No persistence** across refresh; all state is client-memory only.
- **`ProcessingScreen` “Try Again”** navigates to `/upload`, which is **not** a defined route (only `/upload/:workflowType`). This is a functional rough edge if `processingError` is ever set.
- **`ScenarioSelector`’s internal `RANDOM_MODE` UI** is effectively dead because `UploadScreen` does not mount the component outside `DEMO_MODE`.
- **`constants/appModes.ts` Manual mode comment** does not match the implemented Manual Injection UI.
- **Account opening** document type exists in types but has no workflow route or rules.
- **README** may not reflect real scripts or product name.

---

## 19) Tests

| File | Scope |
| --- | --- |
| `src/utils/amountParser.test.ts` | Bengali-style amount parsing cases |
| `src/rules/cheque/amountMismatch.test.ts` | Amount mismatch rule against mock cheque fixtures |

Run with `npm test` (Vitest).

---

## 20) How to Run and Manual Verification

1. `npm install`
2. `npm run dev` — open the printed local URL
3. Walkthrough:
   - Try each workflow from home.
   - Toggle Demo/Random/Manual and observe upload UI differences.
   - Run a demo scenario + mock document quick path.
   - Trigger warnings and traverse **warning detail** and **review** screens.
   - Confirm proceed and verify dashboard metrics move (in-session).
   - Toggle rules and re-run validation to see warnings disappear when disabled.

**Typecheck:** `npm run build` includes `tsc -b`, or run `npx tsc --noEmit` if configured.

---

## 21) Practical Onboarding Reading Order

1. `src/App.tsx` — routes and layout composition
2. `src/store/*` — understand session + document + validation + logs + rules
3. `src/hooks/useDocumentValidation.ts` — pipeline truth
4. `src/mock/mockOCR.ts` — OCR/scenario/injection behavior
5. `src/engine/*` + `src/rules/*` — business rules
6. `src/screens/*` in user journey order (home → upload → processing → result → warning detail → review → confirm → dashboard)

---

## 22) Complete File Index (`src/`)

**Entry:** `main.tsx`, `App.tsx`, `index.css`, `App.css` (unused import)

**Types:** `types/document.ts`, `types/ocr.ts`, `types/rules.ts`, `types/validation.ts`, `types/logging.ts`, `types/index.ts`

**Constants:** `constants/appModes.ts`

**Utils:** `utils/delay.ts`, `utils/idGenerator.ts`, `utils/amountParser.ts`, `utils/amountParser.test.ts`, `utils/dateValidator.ts`, `utils/timeAgo.ts`

**Mock:** `mock/mockClassifier.ts`, `mock/mockImageQuality.ts`, `mock/mockSignatureDetection.ts`, `mock/mockOCR.ts`, `mock/mockScenarios.ts`, `mock/historicalLog.ts`, `mock/mockData/chequeResults.ts`, `mock/mockData/loanResults.ts`, `mock/mockData/nidResults.ts`

**Engine:** `engine/RuleRegistry.ts`, `engine/RuleExecutor.ts`, `engine/ReportBuilder.ts`, `engine/ValidationEngine.ts`

**Rules:** `rules/cheque/amountMismatch.ts`, `amountMismatch.test.ts`, `dateInvalid.ts`, `payeeBlank.ts`, `signatureMissing.ts`, `rules/loan/mandatoryFields.ts`, `guarantorMissing.ts`, `rules/nid/imageQualityLow.ts`, `expiryCheck.ts`

**Stores:** `store/appStore.ts`, `ruleStore.ts`, `documentStore.ts`, `validationStore.ts`, `logStore.ts`

**Hooks:** `hooks/useDocumentValidation.ts`, `useLogProceed.ts`, `useErrorLog.ts`, `useScenario.ts`, `useCountUp.ts`

**Components:** all files under `components/common`, `components/layout`, `components/upload`, `components/processing`, `components/validation`, `components/dashboard` as listed in §13

**Screens:** `screens/HomeScreen.tsx`, `UploadScreen.tsx`, `ProcessingScreen.tsx`, `ResultScreen.tsx`, `WarningDetailScreen.tsx`, `ReviewScreen.tsx`, `ConfirmProceedScreen.tsx`, `DashboardScreen.tsx`, `RuleManagerScreen.tsx`

**Assets:** `assets/react.svg`, `assets/vite.svg`

---

*End of document — matches repository state at documentation authoring time.*
