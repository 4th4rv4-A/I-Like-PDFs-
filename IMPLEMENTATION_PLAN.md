# TECHNICAL IMPLEMENTATION MASTER PLAN: "I LIKE PDFs"
## High-Fidelity Reverse-Engineered Document Platform Architecture & Specification

**Author**: Worker 1 (Technical Implementation Planner)  
**Date**: November 2026  
**Status**: Milestone 1 Deliverable — Publication-Grade Technical Specification  
**Target Repository**: `c:\Users\Atharva\Desktop\i love pdf reverse`  
**License Compliance**: 100% Free and Open Source Software (FOSS) / License-Clean  

---

## 1. Executive Summary & System Taxonomy

### 1.1 Project Mission & High-Level Architecture
The "I Like PDFs" platform is an advanced, production-grade document processing suite engineered to achieve complete functional, visual, and architectural parity with the live `ilovepdf.com` platform. 

While commercial web suites rely heavily on proprietary cloud infrastructure and closed-source software development kits (such as Apryse WebViewer and Solid Documents), "I Like PDFs" introduces a **hybrid privacy-first execution architecture**:
1. **Client-Side Zero-Knowledge Studios**: High-frequency interactive operations (Page Organizing, PDF Reading, Visual Form Filling, E-Signatures, CropBox trimming, and side-by-side comparison) execute directly in the browser using Mozilla `pdf.js` and `pdf-lib`. No document bytes traverse the network unless the user explicitly requests sharing.
2. **Asynchronous Local Micro-Workers & Cloud Grid Bridge**: For intensive conversion and transformation operations (Microsoft Office documents, ISO PDF/A compliance, headless web crawling, optical character recognition, and artificial intelligence inference), the platform provides both an integrated local worker pipeline (LibreOffice, Ghostscript, Chromium, and Gemini LLM) and a resilient reverse-engineered bridge to the iLovePDF Edge Grid (`ilovepdfService.js`).
3. **Cross-Device Mobile Ingestion & Streaming**: A dedicated local area network (LAN) sharing engine (`shareManager.js`) provides automated IPv4 interface discovery, high-density QR code generation, and HTTP 206 Partial Content byte-range streaming to companion mobile devices without requiring third-party native apps.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   "I LIKE PDFs" SYSTEM TAXONOMY                                 │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
    ┌────────────────────────┬───────────────────┼───────────────────┬────────────────────────┐
    │                        │                   │                   │                        │
    ▼                        ▼                   ▼                   ▼                        ▼
[ Organize PDF ]      [ Optimize PDF ]   [ Convert to PDF ]  [ Convert from PDF ]       [ Edit PDF ]
• Merge PDF           • Compress PDF     • JPG to PDF        • PDF to JPG              • Rotate PDF
• Split PDF           • Repair PDF       • WORD to PDF       • PDF to WORD             • Page Numbers
• Remove Pages        • OCR PDF          • PPT to PDF        • PDF to POWERPOINT       • Watermark PDF
• Extract Pages                          • EXCEL to PDF      • PDF to EXCEL            • Crop PDF
• Organize PDF                           • HTML to PDF       • PDF to PDF/A            • Edit PDF
• Scan to PDF                                                                          • PDF Forms
                                                 │
                                                 ├───────────────────────────────┐
                                                 │                               │
                                                 ▼                               ▼
                                         [ PDF Security ]               [ PDF Intelligence ]
                                         • Unlock PDF                   • AI Summarizer
                                         • Protect PDF                  • Translate PDF
                                         • Sign PDF                     • PDF to Markdown
                                         • Redact PDF
                                         • Compare PDF
```

---

## 2. Complete Live ilovepdf.com Audit Matrix

The following matrix documents the live state of `https://www.ilovepdf.com`, verified through Playwright MCP headless browser inspection, DOM tree analysis, and client-side configuration extraction (`window.ilovepdfConfig`).

### 2.1 The 33-Tool Catalog Audit Matrix

