# BRAC DVE Session Handoff (Detailed)

This document captures everything implemented during this session, including architecture decisions, created/updated files, behavioral contracts, validations run, and known follow-up notes.

---

## 1) Project Bootstrap and Tooling Setup

### Scaffold
- Created a Vite + React + TypeScript app in the current workspace root (`dve`).

### Installed dependencies
- Runtime:
  - `zustand`
  - `framer-motion`
  - `lucide-react`
  - `react-router-dom`
- Dev:
  - `tailwindcss`
  - `postcss`
  - `autoprefixer`
  - `typescript`

### Tailwind/PostCSS
- Ran `npx tailwindcss init -p`.
- Converted root Tailwind config to typed file:
  - `tailwind.config.ts`
- Kept:
  - `postcss.config.js`

### Tailwind config behavior
- Content paths:
  - `./index.html`
  - `./src/**/*.{ts,tsx}`
- Extended color tokens mapped to CSS variables:
  - `brand-red`
  - `brand-dark`
  - `severity-high`
  - `severity-medium`
  - `severity-low`
  - `status-pass`
  - `text-primary`
  - `text-secondary`
  - `text-muted`
  - `brand-surface`
  - `brand-surface-2`
  - `brand-surface-3`
  - `brand-border`

---

## 2) Global Design System and App Mode Constants

### `src/index.css`
- Replaced starter stylesheet with full design-system CSS:
  - Google font imports (DM Serif Display, Inter, JetBrains Mono)
  - Tailwind directives
  - Full `:root` token set for brand/severity/status/text/fonts/radii
  - Global reset and body base styling
  - Keyframes:
    - `severity-shimmer`
    - `breathe`
    - `orb-drift`
    - `line-fill`
  - Added scroll-hide utility used by phone content area:
    - `.phone-scroll-content { scrollbar-width: none; }`
    - `.phone-scroll-content::-webkit-scrollbar { display: none; }`

### `src/constants/appModes.ts`
- Added mode model:
  - `AppMode = 'DEMO_MODE' | 'RANDOM_MODE' | 'MANUAL_MODE'`
  - `DEFAULT_APP_MODE = 'DEMO_MODE'`
  - `APP_MODE_LABELS`
- Added explanatory JSDoc for all 3 modes and intended behavior.

---

## 3) Type System (Strict TS-Oriented)

Created all core type files and explicit barrel exports:

- `src/types/document.ts`
- `src/types/ocr.ts`
- `src/types/rules.ts`
- `src/types/validation.ts`
- `src/types/logging.ts`
- `src/types/index.ts`

### Highlights
- `DocumentType`, `WorkflowType`, `BoundingBox`.
- OCR model families:
  - `ChequeFields`, `LoanFormFields`, `NIDFields`, `AccountOpeningFields`.
- Rule model:
  - `ValidationRule`, `Severity`, `RuleCategory`.
- Validation report model:
  - `DocumentValidationReport` with literal `canProceed: true`.
- Logging analytics model:
  - `ErrorLogEntry`, `ValidationStats`, `TopError`, `EvolutionRecommendation`, etc.

### Type guards
- Implemented and exported:
  - `isChequeFields`
  - `isLoanFormFields`
  - `isNIDFields`
  - `isAccountOpeningFields`
- Important correction applied later:
  - `isNIDFields` now uses `'backSidePresent' in fields` (unique discriminator).

---

## 4) Utility Layer

Added:
- `src/utils/delay.ts`
  - `simulateDelay(minMs, maxMs)`
- `src/utils/idGenerator.ts`
  - Counter-based ID generation with timestamp prefix
- `src/utils/amountParser.ts`
  - Bangla/English amount-word parser with lakh/crore support
  - Noise token removal (`taka`, `only`, `and`)
  - Safe inline NODE_ENV test block
- `src/utils/dateValidator.ts`
  - `isValidDate`
  - `isStale`
  - `isFarFuture`
  - `formatDate('en-BD')`

---

## 5) Mock Data Foundation (Prompt 03)

Added mock OCR datasets:

- `src/mock/mockData/chequeResults.ts`
  - `CHEQUE_CLEAN`
  - `CHEQUE_AMOUNT_MISMATCH`
  - `CHEQUE_NO_SIGNATURE`
  - `CHEQUE_STALE_DATE`
  - `CHEQUE_MULTI_ISSUE`
