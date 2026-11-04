# PROJECT ARCHITECTURE & SPECIFICATION: "I LIKE PDFs"

**Project Title**: "I Like PDFs" (High-Fidelity Open-Source iLovePDF Reverse-Engineered Platform)  
**Document Version**: 1.0.0 (Milestone 1 Specification Deliverable)  
**Working Directory**: `c:\Users\Atharva\Desktop\i love pdf reverse`  
**License**: ISC / MIT Compatible  
**Last Updated**: 2026-11-04  

---

## 1. Architecture & System Overview

"I Like PDFs" is a full-stack, privacy-first document manipulation platform engineered to deliver 100% operational feature parity with the live `ilovepdf.com` tool suite. The system combines high-performance client-side WebAssembly and canvas rendering engines with an asynchronous Node.js microservice architecture and a reverse-engineered cloud grid fallback.

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  Client Web Browser                    │
                                  │             Single Page Application (SPA)              │
                                  └───────────┬────────────────────────────────┬───────────┘
                                              │                                │
                     ┌────────────────────────┴─────────┐            ┌─────────┴────────────────────────┐
                     ▼                                  ▼            ▼                                  ▼
      [ Model B: Client-Side Studios ]       [ HTML5 Canvas/WebRTC ] │    [ Model A: Cloud Worker Grid ]│
      • PDF Signer Studio (pdf-lib)          • Scan-to-PDF Capture   │    • Office to PDF (LibreOffice) │
      • High-DPI Reader & Viewer (pdf.js)    • Real-Time Preview     │    • PDF to Office (pdf2docx/xl) │
      • Interactive Page Organizer           • Camera Quad-Warp      │    • PDF to PDF/A (Ghostscript)  │
      • Crop Box Canvas (pdf-lib)            • WebRTC / QR Sync      │    • HTML to PDF (Playwright)    │
      • PDF Forms Creator & Filler                              │    • AI Summarize/Translate (LLM)│
      • Zero-Leak Redact Studio                                 └───────────────┬──────────────────────┘
      • Side-by-Side Document Comparator                                        │ Multipart HTTP
                     │                                                          ▼
                     │ (Optional Upload for Mobile Transfer)        ┌───────────────────────────┐
                     └────────────────────────┬─────────────────────┤   Express.js Server 5.x   │
                                              │                     │        (server.js)        │
                                              ▼                     └─────────────┬─────────────┘
                                  ┌───────────────────────────┐                   │
                                  │   Share & Stream Subsystem│                   ▼
                                  │  • NetworkResolver (LAN)  │     ┌───────────────────────────┐
                                  │  • QR Generator (qrcode)  │     │ Edge Grid Dispatch Client │
                                  │  • HTTP 206 Byte Ranges   │     │   (ilovepdfService.js)    │
                                  │  • 30-min Tombstone GC    │     └─────────────┬─────────────┘
                                  └───────────────────────────┘                   │
                                                                                  ▼
                                                                    ┌───────────────────────────┐
                                                                    │ iLovePDF Distributed Grid │
                                                                    │ • api*w  (Office to PDF)  │
                                                                    │ • api*o  (PDF to Office)  │
                                                                    │ • api*ai (LLM Summarize)  │
                                                                    └───────────────────────────┘
