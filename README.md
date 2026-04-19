# BRAC Bank Document Validation Engine (DVE) — Frontend Prototype

## Purpose

The DVE prototype is a branch-oriented React application that walks operators through document capture, a simulated AI pipeline (classification, OCR extraction, rule validation, reporting), and downstream review and compliance actions for cheque, loan, and KYC-style workflows. It is intended for UX validation, rule behavior demonstration, and operational analytics previews—without connecting to real banking systems.

## Tech Stack

React 19, TypeScript, Vite, Zustand, Framer Motion, Tailwind CSS, Lucide React.

## Getting Started

```bash
npm install
npm run dev
```

```bash
npm run build
```

```bash
npm test
```

## App Modes

- **Demo (`DEMO_MODE`):** Preset mock scenarios with predictable outcomes; demo scenario selection is available on the upload flow.
- **Random (`RANDOM_MODE`):** Mock OCR produces randomized fields and confidences to stress-test validation and UI.
- **Manual (`MANUAL_MODE`):** Operators toggle which rule failures to inject; the mock OCR layer mutates the clean baseline payload accordingly (`ManualInjectionPanel`).

## Prototype Scope

All classification, OCR, and server-side behavior is **simulated** in the browser using mock modules and static/semi-random payloads. There is no real ML, no backend API, and no durable persistence beyond in-memory state for the session.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Home (workflow entry) |
| `/upload/:workflowType` | Upload |
| `/processing` | Processing |
| `/result` | Result |
| `/result/warning/:ruleId` | Warning detail |
| `/result/review` | Document review (annotated overlay) |
| `/result/confirm` | Confirm proceed |
| `/dashboard` | Dashboard |
| `/dashboard/rules` | Rule manager |