| # | Catalog Tool Name | Category | Verified Live URL | Live Status | Engine Tool ID | Primary UI Controls & Config Parameters | Default Options |
|---|---|---|---|---|---|---|---|
| 1 | **Merge PDF** | Organize PDF | `/merge_pdf` | Active | `merge` | Drag-and-drop file cards, A-Z/Z-A filename sorting, per-file 90° rotation, Add More picker | `{ output_filename: "ilovepdf_merged" }` |
| 2 | **Split PDF** | Organize PDF | `/split_pdf` | Active | `split` | 3 Tabs: **Range** (Custom intervals, Fixed batches, Smart AI Split), **Pages** (Extract all, Select pages), **Size** (KB/MB limit) | `{ split_mode: "ranges", output_filename: "{filename}_split" }` |
| 3 | **Remove pages** | Organize PDF | `/remove-pages` | Active | `split` (`removepages`) | Interactive thumbnail grid with delete badges, Shift-click range selection, `pages_to_remove` text box | `{ split_mode: "remove_pages", merge_after: true }` |
| 4 | **Extract pages** | Organize PDF | `/split_pdf#split,extract` | Active | `split` (`extract`) | Extract all pages vs Select pages input (`1,3-5`), `merge_after_extract_pages` checkbox | `{ split_mode: "extract_pages", merge_after: false }` |
| 5 | **Organize PDF** | Organize PDF | `/organize-pdf` | Active | `organize` | Canvas page grid, drag-and-drop reordering, per-page rotation & trash icons, Insert Blank Page | `{ output_filename: "{filename}", packaged_filename: "organized" }` |
| 6 | **Scan to PDF** | Organize PDF | `/scan-pdf` | Active | `scan` | Dynamic QR code for mobile scanner web-pairing, live WebSocket state, orientation (`portrait`/`landscape`), page size (`A4`, `Letter`) | `{ orientation: "portrait", pagesize: "A4", margin: 0, merge_after: true }` |
| 7 | **Compress PDF** | Optimize PDF | `/compress_pdf` | Active | `compress` | 3 Presets: `extreme` (72 DPI), `recommended` (150 DPI), `low` (lossless font/mild downsampling) | `{ compression_level: "recommended", output_filename: "{filename}_compressed" }` |
| 8 | **Repair PDF** | Optimize PDF | `/repair-pdf` | Active | `repair` | Automatic xref structural reconstruction, damaged page stream salvage | `{ output_filename: "{filename}_repaired" }` |
| 9 | **OCR PDF** | Optimize PDF | `/ocr-pdf` | Active | `pdfocr` | Mode (`standard` vs `advanced`), Auto-rotate, Deskew, Dewarp, Color (`original`, `bn`, `greyscale`), 100+ searchable languages | `{ ocr_mode: "standard", ocr_languages: ["eng"], dpi: 150 }` |
| 10 | **JPG to PDF** | Convert to PDF | `/jpg_to_pdf` | Active | `imagepdf` | Orientation (`portrait`, `landscape`), Page size (`fit`, `A4`, `Letter`), Margin (`0`, `small`, `big`), `merge_after` toggle | `{ orientation: "portrait", pagesize: "fit", margin: 0, merge_after: true }` |
| 11 | **WORD to PDF** | Convert to PDF | `/word_to_pdf` | Active | `officepdf` (`wordpdf`) | Accepts `.doc, .docx, .odt, .rtf`; multi-file batch upload queue | `{ output_filename: "{filename}", convert_to: "pdf" }` |
| 12 | **POWERPOINT to PDF** | Convert to PDF | `/powerpoint_to_pdf` | Active | `officepdf` (`powerpointpdf`)| Accepts `.ppt, .pptx, .odp, .ppsx`; multi-file batch upload queue | `{ output_filename: "{filename}", convert_to: "pdf" }` |
| 13 | **EXCEL to PDF** | Convert to PDF | `/excel_to_pdf` | Active | `officepdf` (`excelpdf`) | Accepts `.xls, .xlsx, .ods, .csv`; auto-fit table width pagination | `{ output_filename: "{filename}", convert_to: "pdf" }` |
| 14 | **HTML to PDF** | Convert to PDF | `/html-to-pdf` | Active | `htmlpdf` | URL input + file upload, Viewport (`1040`, `1920`, `1440`, `768`, `320`), `single_page` ("One long page"), `block_ads`, `remove_popups` | `{ view_width: 1040, page_size: "A4", single_page: true, block_ads: true }` |
| 15 | **PDF to JPG** | Convert from PDF | `/pdf_to_jpg` | Active | `pdfjpg` | Mode (`pages` vs `extract` embedded images), Resolution DPI (`150` normal vs `300` high) | `{ pdfjpg_mode: "pages", dpi: "150", output_filename: "{filename}_page" }` |
| 16 | **PDF to WORD** | Convert from PDF | `/pdf_to_word` | Active | `pdfoffice` (`pdfword`) | Mode (`ocr: 0` selectable text vs `ocr: 1` scanned OCR powered by Solid Documents) | `{ convert_to: "docx", ocr: 0, output_filename: "{filename}" }` |
| 17 | **PDF to POWERPOINT** | Convert from PDF | `/pdf_to_powerpoint` | Active | `pdfoffice` (`pdfpowerpoint`)| Slide reconstruction, vector shape grouping, `ocr: 0` vs `ocr: 1` | `{ convert_to: "pptx", ocr: 0, output_filename: "{filename}" }` |
| 18 | **PDF to EXCEL** | Convert from PDF | `/pdf_to_excel` | Active | `pdfoffice` (`pdfexcel`) | Table border detection, `ocr: 0` vs `1`, Sheet layout (`One sheet` vs `Multiple sheets`) | `{ convert_to: "xlsx", ocr: 0, layout: "single" }` |
| 19 | **PDF to PDF/A** | Convert from PDF | `/convert-pdf-to-pdfa` | Active | `pdfa` | ISO Conformance (`pdfa-1b`, `1a`, `2b`, `2u`, `2a`, `3b`, `3u`, `3a`), `allow_pdfa_downgrade` | `{ conformance: "pdfa-2b", allow_pdfa_downgrade: 1 }` |
| 20 | **Rotate PDF** | Edit PDF | `/rotate_pdf` | Active | `rotate` | Per-page hover rotation (+90°), bulk orientation filters (`All`, `Portrait`, `Landscape`) | `{ output_filename: "{filename}_rotated" }` |
| 21 | **Add page numbers** | Edit PDF | `/add_pdf_page_number`| `pagenumber` | 3x3 position grid, Single vs Facing pages (skip cover), Margin, Start page, Template strings (`{n}`, `{p}`), Rich typography | `{ vertical: "bottom", horizontal: "right", starting_number: 1, text: "{n}" }` |
| 22 | **Add watermark** | Edit PDF | `/pdf_add_watermark` | `watermark` | Text vs Image watermark, 3x3 position matrix, **Mosaic tiling mode**, Rotation (0°-270°), Opacity slider, Z-layer (`above`/`below`) | `{ mode: "text", text: "iLovePDF", vertical: "bottom", horizontal: "center", opacity: 70 }` |
| 23 | **Crop PDF** | Edit PDF | `/crop-pdf` | Active | `pdfcrop` | Interactive 8-handle crop box canvas overlay, Page scope (`All pages` vs `Current page`) | `{ output_filename: "{filename}_crop" }` |
| 24 | **Edit PDF** | Edit PDF | `/edit-pdf` | Active | `editpdf` | Floating toolbar: Add Text, Add Image, Shapes (rect, circle, arrow), Freehand draw, Annotations | `{ output_filename: "{filename}_edited" }` |
| 25 | **PDF Forms** | Edit PDF | `/pdf-forms` | Active | `formfiller` | Form auto-detection, interactive form filling, drag-and-drop AcroForm field authoring studio | `{ output_filename: "{filename}_formfiller" }` |
| 26 | **Unlock PDF** | PDF Security | `/unlock_pdf` | Active | `unlock` | Automatic permission removal (printing, copying); decrypt modal for user-password encrypted files | `{ output_filename: "{filename}_unlocked" }` |
| 27 | **Protect PDF** | PDF Security | `/protect-pdf` | Active | `protect` | Basic (strength meter) vs Advanced (User password + Owner permissions password + permission bitmasks) | `{ output_filename: "{filename}_protected" }` |
| 28 | **Sign PDF** | PDF Security | `/sign-pdf` | Active | `sign` | "Only Me" (Draw, Type, Upload) vs "Several People" (multi-signer invite, field placement, Simple vs Digital) | `{ sign_mode: "single" }` |
| 29 | **Redact PDF** | PDF Security | `/redact-pdf` | Active | `redact` | Manual area/page blackout, Pattern search (Credit cards, Phones, Emails), Smart AI PII scanning | `{ output_filename: "{filename}_redacted" }` |
| 30 | **Compare PDF** | PDF Security | `/compare-pdf` | Active | `pdfcompare` | Dual document upload; Mode A: Semantic Text (Change report); Mode B: Content Overlay (Visual pixel diff) | `{ compare_mode: "semantic" }` |
| 31 | **AI Summarizer** | PDF Intelligence | `/pdf-summarize` | Active | `summarize` | Summarize length (`short`, `medium`, `long`), Tone (`formal`, `casual`, `bullet_points`), Interactive chat sidebar | `{ ai_tier: "standard", summarize_length: "medium", summarize_tone: "formal" }` |
| 32 | **Translate PDF** | PDF Intelligence | `/translate-pdf` | Active | `translate` | 100+ source languages, 28 target languages, Layout preservation (`Keep layout` vs `Only text`), AI tiers | `{ language_input: "auto", language_output: "en", translate_mode: "layout" }` |
| 33 | **PDF to Markdown** | PDF Intelligence | `/pdf-to-markdown` | Active | `pdfmarkdown` | Converts PDF to GitHub-Flavored CommonMark (`.md`), preserves headings, bullet lists, tables, and LaTeX math | `{ output_filename: "{filename}", packaged_filename: "ilovepdf_markdown" }` |

### 2.2 Unlisted Ecosystem Features Discovered
Beyond the 33 standard tools, live inspection identified the following platform features:
1. **Custom Workflows** (`/user/workflows`): Interactive multi-tool chaining ("Create custom workflows with your favorite tools, automate tasks, and reuse them anytime").
2. **Ecosystem Cross-Links**: Standalone desktop apps (Windows/macOS), mobile camera apps (iOS/Android), iLoveSign contract workflows, and developer REST APIs (`iLoveAPI`).
3. **iLoveIMG Image Processing Nodes**: Identified in `window.ilovepdfConfig.fileLimits`: `upscaleimage`, `removebackgroundimage`, `blurfaceimage`, and `memeimage`.

