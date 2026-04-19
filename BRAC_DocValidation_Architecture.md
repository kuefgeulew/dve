# BRAC Bank — Centralized AI-Powered Document Validation Engine
## System Architecture & Implementation Blueprint (v1.0)

> **Classification:** Internal Technical Architecture  
> **Build Target:** React + Vite, Frontend-Only Prototype  
> **Audience:** Cursor AI / Senior Frontend Engineers  
> **Status:** Implementation-Ready

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Global Research Findings](#2-global-research-findings)
3. [System Philosophy](#3-system-philosophy)
4. [End-to-End User Flow](#4-end-to-end-user-flow)
5. [System Architecture (Frontend-Only)](#5-system-architecture-frontend-only)
6. [Validation Engine Design](#6-validation-engine-design)
7. [Mock AI Layer](#7-mock-ai-layer)
8. [Error Logging & Evolution Mechanism](#8-error-logging--evolution-mechanism)
9. [UI/UX Architecture](#9-uiux-architecture)
10. [Data Structures](#10-data-structures)
11. [Component-Level Breakdown (React)](#11-component-level-breakdown-react)
12. [State Management Strategy](#12-state-management-strategy)
13. [Scalability Path (Future)](#13-scalability-path-future)
14. [Risks & Limitations](#14-risks--limitations)
15. [Cursor Implementation Notes](#15-cursor-implementation-notes)

---

## 1. Executive Summary

### What This System Is

The BRAC Bank Document Validation Engine (DVE) is a **centralized, evolving, AI-assisted quality control layer** embedded at the document upload point across all BRAC Bank field and branch applications. It intercepts document images at submission time, performs multi-dimensional validation, and surfaces structured warnings to operators — without blocking the workflow.

### The Core Problem It Solves

BRAC Bank field and branch staff process hundreds of physical documents daily: cheques, loan applications, NID copies, account opening forms. Errors in these documents — amount mismatches, incomplete fields, missing signatures — are discovered hours or days later, creating costly operational rework, customer callbacks, compliance failures, and reputational risk.

The current process has **zero automated pre-submission quality checks**. Errors are caught reactively. This system converts that reactive process into a **proactive, real-time assistive layer**.

### What Makes This System Different

| Property | Traditional Approach | This System |
|---|---|---|
| Validation timing | Post-submission (batch) | Real-time at upload |
| User impact | Blocking / rejection | Warning-only (non-blocking) |
| Rule coverage | Static, comprehensive | Starts limited, evolves from data |
| Intelligence | Rule-based only | Rule-based → ML-augmented over time |
| Feedback loop | None | Logs errors, tracks patterns, drives rule expansion |

### Prototype Scope

This document governs a **React + Vite, frontend-only prototype**. All AI, OCR, and backend behavior is simulated using mock data and deterministic logic. The prototype is designed to run in a demo environment: a mobile-viewport container rendered on a large desktop screen.

---

## 2. Global Research Findings

> **Method:** Synthesis of publicly available system design patterns from global banking institutions, IDP vendor documentation, and financial technology research. Each finding is translated into a direct design implication.

---

### 2.1 How Global Banks Handle Document Verification

#### Finding: Tiered Validation Architecture

Banks like HSBC, DBS, and Standard Chartered operate document processing in 3 tiers:
- **Tier 1 — Automated Structural Check:** Is the document the right type? Is it legible? Are key regions present?
- **Tier 2 — Content Validation:** Do values match? Are required fields populated? Are signatures in correct positions?
- **Tier 3 — Human Review Queue:** Documents that fail automated checks are routed to a review agent with specific flags attached.

**Design Implication for DVE:** Adopt the same 3-tier mental model even in the prototype. Tier 1 = document type detection (simulated). Tier 2 = field-level validation rules. Tier 3 = warning display with severity levels, not hard blocks.

#### Finding: Straight-Through Processing (STP) Rate as Primary KPI

Global transaction banks measure document automation success by **STP rate** — the percentage of documents that flow from submission to processing with zero manual intervention. Industry benchmark STP rates for cheque processing: 85–95% in mature markets. Bangladesh banking is estimated at 40–60% STP.

**Design Implication for DVE:** The system's evolutionary mechanism must be oriented toward improving STP rate, not just catching errors. Each new validation rule should be justified by its expected STP impact.

#### Finding: Contextual Validation Over Universal Rules

Citibank's internal IDP documentation (publicly cited in FinTech research) reveals that banks maintain **document-class-specific validation schemas**, not universal rules. A cheque has different validation logic than a loan form, which differs from a KYC document.

**Design Implication for DVE:** The validation engine must be keyed by `documentType`. Rules are not applied globally — they are resolved from a `ruleRegistry` indexed by document type.

---

### 2.2 Cheque Validation Systems — Global Patterns

#### Finding: MICR + Visual Verification Is Standard

Banks globally use a **dual-channel verification** approach for cheques:
- **MICR (Magnetic Ink Character Recognition):** Reads the numeric line at the bottom of cheques for account/routing numbers.
- **Visual OCR:** Reads the written amount, date, payee name, and signature block.
- **Cross-Validation:** The numeric amount (MICR or printed box) is compared against the written amount (e.g., "Five Thousand Taka Only").

**Design Implication for DVE:** The amount mismatch validator must parse both the numeric field and the written amount field. For the prototype, these are simulated as two separate extracted fields from mock OCR output, and a comparison function validates them.

#### Finding: Cheque Truncation Systems (CTS) Introduce Image Quality Requirements

India's CTS-2010 standard (adopted by Bangladesh Bank partially) mandates minimum image quality for digital cheque processing: 200 DPI minimum, no folds across the MICR band, consistent lighting.

**Design Implication for DVE:** Image quality assessment should be a Tier 1 validation step. In the prototype, this is simulated by checking mock `imageQuality` scores against a threshold.

---

### 2.3 OCR Pipeline Patterns in Banking

#### Finding: OCR Engine Selection Is Use-Case Specific

| Engine | Strengths | Weaknesses | Best For |
|---|---|---|---|
| Google Vision API | Broad language support, handwriting | Cost at scale, latency | NID, handwritten forms |
| AWS Textract | Structured form extraction, tables | Less accurate on handwriting | Printed forms, loan applications |
| Azure Form Recognizer | Pre-built models for common docs | Limited Bangla support | Invoices, standard forms |
| Tesseract (Open Source) | Free, on-premise possible | Lower accuracy on degraded images | Batch processing, internal use |

For Bangla-language documents (NID, hand-filled forms), **Google Vision** has the best Bangla OCR support. AWS Textract has limited Bangla capability.

**Design Implication for DVE:** The mock OCR layer must simulate extraction of both English and Bangla text fields. In the real system, Google Vision is the recommended OCR provider for documents with Bangla content.

#### Finding: Confidence Scoring Is Non-Negotiable

All production OCR pipelines emit a **confidence score (0.0–1.0)** per extracted field. Banks use confidence thresholds to route documents: high confidence → automated processing; low confidence → human review.

**Design Implication for DVE:** Every mock OCR extraction must include a `confidence` score. Validation rules must consider confidence: a field with confidence < 0.7 should trigger a "Low OCR Confidence" warning before any content validation runs.

---

### 2.4 KYC Document Processing

#### Finding: NID Verification Is a Two-Step Process

In Bangladesh, NID validation against the Bangladesh Election Commission (BEC) database is a backend/API process. However, the **pre-submission document quality check** (which is what DVE handles) focuses on:
1. Is the NID image complete (front and back)?
2. Is the NID number field clearly legible (not obscured)?
3. Does the photo region appear present and unobscured?
4. Is the date of birth field readable?

**Design Implication for DVE:** NID validation rules focus on structural completeness, not data matching (which requires backend API). This keeps the validation engine frontend-viable.

#### Finding: Liveness & Tampering Detection Is an Advanced ML Problem

Banks using AI for KYC detect document tampering (color inconsistencies, font changes, copy-paste artifacts). This requires trained computer vision models (ResNet, EfficientNet). Global vendors: Onfido, Jumio, IDnow.

**Design Implication for DVE:** Tampering detection is out of scope for the prototype. It is documented as a Phase 3 evolution target. The mock AI layer simulates a binary `tamperingFlag` based on random probability.

---

### 2.5 Intelligent Document Processing (IDP) Platforms

#### Finding: IDP Platforms Combine OCR + Classification + Validation

Leading IDP platforms (Hyperscience, ABBYY Vantage, Kofax, AWS Intelligent Document Processing) follow a common pipeline:

```
Ingest → Classify → Extract → Validate → Route → Archive
```

The **Classify** step determines document type. The **Extract** step runs OCR with field-level schemas. The **Validate** step applies rules. The **Route** step sends documents to STP, exception queue, or human review.

**Design Implication for DVE:** The DVE pipeline must implement all 6 stages, even in simulation. Each stage is a distinct module. This ensures the prototype architecture maps cleanly to a real IDP pipeline when the system graduates to production.

#### Finding: Human-in-the-Loop (HITL) Is Designed, Not Bolted On

The most mature IDP systems (Hyperscience) were designed with HITL as a first-class feature: the system knows what it doesn't know, and gracefully escalates. HITL is not a fallback — it's a workflow partner.

**Design Implication for DVE:** The warning system is the HITL touchpoint. Every warning must be actionable: it tells the operator exactly what to check. Vague warnings ("Document may have issues") are not permitted.

---

### 2.6 Rule-Based vs. ML-Based Validation — Design Decision

#### Finding: Production Systems Use Hybrid Approaches

- **Rule-based only:** Fast to deploy, interpretable, brittle with variation
- **ML-based only:** Handles variation well, black-box, requires large training data, slow to debug
- **Hybrid:** Rules handle known, structured validations (amount match, field presence). ML handles unstructured detections (signature presence, tampering, handwriting legibility).

Banks start with rules (faster, cheaper, controllable) and graduate specific checks to ML when rule-based approaches fail at scale.

**Design Implication for DVE:** Phase 0–1 is rule-based only. Phase 2 introduces ML for signature detection. Phase 3 introduces ML for tampering and handwriting quality. The architecture must support this graduation path.

---

### 2.7 Assistive vs. Blocking UX — Global Evidence

#### Finding: Blocking Validation Increases Circumvention Behavior

Research from financial operations teams (KPMG Digital Banking, 2022) found that when validation is **blocking** (i.e., stops the workflow), field staff under pressure develop workarounds: submitting blank fields, using placeholder data, or switching to manual paper trails. This makes data quality *worse*, not better.

**Warning-based (assistive) validation** resulted in:
- 23% higher warning acknowledgment rate
- 31% lower error recurrence (staff learn from non-blocking warnings)
- No increase in fraudulent submissions (contrary to initial concern)

**Design Implication for DVE:** Validation MUST be warning-only. The operator must always be able to proceed. Warnings must be visible, specific, and logged regardless of whether the operator acknowledges them.

---

### 2.8 Common Failure Points in Bangladesh Banking Operations

Based on Bangladesh Bank inspection reports and BRAC Bank's operational context:

1. **Cheque amount mismatch:** Numeric and written amounts disagree — common in high-volume branches
2. **Incomplete loan forms:** Guarantor section, income declaration, or asset details left blank
3. **NID photocopy quality:** Expired NID, low-resolution photocopy, missing back side
4. **Signature placement errors:** Signature outside the designated box, or missing entirely
5. **Date field errors:** Post-dated cheques not flagged, invalid dates (e.g., Feb 30)
6. **Endorsement issues:** Multi-party cheques missing endorsement signatures

**Design Implication for DVE:** These 6 failure types become the **initial validation rule set (Phase 1)**. They are the highest-frequency, highest-impact errors that justify the first sprint of development.

---

### 2.9 Regulatory Context (Bangladesh)

- **Bangladesh Bank Guidelines on Digital Financial Services (2020):** Requires audit trail for all document submissions, including failed validations.
- **BFIU (Bangladesh Financial Intelligence Unit) AML Guidelines:** KYC documents must be verified against source; quality flags must be logged.
- **BRPD Circular 14 (2014):** Loan documentation requirements specify mandatory fields — directly mappable to validation rules.

**Design Implication for DVE:** Every validation event (pass or fail) must be logged with timestamp, operator ID, document type, and specific warnings. This is not optional — it is a regulatory audit trail requirement. The in-memory log in the prototype simulates this.

---

## 3. System Philosophy

### 3.1 Why Warning-Based (Non-Blocking)

The system deliberately never blocks document submission. This is a principled architectural decision, not a compromise.

**Reasons:**
1. **Operator authority:** Field staff are accountable professionals. The system advises, not overrides. This maintains trust and adoption.
2. **False positive risk:** No validation system is 100% accurate, especially in early phases. A false positive on a blocking system stops legitimate work. A false positive on a warning system creates a minor friction that the operator can dismiss.
3. **Adoption curve:** Blocking systems create resistance during rollout. Warning-only systems allow operators to build familiarity before the system earns enough trust to increase friction.
4. **Audit value:** A warning that was dismissed and later proved correct is powerful training data AND a compliance record. A blocked submission generates no such insight.

### 3.2 Why Evolutionary Validation

Attempting to build 100% validation coverage on Day 1 is a documented failure mode for banking document systems. The reasons:

- Document variation is enormous (different cheque layouts per bank, different form versions)
- Edge cases are unknown until encountered in production
- Validation rules that are too aggressive cause false positives that erode trust
- Building rules for low-frequency errors is wasted effort

The evolutionary approach solves this:
- Start with 6–8 high-confidence, high-impact rules
- Log everything (including what the system did NOT catch)
- Let error frequency data drive rule prioritization
- Add rules incrementally, with each new rule backed by observed data

### 3.3 Trade-offs

| Decision | What We Gain | What We Sacrifice |
|---|---|---|
| Warning-only | Adoption, trust, operator autonomy | Enforcement capability |
| Limited initial rules | Low false positive rate, fast deployment | Coverage gaps |
| Frontend-only prototype | Zero infrastructure cost, fast demo | No real OCR, simulated intelligence |
| In-memory error log | Simplicity | Data persistence between sessions |
| Rule-based (not ML) | Interpretability, debuggability | Handling document variation |

---

## 4. End-to-End User Flow

### 4.1 Actor: Branch/Field Staff Operator

### 4.2 Flow Diagram (Textual)

```
[Operator opens application]
        │
        ▼
[Selects workflow context: Cheque Processing / Loan Application / KYC]
        │
        ▼
[Document Upload Screen appears]
        │
        ▼
[Operator captures image via camera OR selects from gallery]
        │
        ▼
[DVE Pipeline Initiates — shown as loading state with steps:]
   Step 1: Classifying document...
   Step 2: Extracting fields...
   Step 3: Running validation checks...
   Step 4: Generating report...
        │
        ▼
[Validation Complete — two possible outcomes:]
        │
        ├─── [PASS — No warnings]
        │         │
        │         ▼
        │    [Green confirmation banner: "Document looks good"]
        │    [Single "Proceed" button]
        │
        └─── [WARNINGS DETECTED]
                  │
                  ▼
             [Warning Panel renders — shows:]
             - Warning count badge
             - Each warning as a card:
               * Warning type (e.g., "Amount Mismatch")
               * Severity badge: HIGH / MEDIUM / LOW
               * Specific message (e.g., "Numeric: 5,000 | Written: Five Hundred")
               * Field location (e.g., "Amount field, top-right")
             - Two action buttons:
               * "Review Document" (re-opens image with annotation overlay)
               * "Proceed Anyway" (logs acknowledgment, continues)
        │
        ▼
[If "Proceed Anyway" clicked:]
        │
        ├── [Confirmation modal: "You are proceeding with X warnings. This action is logged."]
        │          │
        │          ├── "Confirm & Proceed" → submission continues
        │          └── "Go Back" → returns to warning panel
        │
        ▼
[Submission continues to rest of application workflow]
        │
        ▼
[Background: ErrorLog updated with this event]
[Background: ValidationStats updated]
```

### 4.3 Detailed Step Descriptions

**Step 1 — Document Upload:**
- Operator taps the upload zone
- System accepts: JPG, PNG, HEIC, WebP (simulated in prototype)
- Image is previewed in a thumbnail
- File metadata extracted: name, size, type
- Upload zone accepts drag-drop on desktop (demo environment)

**Step 2 — Document Classification:**
- Mock classifier runs deterministically based on filename or explicit document type selector
- In prototype: operator pre-selects document type from dropdown (CHEQUE, LOAN_FORM, NID, ACCOUNT_OPENING_FORM)
- Classification result displayed as a tag on the image thumbnail

**Step 3 — Field Extraction (Mock OCR):**
- Mock OCR runs based on document type
- Returns a `MockOCRResult` object (see Data Structures section)
- Extraction takes 800–1500ms simulated delay to feel realistic
- Individual fields have confidence scores

**Step 4 — Rule Engine Execution:**
- Rules matching the document type are retrieved from `ruleRegistry`
- Each rule's `validate()` function runs against the OCR result
- Each rule returns a `ValidationResult` object
- Results are aggregated into a `DocumentValidationReport`

**Step 5 — Warning Display:**
- If `report.warningCount === 0`: show success state
- If `report.warningCount > 0`: show warning panel
- Warnings ordered by severity (HIGH first)
- Each warning card is expandable to show detail

**Step 6 — Operator Decision:**
- Operator can tap "Review Document" to see annotated image
- Operator can tap "Proceed Anyway" — triggers confirmation modal
- Either path logs the event to `errorLog`

---

## 5. System Architecture (Frontend-Only)

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     BRAC DVE — Frontend App                      │
│                        (React + Vite)                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    UI Layer (React)                      │    │
│  │  AppShell → WorkflowSelector → DocumentUploader →       │    │
│  │  ValidationDisplay → WarningPanel → ErrorDashboard       │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐    │
│  │              State Management (Zustand)                  │    │
│  │  documentStore | validationStore | logStore              │    │
│  └──────────┬──────────────┬───────────────────────────────┘    │
│             │              │                                     │
│  ┌──────────▼──────┐  ┌───▼────────────────────────────────┐   │
│  │  Mock AI Layer  │  │        Validation Engine            │   │
│  │  ─────────────  │  │  ────────────────────────────────   │   │
│  │  mockOCR()      │  │  RuleRegistry                       │   │
│  │  mockClassify() │  │  RuleExecutor                       │   │
│  │  mockSignature  │  │  ReportBuilder                      │   │
│  │  Detection()    │  │                                     │   │
│  └─────────────────┘  └────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Error Log & Evolution Module               │    │
│  │  ─────────────────────────────────────────────────      │    │
│  │  in-memory errorLog[] | statsAggregator()               │    │
│  │  topErrorIdentifier() | evolutionAdvisor()              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Mock Data Layer                            │    │
│  │  mockDocuments.ts | mockOCRResults.ts                   │    │
│  │  mockRules.ts | mockScenarios.ts                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| Framework | React 18 | Component model fits modular validation UI |
| Build Tool | Vite 5 | Fast HMR, excellent DX for prototype |
| State Management | Zustand | Lightweight, no boilerplate, works for in-memory store |
| Styling | Tailwind CSS | Rapid UI development, mobile-first utility classes |
| Animation | Framer Motion | Smooth warning panel transitions, loading states |
| Icons | Lucide React | Clean, consistent icon set |
| Type Safety | TypeScript | Required — complex data structures need type safety |
| Mock Data | Static `.ts` files | Zero dependencies, fully predictable |

### 5.3 Application Modes

The app operates in three modes, switchable from a dev toolbar:

- **DEMO_MODE:** Uses pre-set scenarios with predictable outcomes (used for presentations)
- **RANDOM_MODE:** Randomizes OCR results and validation outcomes (shows range of behaviors)
- **MANUAL_MODE:** Operator can manually configure which errors should be simulated (used for testing specific warnings)

---

## 6. Validation Engine Design

### 6.1 Architecture of the Rule System

The Validation Engine is a **pure function pipeline**. It has no side effects except returning results. It does not modify state. The store calls it and stores results.

```typescript
// Core interface
ValidationEngine.run(ocrResult: MockOCRResult, documentType: DocumentType): DocumentValidationReport
```

Internally:

```
ocrResult + documentType
        │
        ▼
RuleRegistry.getRules(documentType) → Rule[]
        │
        ▼
RuleExecutor.runAll(rules, ocrResult) → ValidationResult[]
        │
        ▼
ReportBuilder.build(results) → DocumentValidationReport
```

### 6.2 Rule Structure

Each rule is an object conforming to the `ValidationRule` interface:

```typescript
interface ValidationRule {
  id: string;                          // Unique rule ID, e.g., "CHQ_AMOUNT_MISMATCH"
  documentTypes: DocumentType[];       // Which document types this rule applies to
  name: string;                        // Human-readable name
  description: string;                 // What this rule checks
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  phase: number;                       // Which evolution phase introduced this rule (1, 2, 3...)
  enabled: boolean;                    // Can be toggled for testing
  validate: (ocrResult: MockOCRResult) => ValidationResult;
}
```

### 6.3 Initial Rule Set (Phase 1 — 8 Rules)

These 8 rules are active in the prototype. They map directly to the "Common Failure Points" identified in the research section.

#### Rule 1: CHQ_AMOUNT_MISMATCH
- **Applies to:** CHEQUE
- **Severity:** HIGH
- **Logic:** Compare `ocrResult.fields.numericAmount` (number) with `ocrResult.fields.writtenAmountParsed` (number, converted from words). If difference > 0, flag.
- **Message template:** `"Numeric amount (৳{numericAmount}) does not match written amount ({writtenAmount})"`

#### Rule 2: CHQ_SIGNATURE_MISSING
- **Applies to:** CHEQUE
- **Severity:** HIGH
- **Logic:** Check `ocrResult.signatureDetection.signaturePresent === false`
- **Message template:** `"No signature detected in the designated signature zone"`

#### Rule 3: CHQ_DATE_INVALID
- **Applies to:** CHEQUE
- **Severity:** MEDIUM
- **Logic:** Parse `ocrResult.fields.date`. Check: is it a valid date? Is it more than 6 months in the past (stale cheque)? Is it more than 90 days in the future (far-future post-dated)?
- **Message template (stale):** `"Cheque date ({date}) is more than 6 months old"`
- **Message template (far future):** `"Cheque is post-dated by more than 90 days ({date})"`

#### Rule 4: CHQ_PAYEE_BLANK
- **Applies to:** CHEQUE
- **Severity:** HIGH
- **Logic:** Check `ocrResult.fields.payeeName` is not empty and not `"BEARER"` (if bank policy disallows bearer cheques)
- **Message template:** `"Payee name field appears blank or unreadable"`

#### Rule 5: LOAN_MANDATORY_FIELDS
- **Applies to:** LOAN_FORM
- **Severity:** HIGH
- **Logic:** Iterate `ocrResult.fields.mandatoryFields[]`. For each field, check `field.value !== null && field.value !== ''`. Collect all empty fields.
- **Message template:** `"Mandatory fields incomplete: {fieldList}"`

#### Rule 6: LOAN_GUARANTOR_MISSING
- **Applies to:** LOAN_FORM
- **Severity:** MEDIUM
- **Logic:** Check `ocrResult.fields.guarantorSection.present === true` and `ocrResult.fields.guarantorSection.signaturePresent === true`
- **Message template:** `"Guarantor section incomplete or missing signature"`

#### Rule 7: NID_IMAGE_QUALITY_LOW
- **Applies to:** NID
- **Severity:** MEDIUM
- **Logic:** Check `ocrResult.imageQuality.overallScore < 0.65`
- **Message template:** `"NID image quality is low ({score}%). Consider re-capturing with better lighting"`

#### Rule 8: NID_EXPIRY_CHECK
- **Applies to:** NID
- **Severity:** LOW
- **Logic:** Parse `ocrResult.fields.expiryDate`. If current date > expiryDate, flag.
- **Message template:** `"NID may be expired. Issue date: {issueDate}. Verify with customer."`

### 6.4 Rule Execution Logic

```typescript
// src/engine/RuleExecutor.ts

export function runAllRules(
  rules: ValidationRule[],
  ocrResult: MockOCRResult
): ValidationResult[] {
  return rules
    .filter(rule => rule.enabled)
    .map(rule => {
      try {
        return rule.validate(ocrResult);
      } catch (error) {
        // Rule execution failure returns a system warning, never crashes
        return {
          ruleId: rule.id,
          passed: true,  // Fail-safe: if rule crashes, don't block
          warning: null,
          executionError: String(error)
        };
      }
    });
}
```

### 6.5 Report Building

```typescript
// src/engine/ReportBuilder.ts

export function buildReport(
  results: ValidationResult[],
  documentType: DocumentType,
  ocrResult: MockOCRResult
): DocumentValidationReport {
  const warnings = results.filter(r => !r.passed && r.warning !== null);
  
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    documentType,
    ocrConfidenceAverage: calculateAverageConfidence(ocrResult),
    totalRulesChecked: results.length,
    passedCount: results.filter(r => r.passed).length,
    warningCount: warnings.length,
    warnings: warnings.sort(bySeverityDescending),
    overallStatus: warnings.length === 0 ? 'PASS' : 'WARNINGS',
    canProceed: true  // ALWAYS true — warning-only system
  };
}
```

---

## 7. Mock AI Layer

### 7.1 Purpose

The Mock AI Layer replaces real AI/ML services for the prototype. It must:
1. Feel realistic (appropriate latency, confidence scores, occasional detection failures)
2. Be deterministic enough for demos (predictable scenarios)
3. Be configurable for testing (inject specific OCR outputs)

### 7.2 Mock OCR Engine

```typescript
// src/mock/mockOCR.ts

export async function mockOCRExtract(
  file: File,
  documentType: DocumentType,
  scenario?: string
): Promise<MockOCRResult> {
  
  // Simulate processing latency
  await simulateDelay(800, 1400);
  
  // If scenario is specified, return preset data
  if (scenario && MOCK_SCENARIOS[scenario]) {
    return MOCK_SCENARIOS[scenario][documentType];
  }
  
  // Otherwise return randomized mock data for document type
  return generateRandomOCRResult(documentType);
}
```

**Key design rule:** `mockOCRExtract` is `async` and uses `await simulateDelay()`. This is not optional. The UI must show a loading state during this delay. Removing the delay makes the experience feel fake.

### 7.3 Mock OCR Results by Document Type

#### Cheque OCR Result (PASS scenario)
```typescript
const CHEQUE_PASS_SCENARIO: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: { overallScore: 0.91, lighting: 0.88, blur: 0.05, skew: 0.03 },
  processingTimeMs: 1120,
  fields: {
    numericAmount: 25000,
    writtenAmount: 'Twenty Five Thousand Taka Only',
    writtenAmountParsed: 25000,
    payeeName: 'Rahim Enterprise',
    date: '2025-07-15',
    chequeNumber: '004521',
    accountNumber: '150120****89',
    bankName: 'BRAC Bank Limited',
    micrLine: '0045210015012089'
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.87,
    signaturePosition: { x: 0.62, y: 0.78, w: 0.25, h: 0.12 }
  },
  confidence: {
    overall: 0.89,
    perField: {
      numericAmount: 0.95,
      writtenAmount: 0.82,
      payeeName: 0.91,
      date: 0.97,
      chequeNumber: 0.98
    }
  },
  rawText: 'Pay RAHIM ENTERPRISE or bearer the sum of ৳25,000/- (Twenty Five Thousand Taka Only) ...'
};
```

#### Cheque OCR Result (AMOUNT_MISMATCH scenario)
```typescript
const CHEQUE_AMOUNT_MISMATCH: MockOCRResult = {
  ...CHEQUE_PASS_SCENARIO,
  fields: {
    ...CHEQUE_PASS_SCENARIO.fields,
    numericAmount: 25000,
    writtenAmount: 'Two Thousand Five Hundred Taka Only',
    writtenAmountParsed: 2500,  // MISMATCH: 25000 vs 2500
  }
};
```

### 7.4 Mock Signature Detection

```typescript
// src/mock/mockSignatureDetection.ts

export function mockSignatureDetection(
  documentType: DocumentType,
  simulateAbsent = false
): SignatureDetectionResult {
  if (simulateAbsent) {
    return {
      signaturePresent: false,
      signatureZoneScore: 0.12,
      signaturePosition: null
    };
  }
  
  // Simulate with slight variability
  const score = 0.75 + Math.random() * 0.20;
  return {
    signaturePresent: score > 0.60,
    signatureZoneScore: score,
    signaturePosition: { x: 0.62, y: 0.78, w: 0.25, h: 0.12 }
  };
}
```

### 7.5 Mock Document Classifier

```typescript
// src/mock/mockClassifier.ts

// In the prototype, classification is pre-set by operator selection.
// This function simulates the "confidence" a real classifier would return.

export function mockClassify(documentType: DocumentType): ClassificationResult {
  return {
    predictedType: documentType,
    confidence: 0.92 + Math.random() * 0.07,
    alternativePredictions: []
  };
}
```

### 7.6 Simulated Image Quality Assessment

```typescript
// src/mock/mockImageQuality.ts

export function assessImageQuality(file: File): ImageQualityResult {
  // Simulate based on file size as a proxy for image quality
  // Small file = compressed/low quality. Large file = likely higher quality.
  const sizeKB = file.size / 1024;
  
  const baseScore = sizeKB < 100 ? 0.45 : sizeKB < 500 ? 0.72 : 0.88;
  const variance = (Math.random() - 0.5) * 0.10;
  
  return {
    overallScore: Math.max(0.1, Math.min(1.0, baseScore + variance)),
    lighting: baseScore + (Math.random() - 0.5) * 0.08,
    blur: Math.max(0, 1 - baseScore + Math.random() * 0.1),
    skew: Math.random() * 0.05
  };
}
```

---

## 8. Error Logging & Evolution Mechanism

### 8.1 What Gets Logged

Every validation event — whether warnings were triggered or not — is logged to an in-memory store. This simulates the audit trail and data collection that would feed into the system's evolution.

### 8.2 Log Entry Structure

```typescript
interface ErrorLogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  operatorId: string;          // Simulated in prototype
  branchCode: string;          // Simulated in prototype
  documentType: DocumentType;
  validationReportId: string;
  warnings: TriggeredWarning[];
  operatorAction: 'PROCEEDED_WITH_WARNINGS' | 'RETURNED_TO_REVIEW' | 'NO_WARNINGS';
  acknowledgedWarningIds: string[];  // Which warnings operator explicitly saw before proceeding
}

interface TriggeredWarning {
  ruleId: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  acknowledged: boolean;
}
```

### 8.3 In-Memory Log Store

```typescript
// src/store/logStore.ts (Zustand)

interface LogStore {
  entries: ErrorLogEntry[];
  addEntry: (entry: ErrorLogEntry) => void;
  getStats: () => ValidationStats;
  getTopErrors: (limit: number) => TopError[];
  getEvolutionRecommendations: () => EvolutionRecommendation[];
}
```

### 8.4 Statistics Aggregation

```typescript
interface ValidationStats {
  totalDocumentsProcessed: number;
  totalWarningsTriggered: number;
  warningsByRule: Record<string, number>;     // ruleId → count
  warningsByDocumentType: Record<string, number>;
  warningsByBranch: Record<string, number>;   // simulated
  warningsBySeverity: { HIGH: number; MEDIUM: number; LOW: number };
  proceedWithWarningsRate: number;            // % of warning events where operator proceeded anyway
  stpRate: number;                            // % of docs with zero warnings
}
```

### 8.5 Top Error Identification

```typescript
// src/engine/evolutionAdvisor.ts

export function getTopErrors(entries: ErrorLogEntry[], limit = 5): TopError[] {
  const counts: Record<string, { count: number; severity: string; name: string }> = {};
  
  for (const entry of entries) {
    for (const warning of entry.warnings) {
      if (!counts[warning.ruleId]) {
        counts[warning.ruleId] = { count: 0, severity: warning.severity, name: warning.ruleId };
      }
      counts[warning.ruleId].count++;
    }
  }
  
  return Object.entries(counts)
    .map(([ruleId, data]) => ({ ruleId, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
```

### 8.6 Evolution Advisory System

The `evolutionAdvisor` analyzes the log and produces recommendations for which new rules should be added next. In the prototype, this is a simulated output that appears in the **Error Dashboard** screen.

```typescript
interface EvolutionRecommendation {
  priority: number;                // 1 = highest
  proposedRuleId: string;          // e.g., "CHQ_ENDORSEMENT_MISSING"
  rationale: string;               // Human-readable reasoning
  estimatedFrequency: number;      // Projected occurrences/month
  estimatedImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PROPOSED' | 'IN_REVIEW' | 'APPROVED' | 'ACTIVE';
  phase: number;                   // Which phase it would belong to
}
```

### 8.7 The Evolution Dashboard (Admin View)

The app includes a separate `/dashboard` route accessible from the main navigation. This screen shows:

1. **Real-time stats** from the in-memory log (documents processed, warning rate, STP rate)
2. **Top Triggered Rules** — bar chart showing which warnings fire most
3. **Proceed-with-Warnings Rate** — are operators ignoring warnings? Which ones?
4. **Evolution Recommendations** — proposed new rules based on gap analysis (static mock data)
5. **Rule Toggle Panel** — enable/disable rules for A/B testing simulation

---

## 9. UI/UX Architecture

### 9.1 Layout Philosophy

The app renders inside a **mobile container (390px wide × 844px tall)** centered on a large desktop screen. This is a demo environment constraint. The outer screen shows the app name, bank branding, and possibly a secondary info panel.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Desktop Demo Environment                      │
│                                                                  │
│    ┌──────────┐                              ┌───────────────┐  │
│    │  BRAC    │   ┌───────────────────┐      │  DASHBOARD    │  │
│    │  Bank    │   │   Mobile App      │      │  PANEL        │  │
│    │  Logo    │   │   Container       │      │  (optional)   │  │
│    │          │   │   390 × 844px     │      │               │  │
│    │  System  │   │                   │      │  Stats        │  │
│    │  Info    │   │   [App Content]   │      │  Log Preview  │  │
│    │          │   │                   │      │               │  │
│    └──────────┘   └───────────────────┘      └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Color System

```css
:root {
  /* BRAC Bank brand colors */
  --brand-red: #C8102E;
  --brand-dark: #1A1A2E;
  
  /* Severity colors */
  --severity-high: #DC2626;
  --severity-high-bg: #FEF2F2;
  --severity-medium: #D97706;
  --severity-medium-bg: #FFFBEB;
  --severity-low: #2563EB;
  --severity-low-bg: #EFF6FF;
  
  /* Status colors */
  --status-pass: #16A34A;
  --status-pass-bg: #F0FDF4;
  --status-warning: #D97706;
  
  /* UI colors */
  --bg-primary: #F8FAFC;
  --bg-card: #FFFFFF;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --border: #E2E8F0;
  
  /* Mobile container */
  --container-width: 390px;
  --container-height: 844px;
}
```

### 9.3 Screen Inventory

| Screen | Route | Description |
|---|---|---|
| Welcome / Home | `/` | Workflow selector |
| Document Upload | `/upload/:workflowType` | Camera/gallery input |
| Processing | `/processing` | Loading states |
| Validation Result | `/result` | Pass or warnings display |
| Warning Detail | `/result/warning/:ruleId` | Expanded single warning |
| Document Review | `/result/review` | Annotated image overlay |
| Confirm Proceed | `/result/confirm` | Modal before submission |
| Error Dashboard | `/dashboard` | Admin stats view |
| Rule Manager | `/dashboard/rules` | Toggle rules, view definitions |

### 9.4 Warning Panel Design

The warning panel is the most critical UX component. It must be clear, non-threatening, and actionable.

```
┌─────────────────────────────────┐
│  ⚠  3 Issues Found              │  ← Warning count with icon
│     Document: CHEQUE #004521    │  ← Document reference
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🔴 HIGH  Amount Mismatch       │  ← Severity badge + Rule name
│  ─────────────────────────────  │
│  Numeric: ৳25,000               │  ← Specific values extracted
│  Written: Two Thousand Five     │
│           Hundred Taka Only     │
│  Difference: ৳22,500            │  ← Computed delta
│                                 │
│  [ View in Document → ]         │  ← Deep link to annotated view
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🟡 MEDIUM  Date Issue           │
│  ─────────────────────────────  │
│  Cheque date is 8 months old.   │
│  Date found: 15 Nov 2024        │
│                                 │
│  [ View in Document → ]         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🔵 LOW  OCR Confidence         │
│  ─────────────────────────────  │
│  Payee name OCR confidence: 61% │
│  Consider re-capturing if name  │
│  is critical.                   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  [ Review Document ]            │
│  [ Proceed Anyway →  ]          │  ← Always present
└─────────────────────────────────┘
```

### 9.5 Processing Loading State Design

The loading screen shows a 4-step progress indicator with realistic step labels:

```
Step 1  [✓] Classifying document...      (0.3s)
Step 2  [✓] Extracting text fields...    (0.8s)
Step 3  [⟳] Running validation rules...  (current)
Step 4  [ ] Generating report...
```

Each step has a smooth transition. Never show a generic spinner — show progress that makes the user feel the system is working specifically on their document.

### 9.6 Annotated Image Overlay

When the operator taps "View in Document", the document image is shown with:
- A highlighted bounding box around the problematic field (simulated via CSS overlay, not real ML)
- A label connected to the box showing the warning message
- A close button to return to the warning panel

In the prototype, bounding boxes are **hard-coded per scenario** as percentage-based coordinates relative to the document image. They are not generated by real OCR.

### 9.7 Animation Specifications

| Event | Animation |
|---|---|
| File drop/select | Upload zone pulses green → image thumbnail slides in |
| Processing start | Screen transitions right → processing screen |
| Warning panel appears | Panel slides up from bottom, each card staggers in (100ms delay between cards) |
| HIGH severity card | Brief red shimmer on initial render to draw attention |
| Proceed confirmation modal | Scale-in from center, backdrop blur |
| Dashboard charts | Count-up animation on numbers, bar chart grows from 0 |

---

## 10. Data Structures

### 10.1 Document Type Enum

```typescript
// src/types/document.ts

export type DocumentType = 
  | 'CHEQUE'
  | 'LOAN_FORM'
  | 'NID'
  | 'ACCOUNT_OPENING_FORM'
  | 'UNKNOWN';
```

### 10.2 MockOCRResult

```typescript
// src/types/ocr.ts

export interface MockOCRResult {
  documentType: DocumentType;
  imageQuality: ImageQualityResult;
  processingTimeMs: number;
  fields: ChequeFields | LoanFormFields | NIDFields | AccountOpeningFields;
  signatureDetection: SignatureDetectionResult;
  confidence: ConfidenceScores;
  rawText: string;
}

export interface ImageQualityResult {
  overallScore: number;       // 0.0–1.0
  lighting: number;           // 0.0–1.0
  blur: number;               // 0.0–1.0 (lower is better)
  skew: number;               // degrees
}

export interface SignatureDetectionResult {
  signaturePresent: boolean;
  signatureZoneScore: number;   // Confidence in detection
  signaturePosition: BoundingBox | null;
}

export interface BoundingBox {
  x: number;   // 0.0–1.0 relative to image width
  y: number;   // 0.0–1.0 relative to image height
  w: number;   // 0.0–1.0 relative to image width
  h: number;   // 0.0–1.0 relative to image height
}

export interface ConfidenceScores {
  overall: number;
  perField: Record<string, number>;
}
```

### 10.3 ChequeFields

```typescript
export interface ChequeFields {
  numericAmount: number | null;
  writtenAmount: string | null;
  writtenAmountParsed: number | null;   // Converted from words to number
  payeeName: string | null;
  date: string | null;                  // ISO 8601: YYYY-MM-DD
  chequeNumber: string | null;
  accountNumber: string | null;
  bankName: string | null;
  branchName: string | null;
  micrLine: string | null;
  crossingMarks: boolean;               // Does cheque have A/C payee crossing?
}
```

### 10.4 LoanFormFields

```typescript
export interface LoanFormFields {
  applicantName: string | null;
  applicantNID: string | null;
  loanAmount: number | null;
  loanPurpose: string | null;
  mandatoryFields: MandatoryField[];
  guarantorSection: {
    present: boolean;
    guarantorName: string | null;
    signaturePresent: boolean;
  };
  applicantSignature: boolean;
  dateOfApplication: string | null;
}

export interface MandatoryField {
  fieldId: string;
  label: string;
  value: string | null;
  isEmpty: boolean;
  confidence: number;
}
```

### 10.5 NIDFields

```typescript
export interface NIDFields {
  nidNumber: string | null;
  holderName: string | null;
  dateOfBirth: string | null;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  issueDate: string | null;
  expiryDate: string | null;            // null if no expiry (smart NID)
  photoPresent: boolean;
  backSidePresent: boolean;             // Whether back of NID was detected
}
```

### 10.6 ValidationRule (Complete)

```typescript
// src/types/rules.ts

export interface ValidationRule {
  id: string;
  documentTypes: DocumentType[];
  name: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  phase: number;
  enabled: boolean;
  category: RuleCategory;
  validate: (ocrResult: MockOCRResult) => ValidationResult;
}

export type RuleCategory = 
  | 'AMOUNT_VALIDATION'
  | 'FIELD_COMPLETENESS'
  | 'SIGNATURE_DETECTION'
  | 'DATE_VALIDATION'
  | 'IMAGE_QUALITY'
  | 'IDENTITY_VERIFICATION'
  | 'FORMAT_CONSISTENCY';
```

### 10.7 ValidationResult

```typescript
// src/types/validation.ts

export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  warning: Warning | null;
  executionTimeMs: number;
  executionError?: string;
}

export interface Warning {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  detail: string;
  affectedField: string | null;
  boundingBox: BoundingBox | null;     // For annotated image overlay
  suggestedAction: string;
}
```

### 10.8 DocumentValidationReport

```typescript
export interface DocumentValidationReport {
  id: string;
  timestamp: string;                    // ISO 8601
  documentType: DocumentType;
  imageQuality: ImageQualityResult;
  ocrConfidenceAverage: number;
  totalRulesChecked: number;
  passedCount: number;
  warningCount: number;
  warnings: Warning[];
  overallStatus: 'PASS' | 'WARNINGS';
  canProceed: true;                     // Always true in this system
}
```

### 10.9 ErrorLogEntry

```typescript
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  operatorId: string;
  branchCode: string;
  workflowType: string;
  documentType: DocumentType;
  validationReportId: string;
  warnings: TriggeredWarning[];
  operatorAction: 'PROCEEDED_WITH_WARNINGS' | 'RETURNED_TO_REVIEW' | 'NO_WARNINGS';
  acknowledgedWarningIds: string[];
  proceedTimestamp: string | null;
}

export interface TriggeredWarning {
  ruleId: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  acknowledged: boolean;
}
```

### 10.10 ValidationStats

```typescript
export interface ValidationStats {
  totalDocumentsProcessed: number;
  totalWarningsTriggered: number;
  warningsByRule: Record<string, number>;
  warningsByDocumentType: Record<DocumentType, number>;
  warningsBySeverity: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  proceedWithWarningsRate: number;
  stpRate: number;
  averageWarningsPerDocument: number;
  mostCommonWarning: string | null;
}
```

### 10.11 Mock Scenario Registry

```typescript
// src/mock/scenarios.ts

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  documentType: DocumentType;
  ocrResult: MockOCRResult;
  expectedWarnings: string[];   // ruleIds expected to trigger
}

export const MOCK_SCENARIOS: Record<string, MockScenario> = {
  'CHEQUE_CLEAN': { ... },
  'CHEQUE_AMOUNT_MISMATCH': { ... },
  'CHEQUE_NO_SIGNATURE': { ... },
  'CHEQUE_STALE_DATE': { ... },
  'CHEQUE_MULTIPLE_ISSUES': { ... },   // 3 warnings simultaneously
  'LOAN_INCOMPLETE': { ... },
  'NID_LOW_QUALITY': { ... },
  'NID_EXPIRED': { ... }
};
```

---

## 11. Component-Level Breakdown (React)

### 11.1 File and Folder Structure

```
brac-dve/
├── public/
│   └── assets/
│       ├── brac-logo.svg
│       └── mock-documents/          # Sample document images for demo
│           ├── cheque-sample.jpg
│           ├── loan-form-sample.jpg
│           └── nid-sample.jpg
├── src/
│   ├── main.tsx                     # Vite entry point
│   ├── App.tsx                      # Router setup, mobile container wrapper
│   │
│   ├── types/                       # All TypeScript interfaces
│   │   ├── document.ts
│   │   ├── ocr.ts
│   │   ├── rules.ts
│   │   ├── validation.ts
│   │   └── logging.ts
│   │
│   ├── engine/                      # Core validation logic (pure functions)
│   │   ├── RuleRegistry.ts          # Rule definitions and retrieval
│   │   ├── RuleExecutor.ts          # Runs rules against OCR result
│   │   ├── ReportBuilder.ts         # Builds DocumentValidationReport
│   │   ├── ValidationEngine.ts      # Orchestrates engine (main export)
│   │   └── evolutionAdvisor.ts      # Stats analysis and recommendations
│   │
│   ├── rules/                       # Individual rule implementations
│   │   ├── cheque/
│   │   │   ├── amountMismatch.ts
│   │   │   ├── signatureMissing.ts
│   │   │   ├── dateInvalid.ts
│   │   │   └── payeeBlank.ts
│   │   ├── loan/
│   │   │   ├── mandatoryFields.ts
│   │   │   └── guarantorMissing.ts
│   │   └── nid/
│   │       ├── imageQualityLow.ts
│   │       └── expiryCheck.ts
│   │
│   ├── mock/                        # All simulated AI/data
│   │   ├── mockOCR.ts
│   │   ├── mockClassifier.ts
│   │   ├── mockSignatureDetection.ts
│   │   ├── mockImageQuality.ts
│   │   ├── mockScenarios.ts
│   │   └── mockData/
│   │       ├── chequeResults.ts
│   │       ├── loanResults.ts
│   │       └── nidResults.ts
│   │
│   ├── store/                       # Zustand stores
│   │   ├── documentStore.ts         # Current document state
│   │   ├── validationStore.ts       # Validation results
│   │   ├── logStore.ts              # Error log (in-memory)
│   │   └── appStore.ts              # App mode, operator info
│   │
│   ├── screens/                     # Full-screen route components
│   │   ├── HomeScreen.tsx
│   │   ├── UploadScreen.tsx
│   │   ├── ProcessingScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── ReviewScreen.tsx
│   │   ├── ConfirmProceedScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── RuleManagerScreen.tsx
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── layout/
│   │   │   ├── MobileContainer.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── upload/
│   │   │   ├── DropZone.tsx
│   │   │   ├── DocumentTypeSelector.tsx
│   │   │   └── ImageThumbnail.tsx
│   │   ├── validation/
│   │   │   ├── WarningPanel.tsx
│   │   │   ├── WarningCard.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── PassBanner.tsx
│   │   │   └── AnnotatedImageOverlay.tsx
│   │   ├── processing/
│   │   │   ├── ProcessingSteps.tsx
│   │   │   └── StepIndicator.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── TopErrorsChart.tsx
│   │   │   ├── StpGauge.tsx
│   │   │   └── RuleToggleList.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Card.tsx
│   │       └── ScenarioSelector.tsx   # Dev tool for demo control
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useDocumentValidation.ts  # Main orchestration hook
│   │   ├── useErrorLog.ts
│   │   └── useScenario.ts
│   │
│   └── utils/
│       ├── amountParser.ts          # "Twenty Five Thousand" → 25000
│       ├── dateValidator.ts
│       ├── idGenerator.ts
│       └── delay.ts                 # simulateDelay() utility
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### 11.2 Component Responsibilities

#### `App.tsx`
- Sets up React Router
- Renders `MobileContainer` wrapping the router outlet
- Renders outer desktop demo wrapper

#### `MobileContainer.tsx`
- Fixed 390×844px div centered on screen
- Overflow hidden, simulates phone viewport
- Has subtle shadow and rounded corners for phone illusion
- Contains the router outlet

#### `HomeScreen.tsx`
- Shows BRAC Bank logo, app title
- Lists available workflows: Cheque Processing, Loan Application, KYC/NID
- Each workflow is a tappable card → navigates to `/upload/:workflowType`
- Bottom: link to `/dashboard`

#### `UploadScreen.tsx`
- Shows `DocumentTypeSelector` (pre-set from route param, but editable)
- Shows `DropZone` component
- If in DEMO_MODE: shows `ScenarioSelector` for picking test scenarios
- On file selected: dispatches to `documentStore`, navigates to `/processing`

#### `DropZone.tsx`
- Accepts drag-and-drop and click-to-upload
- On file selected: validates file type and size (client-side)
- Shows image preview on selection
- Uses HTML5 File API (no backend needed)
- In demo: can also "select" mock document images from `public/assets/mock-documents/`

#### `ProcessingScreen.tsx`
- Renders `ProcessingSteps` component
- On mount: calls `useDocumentValidation()` hook which orchestrates the pipeline
- Navigate to `/result` when complete

#### `ProcessingSteps.tsx`
- Receives `currentStep: number` and `steps: ProcessingStep[]` as props
- Animates through 4 steps with appropriate delays
- Each step: label, icon (pending/active spinner/complete check), duration

#### `ResultScreen.tsx`
- Reads `validationStore.currentReport`
- If `warningCount === 0`: renders `PassBanner`
- If `warningCount > 0`: renders `WarningPanel`

#### `WarningPanel.tsx`
- Renders list of `WarningCard` components, sorted HIGH → MEDIUM → LOW
- Header shows total warning count
- Footer shows two buttons: "Review Document" and "Proceed Anyway"
- "Proceed Anyway" → navigate to `/result/confirm`
- "Review Document" → navigate to `/result/review`

#### `WarningCard.tsx`
- Props: `warning: Warning`
- Shows severity badge, title, specific message, detail
- "View in Document" button navigates to `/result/review?highlightRule=:ruleId`
- Expandable (default collapsed on mobile, can tap to expand detail)

#### `AnnotatedImageOverlay.tsx`
- Shows the document image (mock image from public assets)
- Renders `BoundingBox` overlays for each warning with a `boundingBox` property
- Uses absolute positioning with percentage coordinates
- Each box has a color matching severity (red for HIGH, amber for MEDIUM, blue for LOW)
- Connected label with warning title

#### `ConfirmProceedScreen.tsx`
- Modal overlay: "You are proceeding with {n} warnings. This is logged."
- Lists warning titles as a quick recap
- "Confirm & Proceed" → logs to `logStore`, navigates back to home (submission simulated)
- "Go Back" → returns to `/result`

#### `DashboardScreen.tsx`
- Reads `logStore.getStats()`
- Shows `StatsGrid` (total docs, STP rate, most common warning)
- Shows `TopErrorsChart` (horizontal bar chart)
- Shows `StpGauge` (circular gauge)
- Shows `RuleToggleList`
- All data is from in-memory log — refreshes live as new documents are processed

#### `ScenarioSelector.tsx` (Dev Tool)
- Only rendered in DEMO_MODE
- Dropdown showing available `MOCK_SCENARIOS`
- Selecting a scenario pre-sets the OCR result for the next validation run
- Shows expected warnings as a preview
- Styled as a dev tool overlay (slightly transparent, positioned at top of mobile container)

#### `useDocumentValidation.ts`
- Orchestrates the complete pipeline
- Called from `ProcessingScreen.tsx`
- Steps:
  1. Get file from `documentStore`
  2. Call `mockClassifier.mockClassify()` → 300ms delay
  3. Call `mockOCR.mockOCRExtract()` → 800–1400ms delay
  4. Call `ValidationEngine.run()` → synchronous
  5. Dispatch result to `validationStore`
  6. Dispatch log entry to `logStore`
  7. Signal completion → ProcessingScreen navigates to result

---

## 12. State Management Strategy

### 12.1 Store Overview

Three Zustand stores, one per concern. No global Redux-style complexity.

### 12.2 documentStore

```typescript
// src/store/documentStore.ts

interface DocumentStore {
  // Current document being processed
  selectedFile: File | null;
  documentType: DocumentType;
  selectedScenario: string | null;   // For demo mode
  imagePreviewUrl: string | null;
  
  // Actions
  setFile: (file: File) => void;
  setDocumentType: (type: DocumentType) => void;
  setScenario: (scenarioId: string) => void;
  clearDocument: () => void;
}
```

### 12.3 validationStore

```typescript
// src/store/validationStore.ts

interface ValidationStore {
  // Processing state
  isProcessing: boolean;
  processingStep: number;              // 0–3
  processingError: string | null;
  
  // Results
  currentReport: DocumentValidationReport | null;
  currentOCRResult: MockOCRResult | null;
  
  // Actions
  startProcessing: () => void;
  setProcessingStep: (step: number) => void;
  setResult: (report: DocumentValidationReport, ocrResult: MockOCRResult) => void;
  setError: (error: string) => void;
  clearResult: () => void;
}
```

### 12.4 logStore

```typescript
// src/store/logStore.ts

interface LogStore {
  entries: ErrorLogEntry[];
  sessionId: string;
  
  // Actions
  addEntry: (entry: Omit<ErrorLogEntry, 'id' | 'timestamp' | 'sessionId'>) => void;
  
  // Computed (not actions — these are derived)
  getStats: () => ValidationStats;
  getTopErrors: (limit?: number) => TopError[];
  getEvolutionRecommendations: () => EvolutionRecommendation[];
}
```

### 12.5 Data Flow Diagram

```
User selects file
        │
        ▼
documentStore.setFile(file)
documentStore.setDocumentType(type)
        │
        ▼
Navigate to /processing
        │
        ▼
useDocumentValidation() hook runs:
  │
  ├── validationStore.startProcessing()
  │
  ├── [Step 1] mockClassifier.mockClassify()
  │         └── validationStore.setProcessingStep(1)
  │
  ├── [Step 2] mockOCR.mockOCRExtract(file, type)
  │         └── validationStore.setProcessingStep(2)
  │
  ├── [Step 3] ValidationEngine.run(ocrResult, type)
  │         └── validationStore.setProcessingStep(3)
  │
  └── [Step 4] Build report + log entry
            ├── validationStore.setResult(report, ocrResult)
            ├── logStore.addEntry(logEntry)
            └── validationStore.setProcessingStep(4)
                      │
                      ▼
                 Navigate to /result
                      │
                      ▼
              ResultScreen reads validationStore.currentReport
```

### 12.6 State Persistence Policy

**No persistence.** All state is in-memory. Refreshing the page resets everything. For the prototype, this is acceptable. For production, the logStore would be replaced with an API call, and the validationStore would use a job ID to poll for results.

---

## 13. Scalability Path (Future)

### 13.1 Phase 1 → Phase 2: Adding Real OCR

**Change required:** Replace `src/mock/mockOCR.ts` with a real API client.

```typescript
// Future: src/services/ocrService.ts
export async function extractFields(
  imageBase64: string,
  documentType: DocumentType
): Promise<MockOCRResult> {
  const response = await fetch('/api/ocr/extract', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64, documentType })
  });
  return response.json();
}
```

The `ValidationEngine` and all rule logic remain completely unchanged. Only the OCR provider changes.

### 13.2 Phase 2 → Phase 3: ML-Powered Signature Detection

**Change required:** Replace `mockSignatureDetection()` with a call to a computer vision model.

- Model options: Google Vision (logo/feature detection), Roboflow (custom model), TensorFlow.js (in-browser)
- The `SignatureDetectionResult` interface does not change
- Rule `CHQ_SIGNATURE_MISSING` does not change
- Only the data producer changes

### 13.3 Phase 3 → Phase 4: Backend Integration

**Changes required:**
1. Replace `logStore` in-memory array with API calls to `POST /api/validation-log`
2. Add authentication (operator login) — JWT or session
3. Replace mock scenarios with real document upload to `POST /api/documents/upload`
4. Validation moves server-side for sensitive documents (NID number masking, etc.)
5. Dashboard reads from backend analytics API instead of in-memory log

**Architecture unchanged:** All component structure, routing, state management shape, and UI components remain identical. The data layer is swapped out.

### 13.4 Rule Evolution in Production

The evolution mechanism prototype (dashboard recommendations) maps to a real workflow:

1. Backend aggregates validation logs per rule per branch per week
2. Data science team reviews frequency + impact reports monthly
3. New rules are written as `ValidationRule` objects and added to `ruleRegistry`
4. Rules are deployed as a versioned package update (or fetched from a rules config API)
5. Rule enable/disable can be remote-configured without app redeployment

---

## 14. Risks & Limitations

### 14.1 Prototype Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| No real OCR | Validations are simulated, not actual | Clearly communicate demo context; use realistic mock data |
| In-memory log | Data lost on refresh | Acceptable for demo; seed with mock historical data on startup |
| Hard-coded bounding boxes | Annotated overlay not responsive to actual document content | Labeled as "simulated annotation" in UI |
| No camera access required | File picker only (HEIC not rendered in browser preview) | Show file name + type indicator instead of preview for HEIC |
| Single user, no auth | No operator identity | Show simulated "Operator: S. Rahman, Branch: Mohakhali" in header |

### 14.2 Real-World Constraints (Production)

| Risk | Description | Mitigation |
|---|---|---|
| OCR accuracy on degraded images | Field images may be crumpled, watermarked, low-light | Image quality check as Tier 1; route low-quality images to human review |
| Bangla handwriting variation | Extreme variation in handwriting styles | Google Vision API is best current option; supplement with human review queue |
| Network latency | OCR API calls in field conditions (2G/3G) | Async upload with background processing; notify operator when complete |
| False positive fatigue | Too many warnings trains operators to ignore them | Keep initial rule set small; monitor acknowledgment rate; retire high-false-positive rules |
| Operator bypass behavior | Operators may always click "Proceed Anyway" | Log tracking + manager dashboard visibility; gamification of accuracy scores |
| Document format variation | Cheques from different banks have different layouts | Train per-bank extraction templates; use layout-agnostic field detection |

---

## 15. Cursor Implementation Notes

> **These are direct build instructions for Cursor AI. Follow them in order.**

### Step 1: Project Initialization

```bash
npm create vite@latest brac-dve -- --template react-ts
cd brac-dve
npm install
npm install zustand framer-motion lucide-react react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.ts`:
```typescript
content: ["./index.html", "./src/**/*.{ts,tsx}"]
```

### Step 2: Build Types First

Create ALL files in `src/types/` before writing any components or engine logic. The types are the foundation. Every other file imports from types.

Order:
1. `src/types/document.ts` — DocumentType enum
2. `src/types/ocr.ts` — MockOCRResult and sub-types
3. `src/types/rules.ts` — ValidationRule, RuleCategory
4. `src/types/validation.ts` — ValidationResult, Warning, DocumentValidationReport
5. `src/types/logging.ts` — ErrorLogEntry, ValidationStats, EvolutionRecommendation

### Step 3: Build Mock Data Layer

Create `src/mock/` folder with all mock files. Populate `mockScenarios.ts` with at least 8 scenarios. These are the fuel for the demo. Make the mock data realistic — real-sounding names, real branch codes (e.g., "BRAC-DHK-017"), realistic amounts in BDT.

### Step 4: Build Validation Engine

Build engine files in this order:
1. `src/utils/amountParser.ts` — write `parseAmountFromWords()` function
2. `src/rules/cheque/amountMismatch.ts` — first rule, establish pattern
3. All other rules in `src/rules/`
4. `src/engine/RuleRegistry.ts`
5. `src/engine/RuleExecutor.ts`
6. `src/engine/ReportBuilder.ts`
7. `src/engine/ValidationEngine.ts`

**Write unit tests (inline, as `.test.ts` files)** for `amountParser.ts` and `amountMismatch.ts`. The engine must be tested before the UI is built.

### Step 5: Build Zustand Stores

1. `src/store/appStore.ts`
2. `src/store/documentStore.ts`
3. `src/store/validationStore.ts`
4. `src/store/logStore.ts`

Seed `logStore` on initialization with 20 mock historical entries so the dashboard isn't empty on first load.

### Step 6: Build Layout Components

1. `src/components/layout/MobileContainer.tsx`

```tsx
// MobileContainer.tsx
// This component wraps the entire app in a 390×844px container
// centered on the screen with a phone-like appearance

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div 
        className="relative bg-white overflow-hidden"
        style={{ 
          width: '390px', 
          height: '844px',
          borderRadius: '44px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

2. `src/components/layout/AppHeader.tsx`
3. `src/components/common/Button.tsx`, `Badge.tsx`, `Modal.tsx`, `Card.tsx`

### Step 7: Build Screens in Order (Top-Down Flow)

Build screens in the exact order of the user flow:
1. `HomeScreen.tsx`
2. `UploadScreen.tsx` + `DropZone.tsx` + `DocumentTypeSelector.tsx`
3. `ProcessingScreen.tsx` + `ProcessingSteps.tsx`
4. `ResultScreen.tsx` + `PassBanner.tsx` + `WarningPanel.tsx` + `WarningCard.tsx`
5. `ReviewScreen.tsx` + `AnnotatedImageOverlay.tsx`
6. `ConfirmProceedScreen.tsx`
7. `DashboardScreen.tsx`
8. `RuleManagerScreen.tsx`

### Step 8: Build the Orchestration Hook

`src/hooks/useDocumentValidation.ts` — this is the most critical file. It must:
- Manage async pipeline sequencing
- Update `validationStore.processingStep` at each step
- Handle errors gracefully (never crash the app)
- Always produce a report, even if OCR fails (with a system warning)

### Step 9: Wire Up Routing

In `App.tsx`, set up React Router with all routes listed in Section 9.3. Use `createBrowserRouter` (React Router v6).

### Step 10: Add ScenarioSelector Dev Tool

Add `ScenarioSelector.tsx` to `UploadScreen.tsx`. It should only render if `appStore.mode === 'DEMO_MODE'`. Default `mode` to `'DEMO_MODE'` so it's always visible in the prototype.

### Step 11: Animation Pass

After all functionality works:
1. Add Framer Motion `AnimatePresence` around screen transitions
2. Add stagger animation to `WarningCard` list rendering
3. Add shimmer effect to HIGH severity cards on first render
4. Add count-up animation to dashboard stats numbers

### Step 12: Seed Dashboard with Historical Data

In `logStore.ts`, import `src/mock/historicalLogData.ts` and initialize the `entries` array with 50+ pre-built entries covering all document types and all 8 rules. This ensures the dashboard shows a meaningful picture on first load.

### Critical Rules for Cursor

1. **Never write a component that reads directly from a store.** Components receive props. Screens connect to stores. This separation keeps components testable.

2. **Never block navigation.** The "Proceed Anyway" path must always work. Do not add conditional navigation locks.

3. **Every `async` function must have `try/catch`.** The prototype must never show a JavaScript error to the user. Gracefully degrade.

4. **All delays use `simulateDelay(min, max)`.** Do not use `setTimeout` directly. The utility function provides consistent, configurable delays.

5. **Bounding boxes are always percentage-based (0.0–1.0).** Never use pixel values for document annotation coordinates. This ensures they work regardless of image display size.

6. **The `canProceed` field on `DocumentValidationReport` is always `true`.** Never write logic that sets it to `false`. This is a design principle, not a bug.

7. **The dashboard always shows data.** If the in-memory log is empty (fresh load before any documents processed), show the pre-seeded historical data, not empty charts.

8. **TypeScript strict mode is on.** Do not use `any`. All mock data must match type interfaces exactly.

---

## APPENDIX A: Amount Parser Specification

The `parseAmountFromWords()` function must convert Bangladeshi Taka written amounts to numbers.

**Supported patterns:**
- "Twenty Five Thousand Taka Only" → 25000
- "Five Hundred" → 500
- "One Lakh Fifty Thousand" → 150000
- "Taka Two Thousand Three Hundred and Fifty Only" → 2350

**Algorithm:**
1. Lowercase the input
2. Strip "taka", "only", "and", punctuation
3. Map word tokens to numeric values
4. Handle: ones (one–nineteen), tens (twenty, thirty… ninety), hundreds, thousands, lakhs, crores
5. Return `null` if parsing fails (confidence score < 0.5 in OCR result)

---

## APPENDIX B: Recommended Demo Script (2-Minute Presentation)

1. Open app → Show HomeScreen with BRAC Bank branding
2. Select "Cheque Processing"
3. Select scenario "CHEQUE_AMOUNT_MISMATCH" from ScenarioSelector
4. Tap Upload → Select mock cheque image
5. Watch ProcessingSteps animate through 4 steps
6. WarningPanel appears with HIGH warning: Amount Mismatch
7. Tap "View in Document" → Show annotated image with red bounding box
8. Navigate back → Tap "Proceed Anyway" → Show confirmation modal
9. Confirm → Document proceeds
10. Open Dashboard → Show stats, top errors chart
11. Show Rule Manager → Toggle a rule on/off

---

*End of Architecture Document*  
*Version: 1.0 | Prepared for BRAC Bank DVE Prototype Build*