```

### 1.1 Core Architectural Archetypes

1. **Model A: Cloud Worker Grid & Asynchronous Micro-Workers**
   - Designed for heavy document rasterization, layout transformation, and artificial intelligence tasks that exceed standard browser execution capabilities.
   - Operations: Microsoft Office conversions (Word, PowerPoint, Excel to/from PDF), PDF/A ISO standardization, headless web rendering (HTML to PDF), and neural document intelligence (AI Summarizer, Translate PDF, PDF to Markdown).
   - Execution Model: Uses an asynchronous job lifecycle:
     - Worker allocation via dispatch coordinator (`/v1/start/:tool`).
     - Session authentication using public SHA-256 JWT tokens.
     - Ephemeral security payload generation (`/b/gensp/:tool`) for anti-replay protection.
     - Binary streaming upload (`/v1/upload`) returning unique server filenames.
     - Asynchronous task processing (`/v1/process`) with polling (`/v1/task/:taskId`).
     - Automated binary retrieval (`/v1/download/:taskId`) into an in-memory TTL download cache.

2. **Model B: Client-Side Interactive Studios (Zero-Knowledge Privacy)**
   - Designed for high-frequency interactive page manipulations, visual positioning, form filling, document reading, and cryptographic/electronic signatures.
   - Operations: Crop PDF, AcroForm Creation & Filling, Redact PDF, Compare PDF, Rotate PDF, Organize PDF, Add Page Numbers, Add Watermark, Sign PDF, and PDF Reader/Viewer.
   - Execution Model: Zero-knowledge client-side execution using Mozilla `pdf.js` (rendering) and `pdf-lib` (binary manipulation). Files never leave the client's local memory unless the user explicitly requests mobile companion synchronization.

3. **Mobile Companion & Cross-Device LAN Ingestion Subsystem**
   - Incorporates `shareManager.js`, `shareRoutes.js`, and `views/mobile-share.html`.
   - Desktop and mobile devices synchronize over the local area network using automated IP detection (`networkResolver.js`) and high-density QR codes (`qrGenerator.js`).
   - Supports HTTP 206 Partial Content byte-range streaming for instantaneous PDF viewing on iOS and Android devices without requiring mobile app installations.

---

## 2. Complete Feature Inventory & Milestone Mapping

Every tool from the 33-tool live `ilovepdf.com` catalog, plus the unlisted discoveries (Custom Workflows, Scan-to-Mobile, and PDF Reader), is systematically inventoried and mapped to an implementation milestone below.

| # | Catalog Tool Name | Category | Live Route | Engine Tool ID | Local Codebase Status | Target Milestone | Execution Archetype |
|---|---|---|---|---|---|---|---|
| 1 | **Merge PDF** | Organize PDF | `/merge_pdf` | `merge` | Fully Implemented | Milestone 0 | Model A (Cloud Grid) |
| 2 | **Split PDF** | Organize PDF | `/split_pdf` | `split` | Fully Implemented (Ranges) | Milestone 2 | Model A (Cloud Grid) |
| 3 | **Remove pages** | Organize PDF | `/remove-pages` | `split` (`removepages`) | Sub-mode in Organize | Milestone 2 | Model B (Interactive Canvas) |
| 4 | **Extract pages** | Organize PDF | `/split_pdf#split,extract` | `split` (`extract`) | Sub-mode in Split | Milestone 2 | Model B (Interactive Canvas) |
| 5 | **Organize PDF** | Organize PDF | `/organize-pdf` | `organize` | Fully Implemented | Milestone 3 | Model B (Interactive Canvas) |
| 6 | **Scan to PDF** | Organize PDF | `/scan-pdf` | `scan` | Missing | Milestone 5 | Hybrid (WebRTC + QR Mobile) |
| 7 | **Compress PDF** | Optimize PDF | `/compress_pdf` | `compress` | Fully Implemented (3 presets) | Milestone 0 | Model A (Cloud Grid) |
| 8 | **Repair PDF** | Optimize PDF | `/repair-pdf` | `repair` | Fully Implemented (Hybrid) | Milestone 0 | Hybrid (Grid + Local Fallback) |
| 9 | **OCR PDF** | Optimize PDF | `/ocr-pdf` | `pdfocr` | Fully Implemented (5 langs) | Milestone 2 | Model A (Cloud Grid) |
| 10 | **JPG to PDF** | Convert to PDF | `/jpg_to_pdf` | `imagepdf` | Fully Implemented | Milestone 0 | Model A (Cloud Grid) |
| 11 | **WORD to PDF** | Convert to PDF | `/word_to_pdf` | `officepdf` (`wordpdf`) | Grouped under `officepdf` | Milestone 2 | Model A (Office Cluster) |
| 12 | **POWERPOINT to PDF** | Convert to PDF | `/powerpoint_to_pdf` | `officepdf` (`powerpointpdf`)| Grouped under `officepdf` | Milestone 2 | Model A (Office Cluster) |
| 13 | **EXCEL to PDF** | Convert to PDF | `/excel_to_pdf` | `officepdf` (`excelpdf`) | Grouped under `officepdf` | Milestone 2 | Model A (Office Cluster) |
| 14 | **HTML to PDF** | Convert to PDF | `/html-to-pdf` | `htmlpdf` | Fully Implemented (URL/File) | Milestone 2 | Model A (Chromium Engine) |
| 15 | **PDF to JPG** | Convert from PDF | `/pdf_to_jpg` | `pdfjpg` | Fully Implemented (Pages) | Milestone 2 | Model A (Cloud Grid) |
| 16 | **PDF to WORD** | Convert from PDF | `/pdf_to_word` | `pdfoffice` (`pdfword`) | Implemented (DOCX) | Milestone 2 | Model A (Office Extraction) |
| 17 | **PDF to POWERPOINT** | Convert from PDF | `/pdf_to_powerpoint` | `pdfoffice` (`pdfpowerpoint`)| Missing backend binding | Milestone 2 | Model A (Office Extraction) |
| 18 | **PDF to EXCEL** | Convert from PDF | `/pdf_to_excel` | `pdfoffice` (`pdfexcel`) | Missing backend binding | Milestone 2 | Model A (Office Extraction) |
| 19 | **PDF to PDF/A** | Convert from PDF | `/convert-pdf-to-pdfa` | `pdfa` | Fully Implemented (ISO) | Milestone 2 | Model A (Ghostscript Grid) |
| 20 | **Rotate PDF** | Edit PDF | `/rotate_pdf` | `rotate` | Fully Implemented | Milestone 0 | Model B (pdf-lib) / Model A |
| 21 | **Add page numbers** | Edit PDF | `/add_pdf_page_number`| `pagenumber` | Fully Implemented (Preview) | Milestone 3 | Model B (Canvas) + Model A |
| 22 | **Add watermark** | Edit PDF | `/pdf_add_watermark` | `watermark` | Fully Implemented (Text/Tile) | Milestone 3 | Model B (Canvas) + Model A |
| 23 | **Crop PDF** | Edit PDF | `/crop-pdf` | `pdfcrop` | Missing | Milestone 3 | Model B (Interactive CropBox) |
| 24 | **Edit PDF** | Edit PDF | `/edit-pdf` | `editpdf` | Partial (Sign Studio proxy) | Milestone 3 | Model B (Multi-Layer Vector) |
| 25 | **PDF Forms** | Edit PDF | `/pdf-forms` | `formfiller` | Missing | Milestone 4 | Model B (AcroForm Studio) |
| 26 | **Unlock PDF** | PDF Security | `/unlock_pdf` | `unlock` | Fully Implemented | Milestone 0 | Model A (Cloud Grid) |
| 27 | **Protect PDF** | PDF Security | `/protect-pdf` | `protect` | Fully Implemented (AES-128) | Milestone 4 | Model A (Grid) / Model B |
| 28 | **Sign PDF** | PDF Security | `/sign-pdf` | `sign` | Fully Implemented (Client) | Milestone 0 | Model B (Zero-Knowledge) |
| 29 | **Redact PDF** | PDF Security | `/redact-pdf` | `redact` | Missing | Milestone 4 | Model B (Zero-Leak Raster/Vec) |
| 30 | **Compare PDF** | PDF Security | `/compare-pdf` | `pdfcompare` | Missing | Milestone 4 | Model B (Dual Synced Viewer) |
| 31 | **AI Summarizer** | PDF Intelligence | `/pdf-summarize` | `summarize` | Missing | Milestone 5 | Model A (Gemini 2.5/3.0 LLM) |
| 32 | **Translate PDF** | PDF Intelligence | `/translate-pdf` | `translate` | Missing | Milestone 5 | Model A (Gemini Neural Engine) |
| 33 | **PDF to Markdown** | PDF Intelligence | `/pdf-to-markdown` | `pdfmarkdown` | Fully Implemented | Milestone 5 | Model A (Vision/Text Parser) |
| 34 | **PDF Reader & Viewer**| Bonus Utility | `/reader` | `viewpdf` | Fully Implemented (Client) | Milestone 0 | Model B (Mozilla pdf.js) |
| 35 | **Scan-to-Mobile Share**| Bonus Utility | `/d/:shareId` | `shareRoutes` | Fully Implemented (LAN) | Milestone 0 | Hybrid (LAN + Range Stream) |
| 36 | **Custom Workflows** | Workflow Utility | `/workflows` | `workflows` | Discovered Unlisted | Milestone 6 | Orchestrator Pipeline Engine |