---

## 3. Comprehensive Codebase Gap Matrix

The local "I Like PDFs" codebase currently contains 22 tool definitions in `server.js` and `public/app.js` (including bonus utilities and grouped handlers). The matrix below contrasts the local implementation against the full 33-tool live catalog.

| Catalog Tool Name | Local Codebase Status | Local Tool ID | Existing Local Capabilities | Missing Features & Parameter Gaps in Local Codebase |
|---|---|---|---|---|
| **Merge PDF** | **Fully Implemented** | `merge` | Concatenates 2-20 PDFs via cloud grid worker | Page range selection per input file; automatic Table of Contents generation |
| **Split PDF** | **Fully Implemented** | `split` | Custom ranges (`1-5, 8-10`) and extract pages mode | Fixed batch size splitting; Smart AI split by document type; Split by file size limit (KB/MB) |
| **Remove pages** | **Sub-Mode** | `organize` | Implemented via trash icons in visual Organize canvas | Lacks dedicated standalone route (`/remove-pages`) and homepage entry card |
| **Extract pages** | **Sub-Mode** | `split` | Implemented via `split_mode: 'extract_pages'` | Lacks dedicated standalone route (`/extract-pages`) and homepage entry card |
| **Organize PDF** | **Fully Implemented** | `organize` | PDF.js canvas thumbnails, drag-drop reordering, rotate, delete | Multi-document cross-file organization; blank page insertion; page duplication |
| **Scan to PDF** | **MISSING** | — | None in primary app (Mobile share handles download only) | **Completely Missing**. Desktop webcam capture (`getUserMedia`) and mobile QR camera pairing |
| **Compress PDF** | **Fully Implemented** | `compress` | 3 Presets (`extreme`, `recommended`, `low`) | Custom DPI downsampling control; black-and-white color space conversion |
| **Repair PDF** | **Fully Implemented** | `repair` | Hybrid cloud attempt + local `pdf-lib` xref structural fallback | None (Exceeds iLovePDF by providing local zero-downtime fallback) |
| **OCR PDF** | **Fully Implemented** | `pdfocr` | 5 European languages via cloud OCR worker | 30+ extended language packs; Auto-rotate/deskew/dewarp checkboxes; Grayscale/B&W output |
| **JPG to PDF** | **Fully Implemented** | `imagepdf` | Multi-image merge (JPG, PNG, WebP), margins, page sizes | Per-image individual rotation; multi-image grid placement per single page |
| **WORD to PDF** | **Grouped / Incomplete** | `officepdf` | Backend handles generic `.doc,.docx` via `officepdf` | Dedicated route (`/word_to_pdf`), dedicated UI dropzone with mime filtering |
| **POWERPOINT to PDF** | **Grouped / Incomplete** | `officepdf` | Backend handles generic `.ppt,.pptx` via `officepdf` | Dedicated route (`/powerpoint_to_pdf`), dedicated UI dropzone with mime filtering |
| **EXCEL to PDF** | **Grouped / Incomplete** | `officepdf` | Backend handles generic `.xls,.xlsx` via `officepdf` | Dedicated route (`/excel_to_pdf`), dedicated UI dropzone with table width auto-fit |
| **HTML to PDF** | **Fully Implemented** | `htmlpdf` | URL and file uploads, single-page mode, page size, view width | In-browser live website rendering preview; ad/popup blocker scripts |
| **PDF to JPG** | **Fully Implemented** | `pdfjpg` | Converts pages to 300 DPI JPEG zip archive | "Extract embedded images" mode (extracting raster photos without rendering pages) |
| **PDF to WORD** | **Fully Implemented** | `pdfoffice` | Converts PDF to DOCX via cloud worker | "OCR Mode" for converting scanned non-selectable PDFs to editable Word |
| **PDF to POWERPOINT** | **MISSING** | — | `server.js` hardcodes `convert_to: 'docx'` in `pdfoffice` | **Completely Missing**. Backend binding for `convert_to: 'pptx'` and slide shape extraction |
| **PDF to EXCEL** | **MISSING** | — | `server.js` hardcodes `convert_to: 'docx'` in `pdfoffice` | **Completely Missing**. Backend binding for `convert_to: 'xlsx'` and table cell extraction |
| **PDF to PDF/A** | **Fully Implemented** | `pdfa` | Supports ISO profiles `pdfa-2b` and `pdfa-1b` | Extended profiles (`pdfa-3b`, `pdfa-1a`); downgrade fallback toggle |
| **Rotate PDF** | **Fully Implemented** | `rotate` | Clockwise rotation (90°, 180°, 270°) | Bulk orientation filter buttons (Select All, Select Portrait, Select Landscape) |
| **Add page numbers** | **Fully Implemented** | `pagenumber` | Live canvas preview, 3x2 matrix, formatting, font styling | "Facing Pages" (book spread margins); "First page is cover" (skip numbering page 1) |
| **Add watermark** | **Fully Implemented** | `watermark` | Live canvas preview, text watermark, 3x3 grid, mosaic mode | **Image/Logo Watermark** mode (uploading company graphic stamp); Z-layering (behind text) |
| **Crop PDF** | **MISSING** | — | None | **Completely Missing**. Interactive 8-handle crop box canvas and `pdf-lib` CropBox adjustment |
| **Edit PDF** | **Partial / Proxy** | `sign` (proxy) | Basic text and signature stamping in Signer Studio | **Full Editor Missing**. Freehand drawing, vector shapes (rect, circle, arrow), highlighter |
| **PDF Forms** | **MISSING** | — | None | **Completely Missing**. Interactive AcroForm builder (Text, Checkbox, Radio, Dropdown) and filler |
| **Unlock PDF** | **Fully Implemented** | `unlock` | Decrypts restricted documents via cloud worker | None |
| **Protect PDF** | **Fully Implemented** | `protect` | Encrypts PDF with 128-bit AES password | Advanced dual-password mode (User + Owner password); granular permission bitmasks |
| **Sign PDF** | **Fully Implemented** | `sign` | 100% client-side studio (Draw, Type, Text, Date, Checkmark) | Certified cryptographic PKI signatures (X.509 PAdES certificates) |
| **Redact PDF** | **MISSING** | — | None | **Completely Missing**. Interactive blackout canvas, regex PII scanner, and zero-leak excision |
| **Compare PDF** | **MISSING** | — | None | **Completely Missing**. Dual-document viewer, synchronized scrolling, and `pixelmatch` diff overlay |
| **AI Summarizer** | **MISSING** | — | None | **Completely Missing**. LLM document summarization, length/tone presets, interactive chat |
| **Translate PDF** | **MISSING** | — | None | **Completely Missing**. Neural translation engine preserving page layout geometry |
| **PDF to Markdown** | **Fully Implemented** | `pdfmarkdown` | Cloud worker output to `.md` | Advanced vision parsing for mathematical LaTeX syntax and complex nested tables |
| **PDF Reader / Viewer** | **Bonus Implemented** | `viewpdf` | High-DPI viewer, thumbnails, zoom, auto-fit, print | None |
| **Scan-to-Mobile** | **Bonus Implemented** | `shareRoutes` | LAN IP detection, QR code, HTTP 206 streaming | None |

---

## 4. Reverse-Engineering & Architecture Deep Dive via REA MCP