- `src/mock/mockData/loanResults.ts`
  - `LOAN_CLEAN`
  - `LOAN_INCOMPLETE_FIELDS`
  - `LOAN_NO_GUARANTOR`
- `src/mock/mockData/nidResults.ts`
  - `NID_CLEAN`
  - `NID_LOW_QUALITY`
  - `NID_EXPIRED`

### Behavior notes
- Dynamic date generation used for stale/expired scenarios.
- Bangladesh-specific names/address context included.
- Field-level confidence values seeded for realistic testing.

---

## 6) Mock AI Layer + Scenario Registry (Prompt 04)

Added:

- `src/mock/mockScenarios.ts`
  - `MockScenario` model
  - `MOCK_SCENARIOS` (11 keyed scenarios)
  - `SCENARIO_LIST` (sorted)
  - `getScenariosForDocumentType()`
- `src/mock/mockSignatureDetection.ts`
  - `mockSignatureDetection(options)`
- `src/mock/mockImageQuality.ts`
  - `assessImageQuality(file)`
- `src/mock/mockClassifier.ts`
  - `mockClassify(documentType)`
- `src/mock/mockOCR.ts`
  - `mockOCRExtract(file, documentType, scenarioId?, mode)`
  - Random mode generation path
  - Clean fallback mapping through scenario registry
- `src/mock/historicalLog.ts`
  - `historicalLog` seeded with 50 structured entries and realistic distributions

### Import-chain correction made
- `mockOCR.ts` no longer directly imports clean samples from `mockData/*`.
- Clean scenarios are sourced via `MOCK_SCENARIOS` mapping only.

---

## 7) Validation Engine (Prompt 05)

Added all rule files:

- `src/rules/cheque/amountMismatch.ts`
- `src/rules/cheque/signatureMissing.ts`
- `src/rules/cheque/dateInvalid.ts`
- `src/rules/cheque/payeeBlank.ts`
- `src/rules/loan/mandatoryFields.ts`
- `src/rules/loan/guarantorMissing.ts`
- `src/rules/nid/imageQualityLow.ts`
- `src/rules/nid/expiryCheck.ts`

Added engine modules:

- `src/engine/RuleRegistry.ts`
- `src/engine/RuleExecutor.ts`
- `src/engine/ReportBuilder.ts`
- `src/engine/ValidationEngine.ts`

### Important compliance fixes applied
- Added required registry comment block clarifying static definitions vs runtime enabled state.
- Added `console.warn` in `RuleExecutor` catch path.
- Confirmed `ALL_RULES` count is 8.

---

## 8) Zustand Stores (Prompt 06)

Created:

- `src/store/appStore.ts`
- `src/store/ruleStore.ts`
- `src/store/documentStore.ts`
- `src/store/validationStore.ts`
- `src/store/logStore.ts`

No `src/store/index.ts` barrel was created (explicitly avoided).

### Key behaviors
- `appStore` holds mode/operator/branch/session.
- `ruleStore` keeps runtime enable-state map and derives enabled IDs.
- `documentStore`:
  - handles workflow-to-document mapping
  - revokes object URLs safely in `setFile` and `clearDocument`
- `validationStore`:
  - processing state + report/OCR
  - added `currentLogEntryId` + setter for orchestration hooks
- `logStore`:
  - seeded from spread copy of `historicalLog`
  - cross-store session read via `useAppStore.getState()`
  - derived analytics + top errors + evolution recommendations

---

## 9) Orchestration Hooks (Prompt 07)

Created:

- `src/hooks/useDocumentValidation.ts`
- `src/hooks/useLogProceed.ts`
- `src/hooks/useErrorLog.ts`
- `src/hooks/useScenario.ts`

### Flow contract implemented
- `useDocumentValidation` drives classify -> OCR -> validate -> report -> log -> navigation.
- For warning reports:
  - conservative default log action is `RETURNED_TO_REVIEW`
  - promoted to `PROCEEDED_WITH_WARNINGS` via `useLogProceed` on confirmation.
- `useScenario` centralizes scenario filtering and selection operations.

---

## 10) Layout Shell + App Router + Base UI Components (Prompt 08)

### Layout components created
- `src/components/layout/StatusBar.tsx`
- `src/components/layout/AppModeSwitcher.tsx`
- `src/components/layout/MobileContainer.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/AppHeader.tsx` (added for UploadScreen spec)

### Common components created
- `src/components/common/Button.tsx`
- `src/components/common/Badge.tsx`
- `src/components/common/Card.tsx`
- `src/components/common/Modal.tsx`