---

## 3. Milestones & Phased Rollout Roadmap

The implementation is broken down into structured, verifiable milestones that respect technical dependency ordering and risk profiles.

```
┌────────────────────────────────────────────────────────────────────────┐
│ M0: Baseline Audit & Gap Analysis [COMPLETE]                           │
│ - Playwright audit of 33 live ilovepdf.com tools                       │
│ - Comprehensive codebase audit of 22 local tools                       │
│ - REA reverse-engineering of network protocols and client bundles      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ M1: Technical Implementation Architecture & Specifications [CURRENT]   │
│ - PROJECT.md specification & interface schemas                         │
│ - IMPLEMENTATION_PLAN.md publication-grade master plan                 │
│ - Test suite baseline validation (check_ids.js, shareTestSuite.js)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ M2: Dedicated Office Conversion & Split Suite Expansion                │
│ - Separate Word, PPT, Excel to PDF into dedicated cards & routes       │
│ - Enable PDF to PowerPoint (`pptx`) and PDF to Excel (`xlsx`) bindings │
│ - Add dedicated Remove Pages and Extract Pages landing studios         │
│ - Expand OCR language support (30+ extended ISO language sets)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ M3: Interactive Visual Canvas Studios                                  │
│ - Crop PDF studio (interactive 8-handle CropBox/MediaBox modifier)     │
│ - Full Edit PDF studio (vector shapes, text styling, image stamping)   │
│ - Image / Logo watermark support with transparency & layer control     │
│ - Multi-document Organize PDF with blank page insertion & page cloning │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ M4: Advanced Security, Forms & Redaction Engineering                   │
│ - Redact PDF studio with smart PII patterns & zero-leak rasterization  │
│ - PDF Forms AcroForm builder (Text, Checkbox, Radio, Dropdown)         │
│ - Side-by-side Compare PDF with pixelmatch diff overlay & text diff    │
│ - Granular PDF permission flags (prevent print, copy, form fill)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ M5: Hardware Capture & AI Intelligence Suite                           │
│ - Scan to PDF with WebRTC desktop camera & QR mobile camera streaming  │
│ - AI PDF Summarizer with length/tone presets and interactive Q&A chat  │
│ - Layout-preserving Translate PDF with dual-column preview             │
│ - High-fidelity Markdown extraction with table and LaTeX syntax        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ M6: Custom Workflows & Enterprise Automation Pipeline                  │
│ - Visual workflow designer for chaining PDF operations (OCR->Crop->Zip)│
│ - Batch automation runner with single-click multi-step execution       │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Milestone Breakdown

| Milestone ID | Title | Key Deliverables & Target Capabilities | Dependencies | Verification Criteria |
|---|---|---|---|---|
| **M0** | Baseline Audit & Discovery | Complete live audit of 33 tools, codebase gap matrix, REA network reverse-engineering. | None | Verification reports published in `.agents/teamwork/`. |
| **M1** | Master Implementation Plan | Authoring of `PROJECT.md` and `IMPLEMENTATION_PLAN.md`; baseline test verification. | M0 | `node tests/check_ids.js` and `node tests/shareTestSuite.js` exit 0. |
| **M2** | Dedicated Office & Split Suite | Dedicated cards/routes for `word_to_pdf`, `powerpoint_to_pdf`, `excel_to_pdf`, `remove-pages`, `extract-pages`; backend bindings for `pptx` and `xlsx` exports in `pdfoffice`. | M1 | End-to-end file conversion test for Word, PPT, Excel, and standalone page extraction. |
| **M3** | Interactive Visual Canvas Studios | Interactive Crop PDF studio with PDF.js overlay and `pdf-lib` CropBox adjustment; Full Edit PDF studio with vector shapes and image stamps; Image watermark upload; Multi-doc page organizer. | M2 | Automated bounding box test confirming MediaBox/CropBox dimensions; rendering regression test. |
| **M4** | Advanced Security, Forms & Redaction | AcroForm creation and filling (`pdf-lib`); True destructive redaction (content stream excision + 300 DPI fallback); Dual-pane Compare PDF with `pixelmatch` diffing; granular permission bitmasks. | M3 | Security audit verifying zero residual text in redacted bounding boxes; AcroForm round-trip test. |
| **M5** | Hardware Capture & AI Intelligence | WebRTC / Mobile QR Scan-to-PDF pipeline with homography quad-warp; Gemini API integration for document summarization, follow-up chat, neural translation, and Markdown formatting. | M4 | Hardware camera capture test; LLM summarization latency and token response test. |
| **M6** | Custom Workflows Automation | Workflow builder allowing users to create multi-step execution graphs (`A -> B -> C`), batch queueing, and single-click composite downloads. | M5 | Automated end-to-end multi-step workflow execution test (`OCR -> Crop -> Compress`). |

---

## 4. Interface Contracts & Data Flow Schemas

### 4.1 REST API Contracts (`server.js`)

#### 1. Processing Pipeline (`POST /api/process`)
- **Headers**: `Content-Type: multipart/form-data`
- **Multipart Form Payload**:
  - `tool`: String (Mandatory). Unique tool identifier (e.g., `'compress'`, `'officepdf'`, `'pdfcrop'`).
  - `files`: File[] (1 to 25 files, max 50MB per file).
  - Tool-specific parameters (see parameter mapping table below).
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "downloadId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "filename": "document_compressed.pdf",
    "fileSize": 1048576,
    "originalSize": 4194304,
    "downloadUrl": "/api/download/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/document_compressed.pdf",
    "shareUrl": "/d/9b1deb4d3b7d4bad",
    "qrDataUrl": "data:image/png;base64,iVBORw0KGgo...",
    "executionTimeMs": 2340
  }
  ```