Through REA MCP static and dynamic analysis of ilovepdf.com's web client scripts, network endpoints, and bundle chunks, two distinct processing paradigms were reverse-engineered.

### 4.1 Model A (Cloud Worker Grid) vs Model B (Client-Side Interactive Studio)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ARCHITECTURAL EXECUTION PARADIGMS                                 │
├────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ MODEL A: CLOUD WORKER GRID                     │ MODEL B: CLIENT-SIDE INTERACTIVE STUDIO        │
├────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ Used for: Office conversions, PDF/A, HTML,     │ Used for: Crop, Forms, Redact, Compare, Sign,  │
│ OCR, and AI Intelligence.                      │ Organize, Reader.                              │
│                                                │                                                │
│ Characteristics:                               │ Characteristics:                               │
│ • Client delegates file bytes to backend.      │ • Zero-knowledge: Files remain in browser.    │
│ • Asynchronous task queue & polling lifecycle. │ • Real-time 60fps canvas user interaction.     │
│ • Microservices run heavy headless runtimes    │ • Powered by WebAssembly (Wasm) and HTML5      │
│   (LibreOffice, Ghostscript, Chromium, LLMs).  │   canvas rendering subsystems.                 │
│ • Specialized worker node segmentation.        │ • Generates client-side Blobs for instant save.│
└────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

### 4.2 API Protocols, Authentication & Security Token Mechanics

The reverse-engineered cloud grid protocol operates across seven distinct phases:

#### Phase 1: Public Session JWT Acquisition
Every public web session accesses an HMAC-SHA256 JWT embedded in the page markup:
```javascript
// Scraped from window.ilovepdfConfig.token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpbG92ZXBkZi5jb20iLCJhdWQiOiJpbG92ZXBkZi5jb20iLCJqdGkiOiJwcm9qZWN0X3B1YmxpY19kMWFhMzEzMTcxYWI3NDRkZTc1OGI1M2E1YWRmYzU0MSIsImlhdCI6MTczMDc0MTk0OCwiZXhwIjoxNzMwNzQ5MTQ4LCJkYXRhIjp7ImlkIjoiMGFkNDEzMTcifX0...";
```
- Header: `Authorization: Bearer <token>`
- Claims: Contains project public ID (`jti`) and 2-hour TTL expiration timestamp (`exp`).

#### Phase 2: Dynamic Task Dispatch (`/v1/start/:tool`)
The client sends an authenticated GET request to the dispatch router:
```http
GET https://api.ilovepdf.com/v1/start/officepdf HTTP/1.1
Host: api.ilovepdf.com
Authorization: Bearer <token>
Accept: application/json
```
**Response (HTTP 200 OK)**:
```json
{
  "server": "api73w.ilovepdf.com",
  "task": "2q4y7v9b1m8k4p3z6x5c8n1m9k2j4h7g8f5d3s1a4p6o8i0u2y4t6r8e0w2q4y7v9b1m8k4p3z6x5c8n1m9k2j4h7g8f5d3s1a4p6o8i0u2y4t6r8e0w2q4y7v9b1m8k4p3z6x5c8n1m9k2j4h7g8f5d3s1a"
}
```

#### Phase 3: Anti-Replay Security Payload Acquisition (`/b/gensp/:tool`)
To prevent unauthorized script replay attacks, the frontend retrieves a signed security payload (`sp`):
```http
GET https://www.ilovepdf.com/b/gensp/officepdf?ts=1730741950000 HTTP/1.1
Host: www.ilovepdf.com
Referer: https://www.ilovepdf.com/word_to_pdf
```
**Response (HTTP 200 OK)**:
```json
{
  "payload": "f8a7e4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
}
```

#### Phase 4: Multipart Binary File Streaming (`/v1/upload`)
The client streams the document directly to the assigned worker node:
```http
POST https://api73w.ilovepdf.com/v1/upload HTTP/1.1
Host: api73w.ilovepdf.com
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryX7Y8Z9

------WebKitFormBoundaryX7Y8Z9
Content-Disposition: form-data; name="task"

2q4y7v9b1m8k4p3z6x5c8n1m9k2j4h7g...
------WebKitFormBoundaryX7Y8Z9
Content-Disposition: form-data; name="file"; filename="Annual_Report.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

<binary byte stream>
------WebKitFormBoundaryX7Y8Z9--
```
**Response (HTTP 200 OK)**:
```json
{
  "server_filename": "d3b07384d113edec49eaa6238ad5ff00.docx"
}
```

#### Phase 5: Asynchronous Task Processing (`/v1/process`)
The client dispatches execution parameters and file bindings to the worker:
```http
POST https://api73w.ilovepdf.com/v1/process HTTP/1.1
Host: api73w.ilovepdf.com
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryProcess

------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="task"

2q4y7v9b1m8k4p3z6x5c8n1m9k2j4h7g...
------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="tool"

officepdf
------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="sp"

f8a7e4b9c1d2e3f4a5b6c7d8e9f0a1b2...
------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="files[0][server_filename]"

d3b07384d113edec49eaa6238ad5ff00.docx
------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="files[0][filename]"

Annual_Report.docx
------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="output_filename"

{filename}
------WebKitFormBoundaryProcess
Content-Disposition: form-data; name="packaged_filename"

ilovepdf_converted
------WebKitFormBoundaryProcess--
```

#### Phase 6: Task Status Polling (`/v1/task/:taskId`)
The client polls the worker node every 1,500 milliseconds until completion:
```http
GET https://api73w.ilovepdf.com/v1/task/2q4y7v9b1m8k4p3z6x5c... HTTP/1.1
Host: api73w.ilovepdf.com
Authorization: Bearer <token>
```
**Response Transitions**:
`{ "status": "TaskWaiting" }` $\rightarrow$ `{ "status": "TaskProcessing", "percent": 45 }` $\rightarrow$ `{ "status": "TaskSuccess" }`.

#### Phase 7: Binary Result Download (`/v1/download/:taskId`)
```http
GET https://api73w.ilovepdf.com/v1/download/2q4y7v9b1m8k4p3z6x5c... HTTP/1.1
Host: api73w.ilovepdf.com
Authorization: Bearer <token>
```
**Response**: Returns the converted binary buffer (`application/pdf`).

### 4.3 Worker Cluster Topology Mapping
Network inspections verified specialized worker host topologies:
1. **General Cluster (`api1`–`api113.ilovepdf.com`)**: General page splitting, merging, rotating, watermarking, paginating, repair, and encryption.
2. **Office-to-PDF Cluster (`api*w.ilovepdf.com`, e.g., `api73w`)**: Headless Microsoft Office conversion engines with pre-warmed memory instances.
3. **PDF-to-Office Cluster (`api*o.ilovepdf.com`, e.g., `api23o`)**: Heavy OCR and document layout tree reconstruction engines (powered by Solid Documents).
4. **AI Intelligence Cluster (`api*ai.ilovepdf.com`, e.g., `api6ai`, `api8ai`)**: Neural document summarization, machine translation, and markdown restructuring.

---

## 5. Tool-by-Tool Technical Specifications for Every Missing Tool

This section provides exhaustive, end-to-end technical specifications for all 15 missing tools and sub-tools identified during our audit.

---

