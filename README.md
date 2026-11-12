# Brandex IP Docket — Intellectual Property Law Firm Workflow & Filing Tracker

[![Firm](https://img.shields.io/badge/Law_Firm-Brandex_Law_Association-0B192C.svg)](https://brandex.pk)
[![Platform](https://img.shields.io/badge/Registry-IPO--Pakistan_%7C_WIPO-D97706.svg)](https://ipo.gov.pk)
[![React](https://img.shields.io/badge/Frontend-React_19_%2B_Tailwind_v4-38BDF8.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_ES2022-3178C6.svg)](https://www.typescriptlang.org)
[![Backend](https://img.shields.io/badge/Backend-Node_Express_%2B_Gemini_3.8_Flash-059669.svg)](https://expressjs.com)

**Brandex IP Docket** is a specialized, drag-and-drop Intellectual Property workflow, docketing, and statutory deadline management system crafted for **Brandex Law Association** ([brandex.pk](https://brandex.pk)). It converts informal WhatsApp instructions, examiner notices, and client briefs from Managing Partners into organized docket entries, automated countdown reminders, and structured filing pipelines.

---

## 🏛️ Firm Overview

- **Firm**: **Brandex Law Association** (Advocates, Trade Marks, Patents, Designs & Copyright Attorneys)
- **Official Website**: [https://brandex.pk](https://brandex.pk)
- **Established**: 1998
- **Core Practice**: Trade Marks Registration & Litigation, Patent Prosecution, Copyright Protection, Industrial Designs, Anti-Counterfeiting, Customs Recordals, and Hearings before the Intellectual Property Organization of Pakistan (IPO-Pakistan).
- **Offices**:
  - **Lahore (Head Office)**: Suites 402–404, Trade Centre, 1-Turner Road, High Court Precinct, Lahore, Pakistan.
  - **Karachi Office**: Plot 12-C, 7th Commercial Street, Phase II Ext, DHA, Karachi, Pakistan *(Near IPO Karachi Registry)*.
  - **Islamabad Office**: Office 201, Evacuee Trust Complex, Sector F-5/1, Islamabad, Pakistan *(Liaison Desk)*.

---

## 🎨 4 Curated Design Vibes (Interactive Theme Switcher)

Brandex IP Docket features an interactive **Theme Switcher** accessible from the top bar, allowing attorneys and paralegals to toggle between four distinct legal aesthetics:

| Theme Name | Palette & Tone | Best Suited For |
| :--- | :--- | :--- |
| **1. Executive Chancery** *(Default)* | Midnight Navy (`#0B192C`) & Brass Gold (`#D97706`) on crisp parchment | Prestigious High Court advocates, traditional corporate IP practice. |
| **2. Silicon Patent** | Deep Graphite (`#0F172A`) & Electric Emerald (`#059669`) on clean technical slate | Tech startup counsel, software copyrights, biotechnology & patent prosecution. |
| **3. Colonial Chambers** | Regal Oxblood (`#2D070E`) & Antique Cream (`#C29B38`) on warm ivory canvas | Senior advocate chambers, historic trademark heritage & litigation proceedings. |
| **4. International WIPO** | Royal Cobalt (`#11235A`) & Sapphire Blue (`#2563EB`) on platinum white | Geneva arbitration, Madrid System filings & cross-border PCT prosecution. |

---

## ⚡ Core Features

### 1. WhatsApp Chat & Voice-Note Importer (No Coding Required)
- **Paste & Auto-Docket**: Paste unstructured boss messages (e.g. `"[10:15 AM] Ali, urgent! TM-11 reply for VERTEX GLOW (App 614920) Alpha Foods is due by 10th Nov..."`).
- **AI-Powered Extraction**: Integrates **Gemini 3.8 Flash** with a local regex rule-based fallback to extract:
  - Client / Applicant Name
  - Trademark / Invention / Work Title
  - Official Application Number (e.g., `TM-614920`, `P-2025/1102`)
  - Nice Classification (e.g., `Class 5`, `Class 30`, `Class 9`)
  - Task / Office Action Type (TM-1, TM-11, TM-12, TM-16, Hearing)
  - Calculated Statutory Due Date (resolves relative terms like `"due within 15 days"`, `"before next Friday"`)
  - Urgency & Boss's original notes
- **One-Click Pre-Loaded Test Chats**: Test scenarios ready for instant one-click demonstration.
- **Editable Preview**: Review and adjust extracted matter particulars before batch-importing.

### 2. Drag-and-Drop Statutory Filing Pipeline (Kanban Board)
- **5 Statutory Pipeline Stages**:
  1. `New Instruction`: Fresh client briefs, searches & clearance reports.
  2. `Drafting & Prep`: TM-1 forms, patent complete specifications, notarized Form TM-48 (Power of Attorney).
  3. `Office Action / Objection`: Examiner reports, Section 14 citations, disclaimer letters.
  4. `Hearing & Opposition`: Notice of opposition (TM-12), counter-statements (TM-13), registrar appearances.
  5. `Completed / Registered`: Certificate issued, registration recorded, courier dispatched.
- **Visual Drag & Drop**: Native HTML5 smooth dragging across columns with real-time stage updates and confetti celebration upon marking filings complete.
- **Checklist Subtasks**: Track procedural milestones per filing (e.g., fee challans paid, drawing representations verified).

### 3. 1-Click Boss WhatsApp Status Report Generator
- Gathers all completed filings today, urgent office action deadlines (<5 days), and upcoming registrar hearings.
- Formats a clean, professional status summary with WhatsApp bolding (`*text*`) and emojis.
- Direct **Copy for WhatsApp** and **Open in WhatsApp Web** buttons to message the Managing Partner instantly.

### 4. Automated Reminders & Statutory Deadline Center
- **Automated Rules Engine**:
  - 14-Day Advance Notice (Document Gathering)
  - 7-Day Drafting Warning (Review & Signatures)
  - 3-Day Urgent Notice (Challan & Submission)
  - 24-Hour Statutory Cutoff Alert
- **Statutory Client Email Drafter**: Automatically composes formal legal notice letters citing the *Trade Marks Ordinance 2001* and *Patent Ordinance 2000*, ready to edit, print, or dispatch with tracking IDs.

### 5. High-Density Docket Sheet & CSV Export
- Search across marks, clients, application references, classes, and tasks.
- Filter by IP category (Trademark, Patent, Copyright, Industrial Design) and Status (Pending, Urgent, Completed).
- 1-Click **Export to CSV** for spreadsheets and reporting.

---

## 📜 IPO Pakistan Statutory Reference Guide

| Procedural Form | Statutory Milestone | Statutory Time Window | Governing Law |
| :--- | :--- | :--- | :--- |
| **Form TM-1** | New Trademark Application | Prior to commercial public launch | Trade Marks Ordinance 2001, Sec 22 |
| **Form TM-11** | Reply to Examiner's Report | **30 Days** from date of official letter | Section 14 & Rule 29 |
| **Form TM-12** | Notice of Opposition | **2 Months (60 Days)** from Journal publication | Section 28 & Rule 30 |
| **Form TM-13** | Counter-Statement to Opposition | **2 Months (60 Days)** from receipt of notice | Section 28(3) & Rule 32 |
| **Form TM-16** | 10-Year Trademark Renewal | Within **6 Months** prior to expiration | Section 35 |
| **Form TM-48** | Special Power of Attorney (Vakalathnama) | Required upon or before first hearing/filing | First Schedule, Trade Marks Rules 2004 |
| **Patent Form 2**| Complete Patent Specification | **12 Months** from provisional filing date | Patents Ordinance 2000, Sec 13 |
| **Form ID-1** | Industrial Design Application | 6 orthographic angles; prior to public disclosure | Registered Designs Ordinance 2000 |

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict ES2022)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with semantic dynamic design theme variables
- **Backend / Proxy**: [Express.js](https://expressjs.com/) (`server.ts`) with Vite middleware
- **AI Engine**: [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-3.8-flash`) + Local IP Heuristic Engine
- **Icons & Delight**: [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Typography**: `Plus Jakarta Sans` (Brand & Prose), `JetBrains Mono` (Tabular Numerals & Docket Numbers)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/brandex-law/brandex-ip-docket.git
   cd brandex-ip-docket
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   # GEMINI_API_KEY: Optional. Used for server-side AI parsing of WhatsApp chats.
   # If omitted, the system seamlessly uses the built-in Brandex rule-based parser.
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔌 API Reference

### `POST /api/parse-whatsapp`
Extracts structured filing records from raw WhatsApp chat transcripts.

**Request Body**:
```json
{
  "text": "Ali, urgent! File reply to examiner report for trademark 'VERTEX GLOW' app no 584920 before 15th Nov, client is Alpha Foods Ltd",
  "contextDate": "2026-11-06"
}
```

**Response**:
```json
{
  "success": true,
  "source": "gemini-3.8-flash",
  "summary": "Extracted 1 matter for Alpha Foods Ltd",
  "filings": [
    {
      "title": "VERTEX GLOW",
      "client": "Alpha Foods Ltd",
      "ipType": "Trademark",
      "appNumber": "584920",
      "niceClass": "Class 30",
      "taskType": "TM-11 Reply to Examiner Report",
      "stage": "office_action",
      "dueDate": "2026-11-15",
      "priority": "urgent"
    }
  ]
}
```

### `POST /api/send-email-reminder`
Simulates automated client/counsel deadline notification dispatch.

---

## 🛡️ Data Privacy & Docket Security

All docket state is managed authoritatively and cached locally via browser storage (`localStorage`) with state sanitization to ensure no duplicate keys or data loss occur. In production environments, database bindings (e.g. PostgreSQL or Firestore) can be mapped directly to the `FilingItem` model schema.

---

## ⚖️ License & Attribution

Copyright © 1998–2026 **Brandex Law Association**. All rights reserved.  
Official Domain: [brandex.pk](https://brandex.pk)  
*Advocates, Trade Marks, Patents, Designs & Copyright Attorneys — Pakistan.*