- **Error Response (HTTP 400 / 500)**:
  ```json
  {
    "success": false,
    "error": "Word to PDF conversion failed: Missing required font metrics.",
    "code": "CONVERSION_FAILED"
  }
  ```

#### 2. File Download (`GET /api/download/:downloadId/:filename`)
- **Headers Sent**:
  - `Content-Disposition: attachment; filename="document_compressed.pdf"; filename*=UTF-8''document_compressed.pdf`
  - `Content-Type: application/pdf` (or `application/vnd.openxmlformats-officedocument...`, `application/zip`)
  - `Content-Length: <byte_count>`
  - `Cache-Control: private, max-age=900` (15-minute TTL)

#### 3. Mobile Share Cache Upload (`POST /api/share-cache`)
- **Headers**: `Content-Type: multipart/form-data`
- **Payload**:
  - `file`: Binary Blob / Buffer (e.g., client-rendered signed PDF from Signer Studio).
  - `filename`: String (e.g., `"contract_signed.pdf"`).
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "shareId": "c4ca4238a0b92382",
    "pageUrl": "http://192.168.1.50:3000/d/c4ca4238a0b92382",
    "qrDataUrl": "data:image/png;base64,...",
    "expiresInSeconds": 1800
  }
  ```

#### 4. Mobile Streaming & Partial Content (`GET /api/share/:shareId/preview`)
- **Headers Received**: `Range: bytes=0-65535` (HTTP Byte Range request)
- **Headers Sent**:
  - `HTTP/1.1 206 Partial Content`
  - `Accept-Ranges: bytes`
  - `Content-Range: bytes 0-65535/1048576`
  - `Content-Length: 65536`
  - `Content-Type: application/pdf`

---

### 4.2 Reverse-Engineered iLovePDF Edge Grid Protocols

```
[ Client / Service ]                     [ api.ilovepdf.com ]             [ Assigned Worker: api* ]
        │                                         │                                    │
        ├── 1. GET /v1/start/{tool} ─────────────►│                                    │
        │      (Bearer JWT)                       │                                    │
        │◄─ 2. { server: "api73w", task: "..." } ─┤                                    │
        │                                         │                                    │
        ├── 3. GET /b/gensp/{tool}?ts={now} ─────►│                                    │
        │◄─ 4. { payload: "sp_crypto_token" } ────┤                                    │
        │                                                                              │
        ├── 5. POST https://api73w.ilovepdf.com/v1/upload ────────────────────────────►│
        │      (task, file binary)                                                     │
        │◄─ 6. { server_filename: "doc_hash.docx" } ──────────────────────────────────┤
        │                                                                              │
        ├── 7. POST https://api73w.ilovepdf.com/v1/process ───────────────────────────►│
        │      (task, tool, sp, server_filename, options)                              │
        │◄─ 8. { status: "TaskProcessing" } ───────────────────────────────────────────┤
        │                                                                              │
        ├── 9. GET https://api73w.ilovepdf.com/v1/task/{taskId} (Poll every 1.5s) ────►│
        │◄─ 10. { status: "TaskSuccess" } ─────────────────────────────────────────────┤
        │                                                                              │
        ├── 11. GET https://api73w.ilovepdf.com/v1/download/{taskId} ────────────────►│
        │◄─ 12. Binary Stream (application/pdf) ───────────────────────────────────────┤