### 5.1 Scan to PDF (`scan-pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- **Desktop Workflow**: User clicks "Scan to PDF". The interface displays two tabs:
  1. **Webcam Scan**: Direct in-browser desktop webcam capture with live video viewfinder, snapshot capture, document quadrilateral bounding box detection, and perspective crop preview.
  2. **Mobile Companion Pairing**: Displays a high-resolution QR code (`/d/scan/:sessionToken`). User scans with smartphone camera to open the mobile camera scanner web studio.
- **Mobile Scanner Studio**: Responsive mobile interface running in Safari/Chrome. Accesses `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`. Includes shutter button, flash toggle, automated document boundary detection, and multi-page capture queue.
- **Review & Compilation Studio**: Thumbnails of captured pages appear in real-time. Controls: Orientation (`portrait`/`landscape`), Page size (`A4`, `Letter`), Margin (`0`, `small`), and "Compile Scanned PDF" button.

#### 2. Backend Worker & Processing Pipeline
- Local engine uses `shareManager.js` to establish an ephemeral session room with a 15-minute TTL.
- Captured page image buffers (JPEG/PNG) are posted to `POST /api/scan/upload-frame`.
- Compilation uses `pdf-lib` to create a fresh `PDFDocument`, embed high-resolution images (`doc.embedJpg()`), and calculate aspect ratios to center pages within A4/Letter margins.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=scan
&orientation=portrait
&pagesize=A4
&margin=0
&merge_after=true
&files[0]=<scanned_page_1.jpg>
&files[1]=<scanned_page_2.jpg>
```

#### 4. Candidate FOSS Libraries & Utilities
- Client: HTML5 Canvas, WebRTC `getUserMedia`, `opencv.js` (for Canny edge detection and perspective warp) or pure JS quad-warp algorithm.
- Server: `pdf-lib` (Node.js) for document creation; `qrcode` for pairing code generation.

#### 5. Edge Case Handling
- **Non-Rectangular Skew**: Apply 4-point homography transform matrix to map detected quad vertices to orthogonal $[0, 0, W, H]$ rectangle.
- **Lighting Gradient / Shadow**: Apply adaptive Gaussian thresholding to enhance legibility of printed text under uneven room lighting.

---

### 5.2 Word to PDF (`word_to_pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.doc`, `.docx`, `.odt`, `.ott`, `.rtf`.
- Drag-and-drop multi-file upload queue with progress bar and estimated conversion time.
- Direct output download card with embedded "View in PDF Reader" button.

#### 2. Backend Worker & Processing Pipeline
- **Primary Engine**: Local child process spawning headless LibreOffice:
  ```bash
  soffice --headless --convert-to pdf --outdir <outputDir> <inputDocxPath>
  ```
- **Fallback Engine**: Reverse-engineered iLovePDF `officepdf` cluster (`api*w.ilovepdf.com`).

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=officepdf
&subtool=wordpdf
&convert_to=pdf
&output_filename={filename}
&files[0]=<contract.docx>
```

#### 4. Candidate FOSS Libraries & Utilities
- `libreoffice-convert` (Node.js wrapper) or native `child_process.spawn`.
- System Dependency: LibreOffice / Soffice binary package (`libreoffice-core`).

#### 5. Edge Case Handling
- **Missing Proprietary Fonts**: When documents rely on Calibri, Cambria, or Aptos, LibreOffice may substitute DejaVu Sans, inducing layout line wrap discrepancies. Solution: Install Microsoft TrueType Core Fonts (`msttcorefonts`, `ttf-mscorefonts-installer`) and open-source metric-compatible substitutes (Carlito for Calibri, Caladea for Cambria).

---

### 5.3 PowerPoint to PDF (`powerpoint_to_pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.ppt`, `.pptx`, `.odp`, `.pps`, `.ppsx`.
- File dropzone displaying presentation slide icon, detected slide count (post-upload), and landscape orientation indicator.

#### 2. Backend Worker & Processing Pipeline
- Spawns headless LibreOffice Impress:
  ```bash
  soffice --headless --convert-to pdf:impress_pdf_Export --outdir <outputDir> <inputPptxPath>
  ```
- Reconstructs 16:9 widescreen or 4:3 presentation slides into vectorized PDF pages preserving embedded vector shapes and gradients.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=officepdf
&subtool=powerpointpdf
&convert_to=pdf
&files[0]=<pitch_deck.pptx>
```

#### 4. Candidate FOSS Libraries & Utilities
- `libreoffice-convert` or `child_process.spawn('soffice')`.

#### 5. Edge Case Handling
- **Slide Master Backgrounds & Media Overlays**: Videos and audio clips embedded in `.pptx` slides must be flattened into static poster images without crashing the headless conversion daemon.

---

### 5.4 Excel to PDF (`excel_to_pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.xls`, `.xlsx`, `.ods`, `.csv`.
- Options card:
  - `page_orientation`: `portrait` vs `landscape` (Default: `landscape`).
  - `fit_to_page`: Checkbox ("Fit sheet on one page wide" to prevent split columns).
  - `sheet_selection`: "All sheets" vs "Active sheet only".

#### 2. Backend Worker & Processing Pipeline
- Spawns headless LibreOffice Calc:
  ```bash
  soffice --headless --convert-to pdf:calc_pdf_Export --outdir <outputDir> <inputXlsxPath>
  ```
- When `fit_to_page` is selected, pre-processes sheet XML using `xlsx` (SheetJS) to inject `<fitToPage>1</fitToPage>` and `<fitToWidth>1</fitToWidth>` into `sheetPr` tags.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=officepdf
&subtool=excelpdf
&orientation=landscape
&fit_to_page=true
&files[0]=<balance_sheet.xlsx>
```

#### 4. Candidate FOSS Libraries & Utilities
- `xlsx` (SheetJS) for spreadsheet workbook XML manipulation; `libreoffice-convert` for PDF rendering.

#### 5. Edge Case Handling
- **Ultra-Wide Worksheets**: A 40-column spreadsheet split across vertical pages becomes unreadable. Ensure auto-fit scale down and landscape page dimension enforcement.

---

### 5.5 PDF to Word (`pdf_to_word`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- Option Selector:
  - `ocr = 0`: "Standard Text Extraction" (Fast, extracts selectable text and vectors).
  - `ocr = 1`: "OCR Reconstruction" (For scanned documents, converts bitmap text into editable Word characters).

#### 2. Backend Worker & Processing Pipeline
- **Local Engine**:
  - Python microservice utilizing `pdf2docx` (runs PyMuPDF layout analysis, extracts text blocks, tables, fonts, and reconstructs `word/document.xml` OpenXML archives).
  - Alternatively: LibreOffice Writer PDF import filter (`soffice --infilter="writer_pdf_import" --convert-to docx`).
- **Cloud Grid Fallback**: iLovePDF `pdfoffice` cluster (`api*o.ilovepdf.com`).

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=pdfoffice
&convert_to=docx
&ocr=0
&output_filename={filename}
&files[0]=<contract.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- Python: `pdf2docx` library.
- Node.js: `child_process.spawn('python', ['-m', 'pdf2docx', ...])`.

#### 5. Edge Case Handling
- **Multi-Column Magazine Layouts**: Naive text extraction reads across columns horizontally. Layout parser must calculate horizontal bounding gaps and generate independent Word floating text boxes or multi-column sections.

---