### App router
- Replaced placeholder app with routed shell in:
  - `src/App.tsx`
- Uses:
  - `createBrowserRouter`
  - lazy-loaded 8 screens
  - `MobileContainer` root wrapper
  - `AnimatePresence` + exported `PageTransition`

### Screen scaffolding added to satisfy lazy imports
- `src/screens/HomeScreen.tsx`
- `src/screens/UploadScreen.tsx`
- `src/screens/ProcessingScreen.tsx`
- `src/screens/ResultScreen.tsx`
- `src/screens/ReviewScreen.tsx`
- `src/screens/ConfirmProceedScreen.tsx`
- `src/screens/DashboardScreen.tsx`
- `src/screens/RuleManagerScreen.tsx`

---

## 11) Upload UX and Scenario Controls (Prompt 10)

Created/updated:

- `src/components/upload/ScenarioSelector.tsx`
- `src/components/upload/DropZone.tsx`
- `src/screens/UploadScreen.tsx` (rewritten to new structure)

### UploadScreen behavior
- Reads `workflowType` from route params.
- Calls `documentStore.setWorkflow(...)` in `useEffect`.
- Shows:
  - `AppHeader` (workflow-specific title)
  - `ScenarioSelector` (only in DEMO/MANUAL)
  - `DropZone`
  - `BottomNav`

### ScenarioSelector behavior
- Collapsible panel (default collapsed).
- Uses `useScenario(documentType)` for scenario data/actions.
- Random mode disables scenario interaction message.
- Chip list with severity dots and selected/unselected styles.
- Expected warning preview + reset flow.