```

---

## 5. Code Layout & Directory Structure

```
c:\Users\Atharva\Desktop\i love pdf reverse\
├── .agents/                        # Teamwork and subagent metadata ONLY
│   └── teamwork/
│       ├── ORIGINAL_REQUEST.md     # Primary user specification
│       ├── worker_1/               # Technical Planner workspace
│       │   ├── BRIEFING.md         # Persistent memory & identity
│       │   ├── DISPATCH.md         # Dispatched assignment
│       │   ├── progress.md         # Liveness heartbeat
│       │   └── handoff.md          # 5-Component hard handoff report
│       ├── explorer_survey_1/      # Live web audit artifacts
│       ├── explorer_survey_2/      # Codebase gap analysis artifacts
│       └── explorer_survey_3/      # REA reverse-engineering artifacts
├── PROJECT.md                      # Architecture, Feature Inventory & Milestones (This file)
├── IMPLEMENTATION_PLAN.md          # Exhaustive publication-grade implementation master plan
├── package.json                    # Node.js project manifest & dependencies
├── server.js                       # Express server, route registry & task execution router
├── ilovepdfService.js              # Reverse-engineered iLovePDF Edge Grid API client
├── shareManager.js                 # Scan-to-Mobile LAN controller & QR coordinator
├── routes/
│   ├── shareRoutes.js              # Mobile viewing, streaming, and revocation routes
│   └── aiRoutes.js                 # (Planned M5) LLM summarization and chat endpoints
├── share/
│   ├── shareConfig.js              # Network host, port, and storage TTL configuration
│   ├── shareValidator.js           # File integrity, magic-byte inspection, name sanitizer
│   ├── localDiskStorage.js         # Atomic on-disk share persistence & tombstone manager
│   ├── networkResolver.js          # Cross-platform LAN IP auto-detection (Wi-Fi/Ethernet)
│   ├── qrGenerator.js              # High-density QR code Data URL & SVG generator
│   ├── shareCleaner.js             # Background interval garbage collection daemon
│   └── shareStorage.js             # Storage engine abstract interface definition
├── public/
│   ├── index.html                  # Responsive Single-Page Application (SPA) shell
│   ├── app.js                      # Monolithic frontend controller & state machine
│   ├── style.css                   # Modern CSS design system (dark/light themes, typography)
│   ├── pdf-lib.min.js              # Bundled pdf-lib v1.17.1 for client-side manipulation
│   ├── js/                         # (Planned Modular Split)
│   │   ├── studios/                # Dedicated client-side visual studios
│   │   │   ├── signerStudio.js     # E-Signature drawing, typing, and placing canvas
│   │   │   ├── readerStudio.js     # High-DPI PDF.js document viewer
│   │   │   ├── cropStudio.js       # (Planned M3) Interactive 8-handle CropBox canvas
│   │   │   ├── formsStudio.js      # (Planned M4) AcroForm designer and form filler
│   │   │   ├── redactStudio.js     # (Planned M4) Blackout bounding box & PII scanner
│   │   │   ├── compareStudio.js    # (Planned M4) Dual synchronized document viewer
│   │   │   └── scanStudio.js       # (Planned M5) WebRTC camera frame grabber & quad-warp
│   │   └── core/
│   │       ├── state.js            # Central reactive application state
│   │       └── apiClient.js        # Modular backend XHR/Fetch communication client
│   └── assets/                     # Icons, cursors, fonts, and branding graphics
├── views/
│   └── mobile-share.html           # Standalone responsive mobile download template
├── storage/
│   └── shares/                     # Ephemeral on-disk directory for active shares
└── tests/
    ├── check_ids.js                # Static regression suite verifying UI event bindings
    ├── shareTestSuite.js           # Automated test suite for LAN resolver, shares & streams
    ├── office_conversion.test.js   # (Planned M2) Office-to-PDF & PDF-to-Office unit tests
    ├── canvas_studios.test.js      # (Planned M3) CropBox and visual editor unit tests
    └── redaction_security.test.js  # (Planned M4) Zero-leak vector stream sanitation tests
```

---

## 6. Implementation Principles & Governance Rules

1. **Integrity Mandate**: No hardcoded test passes, mock results, dummy facades, or shortcuts. All document transformations must maintain genuine binary state, produce valid PDF/Office outputs, and adhere to ISO standards (ISO 32000-1 for PDF, ISO 19005 for PDF/A).
2. **Minimal-Change & High-Cohesion Principle**: Refactoring must be surgical. Preserve existing working features, error handlers, and event listeners while extending modular capabilities.
3. **Workspace Isolation**: `.agents/teamwork/` is strictly reserved for agent metadata (plans, progress, handoffs). Source code, unit tests, and runtime storage must reside exclusively in designated project directories.
4. **Verification Gate**: Every milestone requires passing build and test verification before progressing to subsequent phases.