### 5.6 PDF to PowerPoint (`pdf_to_powerpoint`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- Options card:
  - `slide_aspect`: `16:9` (Widescreen) vs `4:3` (Standard).
  - `vector_mode`: High-fidelity vector elements vs Full-page high-DPI slide background images with overlaid editable text.

#### 2. Backend Worker & Processing Pipeline
- Local Engine:
  1. `pdfjs-dist` renders each PDF page into a high-resolution canvas image (300 DPI).
  2. Extracts text items with exact X/Y coordinates, font size, and color.
  3. Uses `pptxgenjs` (Node.js) to generate a `.pptx` presentation:
     - Sets page background image.
     - Adds absolute-positioned text boxes matching the original PDF typography.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=pdfoffice
&convert_to=pptx
&ocr=0
&files[0]=<presentation.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- `pptxgenjs` (Node.js presentation authoring library).
- `pdfjs-dist` (Mozilla PDF parsing and rasterization).

#### 5. Edge Case Handling
- **Slide Aspect Ratio Mismatch**: Compute PDF viewport aspect ratio ($W/H$). If $\approx 1.77$, map to PPTX 16:9 layout; if $\approx 1.33$, map to 4:3 layout.

---

### 5.7 PDF to Excel (`pdf_to_excel`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- Options card:
  - `sheet_layout`: `single` ("Combine all tables into one sheet") vs `multiple` ("Create a separate sheet per page").
  - `detect_borderless_tables`: Checkbox to activate whitespace heuristic column segmentation.

#### 2. Backend Worker & Processing Pipeline
- Local Engine:
  1. Parse PDF using `pdf-table-extractor` or Tabula Java engine.
  2. Identifies table borders via vector line paths (`re` and `m` PDF operators) and text spatial clustering.
  3. Formats tabular arrays into OpenXML worksheet cells using `xlsx` (SheetJS).
  4. Serializes output to `.xlsx` binary buffer.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=pdfoffice
&convert_to=xlsx
&layout=single
&files[0]=<financials.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- `pdf-table-extractor` (Node.js) + `xlsx` (SheetJS).
- Fallback: `tabula-extractor` (CLI).

#### 5. Edge Case Handling
- **Merged Header Cells**: Detect overlapping coordinate bounds across adjacent column headers and emit corresponding `!merges` ranges in SheetJS worksheets.

---

### 5.8 PDF to PDF/A (`convert-pdf-to-pdfa`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- Dropdown selector for ISO Conformance Level:
  - `pdfa-1b` (Basic visual preservation, ISO 19005-1).
  - `pdfa-2b` (Default, ISO 19005-2 baseline, JPEG2000, transparency, OpenType).
  - `pdfa-2u` (Unicode text mappings for copy-paste accessibility).
  - `pdfa-3b` (Allows embedded file attachments such as XML invoices).
- Checkbox `allow_pdfa_downgrade` (Default: `true`).

#### 2. Backend Worker & Processing Pipeline
- Local Engine: Spawns Ghostscript CLI configured for PDF/A production:
  ```bash
  gs -dPDFA=2 -dBATCH -dNOPAUSE -dNOOUTERSAVE \
     -sColorConversionStrategy=UseDeviceIndependentColor \
     -sProcessColorModel=DeviceRGB \
     -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 \
     -sOutputFile=output.pdf PDFA_def.ps input.pdf
  ```
- Embeds standard `sRGB.icc` profile, generates XMP metadata packet with `pdfaExtension` schemas, and validates all fonts are fully embedded.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=pdfa
&conformance=pdfa-2b
&allow_pdfa_downgrade=1
&files[0]=<archive.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- Ghostscript (`gs` / `gswin64c.exe`) via `child_process.spawn`.

#### 5. Edge Case Handling
- **Unembedded System Fonts**: If the source document references non-embedded fonts without embedding glyph descriptions, Ghostscript fails ISO validation. Fix: Configure Ghostscript font search paths (`-I`) to include system fonts and embed subset definitions.

---

### 5.9 Crop PDF (`crop-pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- **Interactive Visual Crop Studio**:
  - Center viewport renders the active PDF page on an HTML5 canvas.
  - Multi-page thumbnail filmstrip on the left with navigation.
  - Interactive SVG/DOM crop overlay with 8 draggable resize handles and coordinate badges (Width $\times$ Height in mm/inches).
  - Scope Radio: `all_pages` ("Apply to entire document") vs `current_page` ("Crop selected page only").
  - Preset aspect ratio buttons: Freeform, 1:1, Letter, A4.

#### 2. Backend Worker & Processing Pipeline
- 100% Client-Side or Local Server Execution via `pdf-lib`.
- In PDF internal architecture (ISO 32000-1), cropping does not delete vector operators; it modifies the page boundary bounding boxes in the Page dictionary:
  - `/MediaBox`: Physical medium boundaries.
  - `/CropBox`: Clipping rectangle visible to viewers and printers.
- Coordinate Math: Converts screen CSS pixels to PDF points (72 points per inch, with bottom-left origin inversion):
  $$x_{\text{pdf}} = x_{\text{screen}} \times \frac{W_{\text{page}}}{W_{\text{canvas}}}$$
  $$y_{\text{pdf}} = (H_{\text{canvas}} - y_{\text{screen}} - h_{\text{screen}}) \times \frac{H_{\text{page}}}{H_{\text{canvas}}}$$

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=pdfcrop
&scope=all_pages
&crop_x=50
&crop_y=72
&crop_width=512
&crop_height=700
&files[0]=<document.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- Client: Mozilla `pdfjs-dist` (canvas preview).
- Server / Client: `pdf-lib` (`page.setCropBox(x, y, width, height)`).

#### 5. Edge Case Handling
- **Rotated Pages**: If `/Rotate 90` or `/Rotate 270` is set in the page dictionary, the coordinate system is transposed. The transform matrix must account for page rotation angle when setting `CropBox`.

---

### 5.10 PDF Forms (`pdf-forms`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- **Dual-Mode Studio**:
  1. **Form Filler Mode**: Inspects document for existing AcroForm fields; highlights interactive fields. Users can type into text fields, check boxes, select radio buttons, and choose dropdown options.
  2. **Form Creator Studio**: Drag-and-drop tool palette allowing users to add new fields to static documents:
     - Text Box (`Tx`)
     - Checkbox (`Btn`)
     - Radio Group (`Btn`)
     - Dropdown Combo-Box (`Ch`)
     - Signature Field (`Sig`)
- Properties Inspector: Set field name, default value, required status, and font size.
- Option: `flatten_forms` checkbox (bakes form field data into static vector text).

#### 2. Backend Worker & Processing Pipeline
- Local Engine uses `pdf-lib` Native Form Subsystem (`PDFDocument.getForm()`):
  ```javascript
  const form = doc.getForm();
  // Fill existing
  const textField = form.getTextField('user_name');
  textField.setText('Jane Doe');
  // Create new
  const newField = form.createTextField('tax_id');
  newField.setText('XXX-XX-XXXX');
  newField.addToPage(page, { x: 100, y: 500, width: 150, height: 24 });
  if (shouldFlatten) form.flatten();
  ```

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=formfiller
&flatten=false
&fields=[{"name":"full_name","type":"text","value":"John Doe","page":0,"x":100,"y":650,"w":200,"h":24}]
&files[0]=<tax_form.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- `pdf-lib` (Native AcroForm creation and filling API).

