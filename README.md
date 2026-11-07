# 📄 I Like PDFs — Fast, Free & Beautiful PDF & Document Productivity Suite

<p align="center">
  <img src="public/favicon.ico" alt="I Like PDFs Logo" width="64" height="64" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>The open, modern, privacy-first PDF and document productivity platform.</strong><br>
  Engineered with in-browser studios, edge clustering, WPS Office format parity, and sleek responsive design.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green.svg" alt="Node.js 18+"/>
  <img src="https://img.shields.io/badge/Express-Backend-blue.svg" alt="Express"/>
  <img src="https://img.shields.io/badge/Tools-42%20Active-red.svg" alt="42 Active Tools"/>
  <img src="https://img.shields.io/badge/PDF.js-Mozilla-red.svg" alt="PDF.js"/>
  <img src="https://img.shields.io/badge/PDF--Lib-High--Performance-orange.svg" alt="PDF-Lib"/>
  <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="MIT License"/>
  <img src="https://img.shields.io/badge/Theme-Dark%20%2F%20Light-yellow.svg" alt="Dark / Light Mode"/>
</p>

---

## ✨ Features at a Glance

* **⚡ 42 Professional Document Tools**: Full feature parity with iLovePDF (33 tools + Reader Studio) plus advanced WPS-inspired high-utility tools (HEIC to PDF, Extract Images to ZIP, Flatten PDF, PDF to HTML, Blur & Redact Image, Clean PDF, Image to Excel Table OCR, and Invoice Generator).
* **✍️ In-Browser PDF Signer Studio**: Draw handwritten signatures with custom ink colors, type cursive calligraphy names, stamp today's date, and place checkmarks anywhere on the document. Signatures are vector-burned directly onto pages with `pdf-lib` in under 200ms without sending private documents to any server.
* **📖 Full-Screen PDF Reader & Viewer Studio**: High-DPI canvas viewer equipped with:
  * Collapsible thumbnail navigation sidebar.
  * Precision zoom controls (`30%` to `350%`).
  * **Fit-to-Width (`↔`)** and **Fit-to-Page (`↕`)** auto-scaling.
  * Real-time view rotation (`↻ 90°`).
  * Direct browser printing (`🖨️ Print`) and one-click downloading.
* **📱 Apple iPhone / HEIC Integration**: Directly compiles native Apple `.heic` and `.heif` camera photos into crisp, multi-page PDFs with borderless and A4/Letter framing options.
* **🖼️ Embedded Media Archive Extractor**: Scans PDF object streams and XObject dictionaries, extracting every high-resolution embedded JPEG/PNG photo into a downloadable `.zip` archive.
* **🔒 One-Click Document Flattening**: Locks fillable form fields, electronic signatures, and annotations into uneditable static graphics for legal compliance and printing.
* **🌐 Web Publishing (PDF to HTML)**: Converts PDF documents into standalone, responsive HTML web pages with clean layout, navigation, and print stylesheets.
* **🎭 Visual Privacy & Redaction**: Obscures faces, IDs, credit card numbers, or license plates on photos and scans with frosted glass or solid blackout redaction before PDF export.
* **🧼 Watermark Cleaner**: Detects and strips unwanted background stamps, watermark annotations, and keyword overlays (`DRAFT`, `CONFIDENTIAL`, `SAMPLE`, `COPY`).
* **📊 Optical Table Recognition (Image to Excel)**: Parses tables and receipts from document scans into native `.xlsx` workbooks with auto-sized column structures.
* **🧾 Smart Invoice & Receipt Generator**: Generates professional, itemized billing documents with custom currency symbols, tax calculations, and terms.
* **📱 Instant Scan-to-Mobile QR Transfer**: Share any processed document instantly to mobile devices with a secure local/LAN QR code.
* **🌙 Dark & Light Themes**: High-contrast, accessibility-tested themes powered by modern CSS custom properties with automatic localStorage persistence.

---

## 🛠️ Complete Catalog (42 Tools)

### 1. Organize & Manage Pages
| Tool | ID | Description |
| :--- | :--- | :--- |
| **Merge PDF** | `merge` | Combine multiple PDFs in any desired order |
| **Split PDF** | `split` | Extract page ranges or burst into separate files |
| **Remove Pages** | `removepages` | Interactively delete unwanted pages from documents |
| **Extract Pages** | `extractpages` | Save selected pages into standalone PDF files |
| **Organize PDF** | `organize` | Drag-and-drop page sorting, rotation & deletion |
| **Rotate PDF** | `rotate` | Batch rotate pages clockwise by 90°, 180°, or 270° |
| **Crop PDF** | `crop` | Interactively crop margins and trim PDF boundaries |
| **Extract Images** | `extractimg` | Extract all embedded photos and raster graphics to a ZIP |
| **Flatten PDF** | `flatten` | Permanently lock form fields, signatures, and annotations |
| **PDF Reader** | `viewpdf` | Full-featured document viewer with zoom & print |

### 2. Optimize & Enhance
| Tool | ID | Description |
| :--- | :--- | :--- |
| **Compress PDF** | `compress` | Extreme, Recommended, or Low compression options |
| **Repair PDF** | `repair` | Restore corrupt, damaged, or unreadable PDFs |
| **OCR PDF** | `ocr` | Convert scanned PDF pages into selectable text |
| **Clean PDF** | `cleanpdf` | Remove watermarks, stamps, and background overlay text |