### DropZone behavior
- Three states: `IDLE`, `DRAG_OVER`, `FILE_SELECTED`.
- Drag and drop handlers with preventDefault.
- File validation:
  - image/* or `.heic`
  - max 10MB
- Inline error messaging.
- On valid selection:
  - sets file into store
  - waits 700ms
  - navigates to `/processing`

---

## 12) Mock Document Visual Components (Prompt 09)

Created:

- `src/components/upload/MockDocumentPlaceholder.tsx`
- `src/components/upload/ImageThumbnail.tsx`

### Placeholder support
- Supports 4 document types:
  - `CHEQUE`
  - `LOAN_FORM`
  - `NID`
  - `ACCOUNT_OPENING_FORM`
- Supports sizes:
  - `thumbnail`
  - `full`
- CSS-only rendering (no canvas/external images).

### Calibration fix applied
- Adjusted CHEQUE payee underline to align with rule bbox horizontal region:
  - `left: '8%'`
  - `width: '50%'`

---

## 13) Audit-Fix Passes Completed in Session

The following audit-driven fixes were applied exactly:

1. `src/engine/RuleRegistry.ts`
   - Added required explanatory comment block above `ALL_RULES`.

2. `src/engine/RuleExecutor.ts`
   - Added `console.warn` in catch path with rule id and error object.

3. `src/types/ocr.ts`
   - Updated `isNIDFields` discriminator to `'backSidePresent' in fields`.

4. `src/mock/mockOCR.ts`
   - Removed direct mockData clean imports.
   - Uses `MOCK_SCENARIOS` mapping for clean scenario fallback.

5. `src/components/layout/MobileContainer.tsx`
   - `gridTemplateColumns` changed to `'auto 1fr auto'`.

6. `src/components/upload/MockDocumentPlaceholder.tsx`
   - CHEQUE payee underline adjusted for bbox alignment.

7. `src/components/layout/BottomNav.tsx`
   - Added `/result/review` to hidden-route list.

8. `tsconfig.app.json`
   - Added `"strict": true`.

---

## 14) TypeScript / Runtime Verification History

Repeatedly executed throughout session:

- `npx tsc --noEmit`
  - Final state: passes with no output.

- `npm run dev`
  - Server starts successfully; port auto-incremented when occupied (5173 -> 5174/5175/5176 depending on run).

Additional sanity checks run:
- Verified `ruleStore.getEnabledIds()` initial count is 8 and includes expected IDs.
- Verified stats update path by adding an entry to log store (processed-doc count increments).
- Verified workflow mapping:
  - `cheque-processing` -> `CHEQUE`
  - `loan-application` -> `LOAN_FORM`
  - `kyc-verification` -> `NID`
- Verified scenario counts by doc type:
  - CHEQUE: 5
  - LOAN_FORM: 3
  - NID: 3

---

## 15) Current Architecture Snapshot

- **Types-first domain model** under `src/types`.
- **Pure rule engine** under `src/engine` and `src/rules`.
- **Mock AI + scenarios** under `src/mock`.
- **State management** via 5 Zustand stores under `src/store`.
- **Orchestration hooks** under `src/hooks`.
- **Desktop demo shell + phone frame** under `src/components/layout`.
- **Upload experience** under `src/components/upload`.
- **Route-driven app shell** in `src/App.tsx` with lazy screen loading.

---

## 16) Notes for Next Prompt / Next Engineer

- `PageTransition` is exported in `App.tsx`; ensure later screens actually wrap root content with it where intended.
- App is now strict TypeScript (`tsconfig.app.json` has `"strict": true`), so future additions must satisfy strict checks.
- Avoid creating `src/store/index.ts` wildcard barrel (explicitly constrained).
- Preserve current cross-store pattern:
  - Allowed: `SomeStore.getState()` usage for reads
  - Avoid store hook calls inside store actions.
- Preserve mock fallback chain:
  - `mockOCR.ts` clean scenarios must stay sourced via `MOCK_SCENARIOS`.

---

## 17) File Creation/Update Coverage (Session)

### Root
- `tailwind.config.ts` (created)
- `postcss.config.js` (generated by CLI)
- `tsconfig.app.json` (updated: strict true)
- `handoff.md` (this file)

### `src/constants`
- `appModes.ts` (created)

### `src/types`
- `document.ts` (created)
- `ocr.ts` (created + guard fix)
- `rules.ts` (created)
- `validation.ts` (created)
- `logging.ts` (created)
- `index.ts` (created)

### `src/utils`
- `delay.ts` (created)
- `idGenerator.ts` (created)
- `amountParser.ts` (created)
- `dateValidator.ts` (created)

### `src/mock`
- `mockData/chequeResults.ts` (created)
- `mockData/loanResults.ts` (created)
- `mockData/nidResults.ts` (created)
- `mockScenarios.ts` (created)
- `mockSignatureDetection.ts` (created)
- `mockImageQuality.ts` (created)
- `mockClassifier.ts` (created)
- `mockOCR.ts` (created + import-chain fix)
- `historicalLog.ts` (created)

### `src/rules`
- `cheque/amountMismatch.ts` (created)
- `cheque/signatureMissing.ts` (created)
- `cheque/dateInvalid.ts` (created)
- `cheque/payeeBlank.ts` (created)
- `loan/mandatoryFields.ts` (created)
- `loan/guarantorMissing.ts` (created)
- `nid/imageQualityLow.ts` (created)
- `nid/expiryCheck.ts` (created)

### `src/engine`
- `RuleRegistry.ts` (created + comment block fix)
- `RuleExecutor.ts` (created + console.warn fix)
- `ReportBuilder.ts` (created)
- `ValidationEngine.ts` (created)

### `src/store`
- `appStore.ts` (created)
- `ruleStore.ts` (created)
- `documentStore.ts` (created)
- `validationStore.ts` (created + currentLogEntryId support)
- `logStore.ts` (created)

### `src/hooks`
- `useDocumentValidation.ts` (created)
- `useLogProceed.ts` (created)
- `useErrorLog.ts` (created)
- `useScenario.ts` (created)

### `src/components/layout`
- `StatusBar.tsx` (created)
- `AppModeSwitcher.tsx` (created)
- `MobileContainer.tsx` (created + grid column fix)
- `BottomNav.tsx` (created + hidden path fix)
- `AppHeader.tsx` (created)

### `src/components/common`
- `Button.tsx` (created)
- `Badge.tsx` (created)
- `Card.tsx` (created)
- `Modal.tsx` (created)

### `src/components/upload`
- `MockDocumentPlaceholder.tsx` (created + payee alignment fix)
- `ImageThumbnail.tsx` (created)
- `ScenarioSelector.tsx` (created)
- `DropZone.tsx` (created)

### `src/screens`
- `HomeScreen.tsx` (created)
- `UploadScreen.tsx` (created then replaced with spec-compliant workflow/screen composition)
- `ProcessingScreen.tsx` (created)
- `ResultScreen.tsx` (created)
- `ReviewScreen.tsx` (created)
- `ConfirmProceedScreen.tsx` (created)
- `DashboardScreen.tsx` (created)
- `RuleManagerScreen.tsx` (created)

### Other core
- `src/App.tsx` (replaced with router shell and lazy routes)
- `src/index.css` (replaced with design system + phone scrollbar hiding styles)

---

## End of Handoff

If you want, I can generate a second `handoff-dev.md` that is shorter and task-oriented (what to do next, known technical debt, and acceptance checks), while keeping this file as the full historical ledger.

---

## 18) Session Continuation Update (Prompts 11-15 + Remediation)

This section captures all work completed after the original handoff was written.

### 18.1 Processing Flow UI (Prompt 11)

Added:
- `src/components/processing/ProcessingSteps.tsx` (new)

Updated:
- `src/screens/ProcessingScreen.tsx`

Implemented:
- React 18 Strict Mode guard for pipeline:
  - `useRef(false)` guard
  - check -> set true -> `runValidationPipeline()`
  - effect dependency array remains `[]`
- Full processing visual treatment:
  - atmospheric radial orb (`rgba(200,16,46,0.15)`, `400x400`, off-screen)
  - `breathe 2.5s infinite alternate`
  - doc-type chip, title, dynamic step subtitle mapping
- Stepper contract in `ProcessingSteps`:
  - 4 steps with required labels/icons
  - pending/active/complete visual states
  - active loader spin, complete spring check animation
  - connector color/transition behavior
  - entry animation (`y: 30 -> 0`, `opacity: 0 -> 1`)
- Error state includes:
  - `AlertTriangle` indicator
  - error message
  - `Try Again` action to `/upload`

### 18.2 Result + Validation Components (Prompt 12)

Added:
- `src/components/validation/PassBanner.tsx`
- `src/components/validation/WarningPanel.tsx`
- `src/components/validation/WarningCard.tsx`
- `src/components/validation/SeverityBadge.tsx`

Updated:
- `src/screens/ResultScreen.tsx`

Implemented:
- Result branching logic:
  - null report + error -> failure panel with retry to `/upload/cheque-processing`
  - null report + not processing -> redirect `/`
  - `PASS` -> `PassBanner`
  - `WARNINGS` -> `WarningPanel`
- `PassBanner`:
  - SVG draw-on check animation
  - 3 stat chips (rules checked, OCR %, doc type)
  - proceed action to `/`
- `WarningPanel`:
  - severity summary chips (only when count > 0)
  - staggered warning card entrance
  - sticky action footer (`/result/review`, `/result/confirm`)
- `WarningCard`:
  - default expand by severity
  - first-render-only high severity shimmer
  - on-expand acknowledgement logging via `markWarningAcknowledged`
  - deep-link to review with `highlightRuleId`

Final nav behavior:
- `ResultScreen` does **not** render screen-local `BottomNav`.
- Global nav exclusion now handles `/result` (see section 18.6).

### 18.3 Review + Proceed Confirmation (Prompt 13)

Added:
- `src/components/validation/AnnotatedImageOverlay.tsx`

Updated:
- `src/screens/ReviewScreen.tsx`
- `src/screens/ConfirmProceedScreen.tsx`

Implemented:
- `ReviewScreen`:
  - `PageTransition`
  - `AppHeader` ("Document Review")
  - highlight rule from `location.state?.highlightRuleId`
  - annotated overlay over `MockDocumentPlaceholder`
- `AnnotatedImageOverlay`:
  - bbox overlays from `%` coordinates
  - severity-tinted box styling
  - highlight pulse + thicker border for selected rule
  - label tags and legend row
  - staggered fade-in
- `ConfirmProceedScreen`:
  - uses `useLogProceed()`
  - compliance warning summary
  - confirm flow:
    1) `recordProceedDecision()`
    2) local success state
    3) delayed `navigate('/')` after 1500ms
  - overlay refactor for layout safety:
    - replaced `position: fixed` pattern with `minHeight: '100vh'` flex-centered container

### 18.4 Dashboard Analytics (Prompt 14)

Added:
- `src/components/dashboard/StatsGrid.tsx`
- `src/components/dashboard/TopErrorsChart.tsx`
- `src/components/dashboard/StpGauge.tsx`
- `src/components/dashboard/RecentActivityList.tsx`
- `src/hooks/useCountUp.ts`
- `src/utils/timeAgo.ts`

Updated:
- `src/screens/DashboardScreen.tsx`
- `src/components/layout/AppHeader.tsx` (subtitle support)

Implemented:
- Dashboard consumes data through `useErrorLog()` only.
- Sections rendered:
  1. stats grid
  2. top issues chart
  3. STP gauge
  4. recent activity
  5. evolution recommendations
- Count-up animation via custom `useCountUp`.
- Time labels via `timeAgo`.
- Recommendation card action uses shared component:
  - `<Button variant="ghost" size="sm" disabled>Add Rule</Button>`

### 18.5 Rule Manager + Rule Toggles (Prompt 15)

Added:
- `src/components/dashboard/RuleToggleList.tsx`

Updated:
- `src/screens/RuleManagerScreen.tsx`

Implemented:
- Screen-level import and pass-through of rule definitions:
  - `ALL_RULES` imported from `RuleRegistry`
  - passed as prop: `<RuleToggleList rules={ALL_RULES} />`
- `RuleToggleList` now receives `rules: ValidationRule[]` prop (no internal `ALL_RULES` import)
- Grouped category sections, expandable cards, toggle switch, enabled-state notice
- Top actions:
  - Enable All -> `ruleStore.enableAll()`
  - Disable All -> `ruleStore.disableAll()`

### 18.6 Final Integration/Polish Alignment

Updated:
- `src/App.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/UploadScreen.tsx`
- `src/screens/ProcessingScreen.tsx`
- `src/screens/ResultScreen.tsx`
- `src/screens/ReviewScreen.tsx`
- `src/screens/ConfirmProceedScreen.tsx`
- `src/screens/DashboardScreen.tsx`
- `src/screens/RuleManagerScreen.tsx`
- `src/components/upload/ScenarioSelector.tsx`
- `src/components/validation/WarningCard.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/MobileContainer.tsx`

Implemented/finalized:
- `PageTransition` wrappers across required screens.
- `ProcessingScreen` uses `PageTransition disableExit`.
- Tap feedback:
  - `Button` remains `whileTap={{ scale: 0.97 }}`
  - tappable workflow/scenario/warning rows use `whileTap={{ scale: 0.98 }}`
- Navigation strategy normalized:
  - `BottomNav` rendered globally in `MobileContainer`
  - removed duplicate screen-local `BottomNav` renders
  - hidden routes include:
    - `/processing`
    - `/result`
    - `/result/confirm`
    - `/result/review`
- Branding text update in side panel:
  - `BRAC` -> `BRAC Bank`

### 18.7 Verification Log (Continuation)

Executed repeatedly after each implementation/fix cycle:
- `npx tsc --noEmit`
  - final status: passes with no output.
- `npm run dev`
  - final observed local URL: `http://localhost:5177/` (port auto-shifts if occupied).

---

## 19) Updated File Coverage (Continuation Session)

### Added (new in continuation)
- `src/components/processing/ProcessingSteps.tsx`
- `src/components/validation/PassBanner.tsx`
- `src/components/validation/WarningPanel.tsx`
- `src/components/validation/WarningCard.tsx`
- `src/components/validation/SeverityBadge.tsx`
- `src/components/validation/AnnotatedImageOverlay.tsx`
- `src/components/dashboard/StatsGrid.tsx`
- `src/components/dashboard/TopErrorsChart.tsx`
- `src/components/dashboard/StpGauge.tsx`
- `src/components/dashboard/RecentActivityList.tsx`
- `src/components/dashboard/RuleToggleList.tsx`
- `src/hooks/useCountUp.ts`
- `src/utils/timeAgo.ts`

### Updated (continuation)
- `src/App.tsx` (PageTransition `disableExit`)
- `src/index.css` (additional keyframe update during iteration)
- `src/components/layout/AppHeader.tsx` (subtitle)
- `src/components/layout/BottomNav.tsx` (route visibility updates)
- `src/components/layout/MobileContainer.tsx` (brand text update)
- `src/components/upload/ScenarioSelector.tsx` (chip tap motion)
- `src/components/validation/WarningCard.tsx` (tap motion + behavior refinements)
- `src/screens/HomeScreen.tsx`
- `src/screens/UploadScreen.tsx`
- `src/screens/ProcessingScreen.tsx`
- `src/screens/ResultScreen.tsx`
- `src/screens/ReviewScreen.tsx`
- `src/screens/ConfirmProceedScreen.tsx`
- `src/screens/DashboardScreen.tsx`
- `src/screens/RuleManagerScreen.tsx`
- `handoff.md` (this update)