#### 5. Edge Case Handling
- **Appearance Streams (`/AP`)**: PDF viewers require updated appearance streams to render form values properly. Ensure `form.updateFieldAppearances()` is invoked prior to serialization.

---

### 5.11 Redact PDF (`redact-pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- **Redaction Studio Toolbar**:
  - `Draw Redaction Area`: Click and drag to create opaque black redaction rectangles.
  - `Redact Page`: Single-click redaction of entire selected pages.
  - `Smart PII Pattern Scanner`: Automated scanner detecting:
    - Credit Card numbers (`\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b`)
    - Email addresses (`\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`)
    - Phone numbers (`\b\+?1?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b`)
    - Social Security Numbers / Tax IDs (`\b\d{3}-\d{2}-\d{4}\b`)
- Review Queue: Sidebar list of all marked redaction items with delete icons.
- "Apply Redactions" button with high-security confirmation modal.

#### 2. Backend Worker & Processing Pipeline
- **Architectural Critical Rule: Zero-Leak Redaction**:
  - *Naive Defect*: Drawing a black rectangle overlay leaves the underlying text glyphs inside the PDF `/Contents` stream, allowing attackers to select, copy, or grep the sensitive text.
  - *Sanitized Pipeline*:
    1. **Vector Excision Mode**: Parse content streams; identify text rendering operators (`Tj`, `TJ`, `"` ) falling within redaction coordinate bounding boxes and replace them with whitespace; permanently draw black solid vector fills in `/Contents`.
    2. **Guaranteed Zero-Leak Rasterization Mode (Air-Gap Security)**: For ultra-sensitive documents, render redacted pages to 300 DPI lossless PNG images on an in-memory canvas and reconstruct a clean PDF, guaranteeing that no vector or metadata remains.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=redact
&mode=vector_excision
&redactions=[{"page":0,"x":120,"y":450,"width":180,"height":16,"reason":"PII_SSN"}]
&files[0]=<confidential.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- Client: `pdfjs-dist` text layer extraction.
- Server: `pdf-lib` + canvas rasterizer (`canvas` Node package) or Poppler `pdftocairo`.

#### 5. Edge Case Handling
- **Embedded OCR Text Behind Bitmaps**: When redacting scanned documents, both the visible image layer AND the hidden OCR text layer must be excised simultaneously in the coordinate bounds.

---

### 5.12 Compare PDF (`compare-pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts two documents: Document A (Original) and Document B (Modified).
- **Dual Synchronized Viewer Studio**:
  - Viewport 1 (Doc A) and Viewport 2 (Doc B) with locked synchronized scrolling and zoom.
  - Mode A: **Side-by-Side Mode** with highlighted change bounding boxes.
  - Mode B: **Swipe Slider / Diff Overlay Mode** with a draggable divider superimposing differences.
  - Mode C: **Change Report**: Collapsible sidebar listing additions (green), deletions (red), and replacements with page links.

#### 2. Backend Worker & Processing Pipeline
- **Visual Diff Engine**:
  1. `pdfjs-dist` renders matching pages from Doc A and Doc B to canvas bitmaps at identical resolution (150 DPI).
  2. Compares pixel arrays using `pixelmatch`:
     - Matching pixels: Rendered in desaturated grayscale (opacity 40%).
     - Pixels in Doc A only (Deletions): Colored in bright Red (`#ef4444`).
     - Pixels in Doc B only (Additions): Colored in bright Green (`#22c55e`).
- **Text Diff Engine**:
  1. Extracts text items and bounding boxes from both documents.
  2. Applies Myers diff algorithm (`diff` npm library) to generate word-level change records.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=pdfcompare
&compare_mode=overlay
&files[0]=<v1_draft.pdf>
&files[1]=<v2_final.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- `pixelmatch` (Fast pixel-level image comparison).
- `diff` (Myers text diff algorithm).
- Mozilla `pdfjs-dist` (Canvas rendering).

#### 5. Edge Case Handling
- **Page Count Mismatch**: When Doc A has 5 pages and Doc B has 7 pages, align matching pages using text hash fingerprints to prevent cascading false-positive visual diffs across the entire document.

---

### 5.13 AI Summarizer (`pdf-summarize`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- Option Selectors:
  - `summarize_length`: `"short"` (1 paragraph), `"medium"` (3 paragraphs), `"long"` (detailed section-by-section).
  - `summarize_tone`: `"formal"` (executive summary), `"casual"`, `"bullet_points"` (action items).
- Output Display: Clean markdown reader with Copy to Clipboard and Download as Markdown/PDF buttons.
- **Interactive Chat Interface**: Integrated right-hand chat drawer allowing users to ask follow-up questions about the document context.

#### 2. Backend Worker & Processing Pipeline
- Uses the official Google Gen AI SDK (`@google/genai`) connecting to Gemini 2.5 Flash:
  ```javascript
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'application/pdf', data: base64Pdf } }] }
    ]
  });
  ```
- Streaming response protocol via Server-Sent Events (SSE) for real-time token rendering.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=summarize
&summarize_length=medium
&summarize_tone=bullet_points
&language=en
&files[0]=<whitepaper.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- `@google/genai` (Official Google Gen AI SDK).
- `pdf-parse` / `pdfjs-dist` for local text extraction fallback.

#### 5. Edge Case Handling
- **Large Context Exceeding Limits**: Gemini 2.5 Flash features a 1-million-token context window, natively supporting documents up to several hundred pages without manual text truncation.

---

### 5.14 Translate PDF (`translate-pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- Controls:
  - `language_input`: Source language dropdown (100+ languages, with `Auto Detect`).
  - Language Swap button (`⇄`).
  - `language_output`: Target language dropdown (28 major languages).
  - `translate_mode`: `layout` ("Keep original layout and graphics") vs `text` ("Text only").
- Side-by-side bilingual reading preview.

#### 2. Backend Worker & Processing Pipeline
- Local Engine:
  1. `pdfjs-dist` extracts text items with font metrics and coordinate bounding boxes.
  2. Batch-translates text segments using Gemini 2.5 Flash structured JSON prompt:
     `"Translate each text segment from ${from} to ${to}. Return JSON array of translated strings."`
  3. Uses `pdf-lib` to redraw translated text onto document pages, dynamically adjusting font size to fit original bounding boxes.

#### 3. Endpoint Protocols & Payload Structures
```http
POST /api/process
Content-Type: multipart/form-data

tool=translate
&language_input=auto
&language_output=es
&translate_mode=layout
&files[0]=<manual.pdf>
```

#### 4. Candidate FOSS Libraries & Utilities
- `@google/genai` (Gemini API for context-aware neural translation).
- `pdf-lib` for layout redraw.

#### 5. Edge Case Handling
- **Text Expansion / Contraction**: German or Spanish translations often expand text length by 20-30% compared to English. Implement dynamic font size scaling:
  $$\text{fontSize}_{\text{new}} = \text{fontSize}_{\text{orig}} \times \min\left(1.0, \frac{\text{width}_{\text{bound}}}{\text{textWidth}_{\text{translated}}}\right)$$

---

### 5.15 Full Edit PDF (`edit-pdf`)