### 3. Convert to PDF
| Tool | ID | Description |
| :--- | :--- | :--- |
| **JPG to PDF** | `imagepdf` | Convert JPG/PNG/WebP images into a compiled PDF |
| **HEIC to PDF** | `heicpdf` | Compile Apple iPhone `.heic`/`.heif` photos into PDF |
| **Word to PDF** | `wordpdf` | Convert Word (.docx, .doc) files into clean PDFs |
| **PowerPoint to PDF** | `powerpointpdf` | Convert PowerPoint (.pptx, .ppt) slides into PDF |
| **Excel to PDF** | `excelpdf` | Convert Excel (.xlsx, .xls) spreadsheets into PDF |
| **HTML to PDF** | `htmlpdf` | Convert webpages or HTML files into PDF |
| **Scan to PDF** | `scan` | Scan physical documents directly from camera |
| **Invoice Generator**| `invoice` | Create professional itemized PDF invoices and receipts |

### 4. Convert from PDF
| Tool | ID | Description |
| :--- | :--- | :--- |
| **PDF to Word** | `pdfword` | Convert PDF into editable Microsoft Word (.docx) |
| **PDF to PowerPoint**| `pdfpowerpoint`| Convert PDF into editable PowerPoint slides (.pptx) |
| **PDF to Excel** | `pdfexcel` | Convert PDF into editable Excel spreadsheets (.xlsx) |
| **Image to Excel** | `jpgexcel` | Extract tables from photos & scans into Excel (.xlsx) |
| **PDF to JPG** | `pdfjpg` | Extract high-resolution JPG images from PDF pages |
| **PDF to PDF/A** | `pdfa` | Convert documents into ISO-standard archival formats |
| **PDF to Markdown** | `pdfmarkdown` | Extract clean Markdown text and tables for LLMs & AI |
| **PDF to HTML** | `pdfhtml` | Export PDF pages into responsive HTML web pages |

### 5. Edit, Sign & Polish
| Tool | ID | Description |
| :--- | :--- | :--- |
| **Edit PDF** | `editpdf` | Add custom text, signatures, and date stamps |
| **Sign PDF** | `sign` | Draw/type signatures and place checkmarks anywhere |
| **Add Watermark** | `watermark` | Stamp text with custom positions, font size & opacity |
| **Add Page Numbers** | `pagenumber` | Add customizable page numbering to headers/footers |
| **PDF Forms** | `forms` | Fill AcroForm interactive fields and flatten outputs |

### 6. Security, Privacy & Intelligence
| Tool | ID | Description |
| :--- | :--- | :--- |
| **Protect PDF** | `protect` | Encrypt PDFs with robust AES-128 password security |
| **Unlock PDF** | `unlock` | Remove encryption & security locks from PDFs |
| **Redact PDF** | `redact` | Permanently black out sensitive text and figures |
| **Blur & Redact Image**| `blurimage` | Obscure faces, licenses, and confidential info on photos |
| **Compare PDF** | `compare` | Visual side-by-side and text diff comparison |
| **AI Summarizer** | `summarize` | AI executive summary and bullet takeaways |
| **Translate PDF** | `translate` | Translate documents into 10+ target languages |

---

## 🏛️ Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                     I Like PDFs                         │
   │               (Frontend Client Studio)                  │
   └─────────────┬─────────────────────────────┬─────────────┘
                 │                             │
    Client-Side Operations            Cloud & Local Pipelines
 (PDF.js / PDF-Lib Engine)           (Reverse-Engineered Edge)
                 │                             │
    • In-Browser PDF Signer           • Compress / Repair / OCR
    • High-DPI Reader & Viewer        • Office <-> PDF Conversion
    • Visual Page Organizer Canvas    • HEIC / Image Extraction
    • Print & Rotation Services       • Watermark Stripping / Clean
    • Form Filler & Editor Studio     • Invoicing & SheetJS Tables
```

* **Frontend**:
  * Semantic HTML5 & Modern Vanilla CSS (Glassmorphism, CSS Grid, Custom Design Tokens).
  * Vanilla JavaScript (Zero bloated frameworks, instant execution).
  * **Mozilla PDF.js** (`pdfjs-dist`): High-DPI canvas rendering and visual thumbnail generation.
  * **PDF-Lib** (`pdf-lib`): Client-side PDF binary manipulation, vector PNG embedding, and font rendering.
* **Backend**:
  * **Node.js** with **Express**: High-concurrency reverse-proxy API server.
  * **ilovepdfService.js**: Reverse-engineered cluster interface handling session acquisition, task allocation, binary streaming, and polling with automated retry.
  * **Local Engines**: `heic-convert` (Apple HEIC/HEIF decoding), `jszip` (media compression), `xlsx` (SheetJS table compiling), and `qrcode` (mobile transfer).
  * **Dual-Stack DNS Resolution**: `ipv4first` network routing to prevent IPv6 timeouts on Windows and containerized platforms.

---

## 🚀 Quickstart & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* `npm` (comes bundled with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/i-love-pdf-reverse.git
cd i-love-pdf-reverse

# Install dependencies
npm install

# Start the application
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Running Tests
```bash
npm test
```

---

## 📜 License
This project is open-source software licensed under the [MIT License](LICENSE).