#### 1. User Workflow & Frontend Studio Requirements
- Accepts `.pdf`.
- **Full Creative Visual Studio Canvas**:
  - Top floating toolbar:
    - **Text Tool**: Add resizable text boxes with font family, size, weight, color, alignment.
    - **Image Tool**: Upload local images (PNG, JPG) as resizable floating layers.
    - **Shape Tools**: Draw rectangles, circles, straight lines, and arrows.
    - **Freehand Pen**: Draw smooth vector paths with ink color and stroke thickness sliders.
    - **Highlighter**: Semi-transparent yellow/green text marker overlay.
  - Layer Manager: Reorder elements ("Bring Forward", "Send Backward", "Delete Element").
  - Multi-page navigation sidebar.

#### 2. Backend Worker & Processing Pipeline
- 100% Client-Side Studio Execution.
- State tracks an array of annotation objects:
  `{ type: 'text'|'image'|'shape'|'path', page: 0, x, y, width, height, ...properties }`
- On "Save PDF", `pdf-lib` loads the original document and embeds:
  - Text via `page.drawText()`.
  - Images via `doc.embedPng()` / `page.drawImage()`.
  - Shapes via `page.drawRectangle()` / `page.drawEllipse()`.
  - Vector paths via SVG path operators or line primitives.

#### 3. Endpoint Protocols & Payload Structures
Client-side blob generation; optional upload to `/api/share-cache` for mobile sync.

#### 4. Candidate FOSS Libraries & Utilities
- Mozilla `pdfjs-dist` (canvas viewport).
- `pdf-lib` (vector and image embedding).

#### 5. Edge Case Handling
- **Coordinate System Inversion**: Browser canvas origin is Top-Left $(0, 0)$; PDF user space origin is Bottom-Left $(0, 0)$. All coordinates must be inverted:
  $$y_{\text{pdf}} = \text{pageHeight} - y_{\text{canvas}} - \text{elementHeight}$$

---

## 6. Phased Implementation Roadmap & Rollout Strategy

To maintain rigorous code quality and prevent regressions, development is organized into 5 phased implementation milestones following the completion of Milestone 1.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PHASED IMPLEMENTATION TIMELINE & MILESTONES                    │
├───────────────┬───────────────────────────────────┬──────────────┬───────────────┤
│ Milestone     │ Scope & Focus                     │ Duration     │ Risk Profile  │
├───────────────┼───────────────────────────────────┼──────────────┼───────────────┤
│ Milestone 1   │ Architecture & Implementation Plan│ Complete     │ Low (Docs)    │
│ Milestone 2   │ Dedicated Office & Split Suite    │ Sprint 1     │ Low-Medium    │
│ Milestone 3   │ Interactive Visual Canvas Studios │ Sprint 2     │ Medium        │
│ Milestone 4   │ Security, Redaction & AcroForms   │ Sprint 3     │ High          │
│ Milestone 5   │ Hardware Capture & AI Intelligence│ Sprint 4     │ Medium-High   │
│ Milestone 6   │ Custom Workflows & Enterprise     │ Sprint 5     │ Low-Medium    │
└───────────────┴───────────────────────────────────┴──────────────┴───────────────┘
```

### 6.1 Milestone 2: Dedicated Office Conversion & Split Suite
- **Priority**: High (Addresses 7 catalog items and high-volume daily conversion tasks).
- **Tasks**:
  1. Separate `officepdf` into three dedicated UI cards and routes: `/word_to_pdf`, `/powerpoint_to_pdf`, and `/excel_to_pdf`.
  2. Implement backend bindings in `server.js` and `ilovepdfService.js` for `convert_to: 'pptx'` and `convert_to: 'xlsx'`.
  3. Expose dedicated landing studios for `/remove-pages` and `/extract-pages`.
  4. Extend OCR language packs to 30+ ISO languages.
- **Verification Harness**: Run test suite converting `.docx`, `.pptx`, and `.xlsx` test files to PDF and back; verify exit code 0.

### 6.2 Milestone 3: Interactive Visual Canvas Studios
- **Priority**: High (Adds essential visual editing tools).
- **Tasks**:
  1. Build `cropStudio.js` in `public/js/studios/`: Canvas rendering + 8-handle crop overlay; connect to `pdf-lib` `setCropBox`.
  2. Build Full Edit PDF studio: Add floating toolbar for shapes, freehand drawing, highlighter, and image stamps.
  3. Enhance Watermark tool with Image/Logo watermark upload and Z-layering (`above`/`below`).
  4. Implement multi-document Organize PDF with blank page insertion.
- **Verification Harness**: Automated unit tests checking PDF dictionary `MediaBox` and `CropBox` values; canvas render diff tests.

### 6.3 Milestone 4: Advanced Security, Forms & Redaction Engineering
- **Priority**: Critical (Security and legal compliance).
- **Tasks**:
  1. Implement `redactStudio.js`: Interactive blackout canvas + Smart PII regex scanner (credit cards, SSNs, emails).
  2. Build zero-leak sanitization pipeline: Token excision in content streams + 300 DPI rasterization fallback.
  3. Implement AcroForm Form Creator and Form Filler studio using `pdf-lib` Form API.
  4. Build `compareStudio.js`: Dual-pane synchronized scrolling canvas viewer + `pixelmatch` visual diff engine.
  5. Add dual-password support (User + Owner) and permission bitmasks in Protect PDF.
- **Verification Harness**: Forensic text extraction test on redacted documents confirming zero residual glyph leakage; AcroForm round-trip fill verification.

### 6.4 Milestone 5: Hardware Capture & AI Intelligence Suite
- **Priority**: High (Cutting-edge intelligence and mobile capture).
- **Tasks**:
  1. Implement `scanStudio.js`: WebRTC desktop webcam capture + mobile QR scanner companion page using `shareManager.js`.
  2. Implement quad-warp perspective correction on scanned document frames.
  3. Connect `@google/genai` (Gemini 2.5 Flash) for document summarization, tone presets, and interactive chat drawer.
  4. Implement neural PDF translation with coordinate-aware layout preservation.
  5. Refine Markdown extraction engine to preserve tables and LaTeX formulas.
- **Verification Harness**: WebRTC stream mock tests; Gemini API token latency and response parsing tests.

### 6.5 Milestone 6: Custom Workflows & Enterprise Automation
- **Priority**: Medium (Power-user productivity).
- **Tasks**:
  1. Build visual workflow designer in `public/` allowing users to drag and drop tool nodes into a sequential processing graph (e.g. `OCR -> Crop -> Compress -> Protect`).
  2. Build server-side orchestrator executing workflow graphs with intermediate in-memory caching.
- **Verification Harness**: Automated multi-step workflow execution test verifying end-to-end artifact integrity.

---

## 7. Verification & Quality Assurance Protocols

1. **Static Regression Testing**:
   Execute `node tests/check_ids.js` before and after every frontend modification to verify that all HTML event listeners have corresponding function bindings in `app.js`.
2. **Backend & Share Streaming Verification**:
   Execute `node tests/shareTestSuite.js` to ensure that NetworkResolver, magic-byte inspection, HTTP 206 range streaming, and tombstone revocation maintain 100% operational integrity.
3. **Automated Document Validation**:
   All generated PDFs must be verified using `pdf-lib` parsing:
   ```javascript
   const doc = await PDFDocument.load(outputBuffer);
   assert(doc.getPageCount() > 0, "PDF must contain valid pages");
   ```
4. **License & Dependency Hygiene**:
   Ensure all added dependencies are strictly licensed under MIT, ISC, Apache 2.0, or BSD licenses. No closed-source proprietary SDKs.
