/**
 * I Like PDFs - Modern Frontend Application Logic
 * Full Feature Parity with iLovePDF Engine
 * Includes Visual PDF.js Page Thumbnail Canvas, 16 Tools, Search & Dark Mode
 */

// Application State
const state = {
    tools: [],
    selectedTool: null,
    files: [],
    pages: [], // Visual PDF pages: [{ id, pageNum, originalNum, rotation, isDeleted, canvas }]
    options: {},
    activeCategory: 'all',
    searchQuery: '',
    isProcessing: false,
    theme: localStorage.getItem('ilikepdfs_theme') || 'light',
    lastResultData: null,
    signer: {
        pdfDoc: null,
        rawBytes: null,
        pageNum: 1,
        totalPages: 1,
        annotations: [],
        currentInkColor: '#0f172a',
        currentSigFont: 'Caveat',
        activeTab: 'draw',
        isDrawing: false,
        hasDrawn: false
    },
    reader: {
        pdfDoc: null,
        rawBytes: null,
        filename: 'document.pdf',
        pageNum: 1,
        totalPages: 1,
        scale: 1.0,
        rotation: 0,
        sidebarOpen: true,
        downloadUrl: null,
        fitMode: null
    },
    stamp: {
        pdfDoc: null,
        rawBytes: null,
        pageNum: 1,
        totalPages: 1,
        scale: 0.8
    }
};

// Tool Catalog Definitions with Categories, Accents, and Defaults
const DEFAULT_TOOLS = [
    {
        id: "compress",
        name: "Compress PDF",
        tagline: "Reduce PDF file size while preserving optimum quality",
        category: "optimize",
        icon: "🗜️",
        color: "#059669",
        bgLight: "#ecfdf5",
        badge: "Most Popular",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        defaultOptions: { compression_level: "recommended" }
    },
    {
        id: "merge",
        name: "Merge PDF",
        tagline: "Combine multiple PDF files in any order you choose",
        category: "organize",
        icon: "📑",
        color: "#dc2626",
        bgLight: "#fef2f2",
        badge: "Essential",
        minFiles: 2,
        maxFiles: 20,
        accept: ".pdf",
        defaultOptions: { output_filename: "ilikepdfs_merged.pdf" }
    },
    {
        id: "split",
        name: "Split PDF",
        tagline: "Extract pages or separate a PDF into individual files",
        category: "organize",
        icon: "✂️",
        color: "#ea580c",
        bgLight: "#fff7ed",
        badge: "Precise",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: { split_mode: "ranges", ranges: "1-end" }
    },
    {
        id: "organize",
        name: "Organize PDF",
        tagline: "Sort, reorder, rotate, or delete specific pages interactively",
        category: "organize",
        icon: "🗂️",
        color: "#0284c7",
        bgLight: "#f0f9ff",
        badge: "Visual Canvas",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: {}
    },
    {
        id: "rotate",
        name: "Rotate PDF",
        tagline: "Rotate pages 90°, 180° or 270° clockwise",
        category: "organize",
        icon: "🔄",
        color: "#2563eb",
        bgLight: "#eff6ff",
        badge: "Instant",
        minFiles: 1,
        maxFiles: 10,
        accept: ".pdf",
        defaultOptions: { rotate_angle: "90" }
    },
    {
        id: "pdfoffice",
        name: "PDF to Word",
        tagline: "Convert PDF documents into editable DOCX format",
        category: "convert",
        icon: "📝",
        color: "#2563eb",
        bgLight: "#eff6ff",
        badge: "Editable DOCX",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        defaultOptions: {}
    },
    {
        id: "officepdf",
        name: "Word to PDF",
        tagline: "Convert Word DOC/DOCX files into clean, professional PDFs",
        category: "convert",
        icon: "📄",
        color: "#1d4ed8",
        bgLight: "#dbeafe",
        badge: "Office Engine",
        minFiles: 1,
        maxFiles: 10,
        accept: ".doc,.docx,.ppt,.pptx,.xls,.xlsx",
        defaultOptions: {}
    },
    {
        id: "pdfjpg",
        name: "PDF to JPG",
        tagline: "Convert PDF pages into high-definition JPG images",
        category: "convert",
        icon: "🖼️",
        color: "#7c3aed",
        bgLight: "#f5f3ff",
        badge: "High Res",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: { pdfjpg_mode: "pages" }
    },
    {
        id: "imagepdf",
        name: "JPG to PDF",
        tagline: "Convert and compile JPG, PNG, or WebP images into a PDF",
        category: "convert",
        icon: "🌅",
        color: "#d97706",
        bgLight: "#fffbeb",
        badge: "Fast Convert",
        minFiles: 1,
        maxFiles: 20,
        accept: ".jpg,.jpeg,.png,.webp",
        defaultOptions: { orientation: "portrait", margin: "0", pagesize: "fit" }
    },
    {
        id: "watermark",
        name: "Watermark PDF",
        tagline: "Stamp custom text or confidential watermark across pages",
        category: "security",
        icon: "💧",
        color: "#0891b2",
        bgLight: "#ecfeff",
        badge: "Brand & Secure",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        defaultOptions: { 
            text: "CONFIDENTIAL", 
            vertical_position: "middle", 
            horizontal_position: "center", 
            opacity: "70", 
            font_size: "36",
            rotation: "45",
            font_color: "#e11d48",
            mosaic: "0"
        }
    },
    {
        id: "pagenumber",
        name: "Page Numbers",
        tagline: "Add customizable numbering to headers or footers",
        category: "organize",
        icon: "🔢",
        color: "#4f46e5",
        bgLight: "#eef2ff",
        badge: "Pagination",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        defaultOptions: { 
            vertical_position: "bottom", 
            horizontal_position: "right",
            format: "Page {n} of {nb}",
            starting_number: "1",
            margin: "normal",
            font_size: "14",
            font_color: "#1e293b"
        }
    },
    {
        id: "repair",
        name: "Repair PDF",
        tagline: "Analyze and restore damaged, corrupt, or unreadable PDFs",
        category: "optimize",
        icon: "🩹",
        color: "#16a34a",
        bgLight: "#f0fdf4",
        badge: "Restoration",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: {}
    },
    {
        id: "pdfocr",
        name: "OCR PDF",
        tagline: "Convert scanned PDFs into searchable, selectable text",
        category: "optimize",
        icon: "👁️",
        color: "#9333ea",
        bgLight: "#faf5ff",
        badge: "AI Searchable",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: { ocr_language: "eng" }
    },
    {
        id: "pdfa",
        name: "PDF to PDF/A",
        tagline: "Transform documents into ISO-compliant long-term archives",
        category: "convert",
        icon: "🏛️",
        color: "#475569",
        bgLight: "#f8fafc",
        badge: "ISO Standard",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: { conformance: "pdfa-2b" }
    },
    {
        id: "protect",
        name: "Protect PDF",
        tagline: "Encrypt and secure your PDF with an uncrackable password",
        category: "security",
        icon: "🔒",
        color: "#0d9488",
        bgLight: "#f0fdfa",
        badge: "Security",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: { password: "" }
    },
    {
        id: "unlock",
        name: "Unlock PDF",
        tagline: "Remove password protection from secured PDFs",
        category: "security",
        icon: "🔓",
        color: "#6366f1",
        bgLight: "#e0e7ff",
        badge: "Decryption",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: { password: "" }
    },
    {
        id: "sign",
        name: "Sign PDF",
        tagline: "Sign documents with drawn signature, type name, add date & text stamps",
        category: "security",
        icon: "✍️",
        color: "#059669",
        bgLight: "#ecfdf5",
        badge: "E-Signature",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: {}
    },
    {
        id: "viewpdf",
        name: "PDF Reader & Viewer",
        tagline: "Open, view, inspect, search, and print PDFs with in-browser reader",
        category: "organize",
        icon: "📖",
        color: "#0284c7",
        bgLight: "#f0f9ff",
        badge: "Reader Studio",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        defaultOptions: {}
    }
];

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    applyTheme(state.theme);
    setupEventListeners();
    await checkHealth();
    await loadTools();
    renderToolsGrid();
}

// -------------------------------------------------------------
// Dark / Light Theme Toggle
// -------------------------------------------------------------
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('ilikepdfs_theme', state.theme);
    applyTheme(state.theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = '🌙';
    }
}

// -------------------------------------------------------------
// Health Check & Tools Loading
// -------------------------------------------------------------
async function checkHealth() {
    const statusTextEl = document.getElementById("cluster-status-text");
    try {
        const res = await fetch("/api/health");
        if (res.ok) {
            const data = await res.json();
            if (statusTextEl) {
                statusTextEl.textContent = "Cluster Online";
                statusTextEl.parentElement.title = "Connected to high-speed worker pool";
            }
        }
    } catch (e) {
        if (statusTextEl) {
            statusTextEl.textContent = "Offline Mode";
        }
    }
}

async function loadTools() {
    try {
        const res = await fetch("/api/tools");
        if (res.ok) {
            const data = await res.json();
            state.tools = data.tools.map(apiTool => {
                const match = DEFAULT_TOOLS.find(t => t.id === apiTool.id) || {};
                return { ...match, ...apiTool };
            });
        } else {
            state.tools = DEFAULT_TOOLS;
        }
    } catch (e) {
        state.tools = DEFAULT_TOOLS;
    }
}

// -------------------------------------------------------------
// Search & Filter
// -------------------------------------------------------------
function handleSearch(query) {
    state.searchQuery = (query || "").trim().toLowerCase();
    renderToolsGrid();
}

function filterTools(category, clickedBtn) {
    state.activeCategory = category;

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => link.classList.remove("active"));
    if (clickedBtn) {
        clickedBtn.classList.add("active");
    }

    renderToolsGrid();
}

function renderToolsGrid() {
    const grid = document.getElementById("tools-grid");
    if (!grid) return;

    let filtered = state.tools;

    if (state.activeCategory !== "all") {
        filtered = filtered.filter(t => t.category === state.activeCategory);
    }

    if (state.searchQuery) {
        filtered = filtered.filter(t => 
            t.name.toLowerCase().includes(state.searchQuery) ||
            t.tagline.toLowerCase().includes(state.searchQuery) ||
            t.id.toLowerCase().includes(state.searchQuery)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
                <h3>No tools matching "${escapeHtml(state.searchQuery)}"</h3>
                <p style="margin-top: 8px;">Try searching for "compress", "word", "merge", or "protect"</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(tool => `
        <div class="tool-card" 
             style="--card-accent: ${tool.color}; --card-bg-light: ${tool.bgLight};"
             onclick="selectTool('${tool.id}')"
             role="button"
             tabindex="0"
             aria-label="Open ${tool.name}">
            <div>
                <div class="tool-card-top">
                    <div class="tool-card-icon">${tool.icon}</div>
                    ${tool.badge ? `<span class="tool-badge" style="background: ${tool.bgLight}; color: ${tool.color}; font-weight: 700; font-size: 0.72rem; padding: 4px 10px; border-radius: 9999px;">${tool.badge}</span>` : ''}
                </div>
                <h3 class="tool-card-title">${tool.name}</h3>
                <p class="tool-card-desc">${tool.tagline}</p>
            </div>
            <div class="tool-card-footer" style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: ${tool.color};">
                <span>Start Tool</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </div>
        </div>
    `).join("");
}

// -------------------------------------------------------------
// Tool Selection & Workspace
// -------------------------------------------------------------
function selectTool(toolId) {
    const tool = state.tools.find(t => t.id === toolId);
    if (!tool) return;

    state.selectedTool = tool;
    state.files = [];
    state.pages = [];
    state.options = Object.assign({}, tool.defaultOptions || {});

    // Update Header
    document.getElementById("ws-tool-icon").textContent = tool.icon;
    document.getElementById("ws-tool-title").textContent = tool.name;
    document.getElementById("ws-tool-desc").textContent = tool.tagline;

    // File Input Accept
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
        fileInput.value = "";
        fileInput.accept = tool.accept || ".pdf";
    }

    // Update Hint
    const hintText = tool.maxFiles > 1
        ? `Select ${tool.minFiles === tool.maxFiles ? tool.minFiles : `${tool.minFiles} to ${tool.maxFiles}`} file(s) (Max 50MB each)`
        : `Select 1 file (Max 50MB)`;
    document.getElementById("ws-file-hint").textContent = hintText;

    // Reset Containers & Signer Studio
    document.getElementById("files-list-container").style.display = "none";
    document.getElementById("files-list").innerHTML = "";
    document.getElementById("page-canvas-container").style.display = "none";
    document.getElementById("page-thumbnails-grid").innerHTML = "";

    const signerStudio = document.getElementById("signer-studio");
    if (signerStudio) signerStudio.style.display = "none";
    const readerStudio = document.getElementById("reader-studio");
    if (readerStudio) readerStudio.style.display = "none";
    const stampContainer = document.getElementById("stamp-preview-container");
    if (stampContainer) stampContainer.style.display = "none";
    const wsLayout = document.querySelector(".workspace-layout");
    if (wsLayout) wsLayout.style.display = "grid";
    const dropzone = document.getElementById("dropzone");
    if (dropzone) dropzone.style.display = "block";

    state.signer = {
        pdfDoc: null,
        rawBytes: null,
        pageNum: 1,
        totalPages: 1,
        annotations: [],
        currentInkColor: '#0f172a',
        currentSigFont: 'Caveat',
        activeTab: 'draw',
        isDrawing: false,
        hasDrawn: false
    };

    state.stamp = {
        pdfDoc: null,
        rawBytes: null,
        pageNum: 1,
        totalPages: 1,
        scale: 0.8
    };

    // Render Options
    renderToolOptions(tool);

    // Update Process Button Text
    const btnText = document.getElementById("btn-process-text");
    btnText.textContent = `${tool.name} Now`;
    updateProcessButtonState();

    // Toggle Sections
    document.getElementById("hero-section").style.display = "none";
    document.getElementById("tools-section").style.display = "none";
    document.getElementById("features-section").style.display = "none";
    document.getElementById("workspace-section").style.display = "block";
    document.getElementById("processing-modal").style.display = "none";
    document.getElementById("result-modal").style.display = "none";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToHome() {
    state.selectedTool = null;
    state.files = [];
    state.pages = [];
    state.options = {};

    const signerStudio = document.getElementById("signer-studio");
    if (signerStudio) signerStudio.style.display = "none";
    const readerStudio = document.getElementById("reader-studio");
    if (readerStudio) readerStudio.style.display = "none";
    const stampContainer = document.getElementById("stamp-preview-container");
    if (stampContainer) stampContainer.style.display = "none";
    const wsLayout = document.querySelector(".workspace-layout");
    if (wsLayout) wsLayout.style.display = "grid";

    document.getElementById("workspace-section").style.display = "none";
    document.getElementById("hero-section").style.display = "block";
    document.getElementById("tools-section").style.display = "block";
    document.getElementById("features-section").style.display = "grid";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetToHome(event) {
    if (event) event.preventDefault();
    backToHome();
}

function resetToolForAnother() {
    document.getElementById("result-modal").style.display = "none";
    state.files = [];
    state.pages = [];
    const fileInput = document.getElementById("file-input");
    if (fileInput) fileInput.value = "";
    renderFilesList();
    document.getElementById("page-canvas-container").style.display = "none";
    document.getElementById("page-thumbnails-grid").innerHTML = "";

    const signerStudio = document.getElementById("signer-studio");
    if (signerStudio) signerStudio.style.display = "none";
    const readerStudio = document.getElementById("reader-studio");
    if (readerStudio) readerStudio.style.display = "none";
    const stampContainer = document.getElementById("stamp-preview-container");
    if (stampContainer) stampContainer.style.display = "none";
    const wsLayout = document.querySelector(".workspace-layout");
    if (wsLayout) wsLayout.style.display = "grid";
    const dropzone = document.getElementById("dropzone");
    if (dropzone) dropzone.style.display = "block";
    state.signer.annotations = [];

    updateProcessButtonState();
}

// -------------------------------------------------------------
// Dynamic Options Rendering (For all 16 Tools)
// -------------------------------------------------------------
function renderToolOptions(tool) {
    const container = document.getElementById("tool-options-container");
    if (!container) return;

    let html = "";

    switch (tool.id) {
        case "compress":
            html = `
                <div class="form-group">
                    <label class="form-label">Compression Level</label>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer; background: var(--bg-surface);">
                            <input type="radio" name="compression_level" value="extreme" onchange="setOption('compression_level', 'extreme')">
                            <div>
                                <strong style="display: block; font-size: 0.88rem; color: var(--text-primary);">Extreme Compression</strong>
                                <span style="font-size: 0.76rem; color: var(--text-muted);">Maximum size reduction, slightly lower image DPI</span>
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 2px solid var(--primary); border-radius: var(--radius-md); cursor: pointer; background: var(--bg-subtle);">
                            <input type="radio" name="compression_level" value="recommended" checked onchange="setOption('compression_level', 'recommended')">
                            <div>
                                <strong style="display: block; font-size: 0.88rem; color: var(--primary);">Recommended Compression</strong>
                                <span style="font-size: 0.76rem; color: var(--text-secondary);">Optimal balance between quality and high compression</span>
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); cursor: pointer; background: var(--bg-surface);">
                            <input type="radio" name="compression_level" value="low" onchange="setOption('compression_level', 'low')">
                            <div>
                                <strong style="display: block; font-size: 0.88rem; color: var(--text-primary);">Low Compression</strong>
                                <span style="font-size: 0.76rem; color: var(--text-muted);">High quality retained, minimal file compression</span>
                            </div>
                        </label>
                    </div>
                </div>
            `;
            break;

        case "merge":
            html = `
                <div class="form-group">
                    <label class="form-label">Output Filename</label>
                    <input type="text" class="form-input" id="opt-output-filename" 
                           value="ilikepdfs_merged.pdf" 
                           oninput="setOption('output_filename', this.value)"
                           placeholder="merged_document.pdf">
                    <span class="form-hint">Files will be combined in the order displayed on the left.</span>
                </div>
            `;
            break;

        case "split":
            html = `
                <div class="form-group">
                    <label class="form-label">Split Mode</label>
                    <select class="form-select" id="opt-split-mode" onchange="handleSplitModeChange(this.value)">
                        <option value="ranges" selected>Custom Page Ranges (e.g. 1-3, 5-8)</option>
                        <option value="extract_pages">Extract All Pages into Separate Files</option>
                    </select>
                </div>
                <div class="form-group" id="split-ranges-group">
                    <label class="form-label">Page Ranges</label>
                    <input type="text" class="form-input" id="opt-ranges" 
                           value="1-end" 
                           oninput="setOption('ranges', this.value)"
                           placeholder="e.g. 1-3, 5-end">
                    <span class="form-hint">Specify ranges like "1-5", "1,3,5" or "2-end".</span>
                </div>
            `;
            break;

        case "organize":
            html = `
                <div class="form-group">
                    <label class="form-label">Visual Page Controls</label>
                    <div style="padding: 12px; background: var(--bg-subtle); border-radius: var(--radius-md); font-size: 0.82rem; color: var(--text-secondary);">
                        <p>📄 Use the visual canvas on the left to drag & drop pages, rotate individual pages, or delete unwanted pages.</p>
                    </div>
                </div>
            `;
            break;

        case "rotate":
            html = `
                <div class="form-group">
                    <label class="form-label">Global Rotation Angle</label>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <button type="button" class="angle-btn active" onclick="setRotateAngle('90', this)" style="padding: 12px 6px; border: 2px solid var(--primary); border-radius: var(--radius-md); background: var(--bg-subtle); color: var(--primary); font-weight: 700; cursor: pointer;">
                            ↻ 90°
                        </button>
                        <button type="button" class="angle-btn" onclick="setRotateAngle('180', this)" style="padding: 12px 6px; border: 1px solid var(--border-light); border-radius: var(--radius-md); background: var(--bg-surface); color: var(--text-secondary); font-weight: 700; cursor: pointer;">
                            ↻ 180°
                        </button>
                        <button type="button" class="angle-btn" onclick="setRotateAngle('270', this)" style="padding: 12px 6px; border: 1px solid var(--border-light); border-radius: var(--radius-md); background: var(--bg-surface); color: var(--text-secondary); font-weight: 700; cursor: pointer;">
                            ↺ 270°
                        </button>
                    </div>
                </div>
            `;
            break;

        case "pdfoffice":
            html = `
                <div class="form-group">
                    <label class="form-label">Format Output</label>
                    <div style="padding: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); color: #1e40af; font-size: 0.88rem;">
                        <strong>High-Fidelity Word DOCX Conversion</strong>
                        <p style="margin-top: 4px; font-size: 0.78rem; color: #1d4ed8;">Text formatting, tables, and embedded images will be reconstructed into editable Word document format.</p>
                    </div>
                </div>
            `;
            break;

        case "officepdf":
            html = `
                <div class="form-group">
                    <label class="form-label">Office to PDF Engine</label>
                    <div style="padding: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-md); color: #1e40af; font-size: 0.88rem;">
                        <strong>Supported Formats: DOCX, PPTX, XLSX</strong>
                        <p style="margin-top: 4px; font-size: 0.78rem; color: #1d4ed8;">Converted into crisp vector PDF documents with preserved fonts and page breaks.</p>
                    </div>
                </div>
            `;
            break;

        case "imagepdf":
            html = `
                <div class="form-group">
                    <label class="form-label">Page Orientation</label>
                    <select class="form-select" onchange="setOption('orientation', this.value)">
                        <option value="portrait" selected>Portrait</option>
                        <option value="landscape">Landscape</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Page Margin</label>
                    <select class="form-select" onchange="setOption('margin', this.value)">
                        <option value="0" selected>No Margin (Full Bleed)</option>
                        <option value="small">Small Margin</option>
                        <option value="big">Big Margin</option>
                    </select>
                </div>
            `;
            break;

        case "watermark":
            html = `
                <div class="form-group">
                    <label class="form-label">Watermark Text</label>
                    <input type="text" class="form-input" id="opt-watermark-text" 
                           value="${escapeHtml(state.options.text || 'CONFIDENTIAL')}" 
                           oninput="setWatermarkText(this.value)"
                           placeholder="Enter stamp text">
                </div>
                <div class="form-group">
                    <label class="form-label">Position on Page (3x3 Matrix)</label>
                    <div class="pos-grid-container">
                        <div class="pos-grid-3x3" id="watermark-pos-grid">
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'top' && state.options.horizontal_position === 'left' ? 'active' : ''}" data-v="top" data-h="left" onclick="selectWatermarkPos('top', 'left', this)" title="Top Left"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'top' && state.options.horizontal_position === 'center' ? 'active' : ''}" data-v="top" data-h="center" onclick="selectWatermarkPos('top', 'center', this)" title="Top Center"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'top' && state.options.horizontal_position === 'right' ? 'active' : ''}" data-v="top" data-h="right" onclick="selectWatermarkPos('top', 'right', this)" title="Top Right"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'middle' && state.options.horizontal_position === 'left' ? 'active' : ''}" data-v="middle" data-h="left" onclick="selectWatermarkPos('middle', 'left', this)" title="Middle Left"></button>
                            <button type="button" class="pos-cell ${(!state.options.vertical_position || state.options.vertical_position === 'middle') && (!state.options.horizontal_position || state.options.horizontal_position === 'center') ? 'active' : ''}" data-v="middle" data-h="center" onclick="selectWatermarkPos('middle', 'center', this)" title="Center"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'middle' && state.options.horizontal_position === 'right' ? 'active' : ''}" data-v="middle" data-h="right" onclick="selectWatermarkPos('middle', 'right', this)" title="Middle Right"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'bottom' && state.options.horizontal_position === 'left' ? 'active' : ''}" data-v="bottom" data-h="left" onclick="selectWatermarkPos('bottom', 'left', this)" title="Bottom Left"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'bottom' && state.options.horizontal_position === 'center' ? 'active' : ''}" data-v="bottom" data-h="center" onclick="selectWatermarkPos('bottom', 'center', this)" title="Bottom Center"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'bottom' && state.options.horizontal_position === 'right' ? 'active' : ''}" data-v="bottom" data-h="right" onclick="selectWatermarkPos('bottom', 'right', this)" title="Bottom Right"></button>
                        </div>
                        <div class="pos-label-hint" id="pos-display-label">${(state.options.vertical_position || 'middle').toUpperCase()} ${(state.options.horizontal_position || 'center').toUpperCase()}</div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Rotation Angle</label>
                    <div class="rotation-pill-group">
                        <button type="button" class="rotation-pill ${state.options.rotation === '0' ? 'active' : ''}" onclick="selectWatermarkRotation('0', this)">Horizontal (0°)</button>
                        <button type="button" class="rotation-pill ${state.options.rotation !== '0' ? 'active' : ''}" onclick="selectWatermarkRotation('45', this)">Diagonal (45°)</button>
                    </div>
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin-bottom: 0;">Opacity</label>
                        <span class="form-hint" id="opacity-val-badge" style="font-weight: 700; color: var(--primary);">${state.options.opacity || 70}%</span>
                    </div>
                    <input type="range" min="10" max="100" value="${state.options.opacity || 70}" class="form-range" style="width: 100%; margin-top: 6px;" oninput="updateWatermarkOpacity(this.value)">
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin-bottom: 0;">Font Size</label>
                        <span class="form-hint" id="fontsize-val-badge" style="font-weight: 700; color: var(--primary);">${state.options.font_size || 36}px</span>
                    </div>
                    <input type="range" min="16" max="72" value="${state.options.font_size || 36}" class="form-range" style="width: 100%; margin-top: 6px;" oninput="updateWatermarkFontSize(this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Stamp Color</label>
                    <div class="stamp-color-palette">
                        <button type="button" class="stamp-color-dot ${state.options.font_color === '#e11d48' || !state.options.font_color ? 'active' : ''}" style="background: #e11d48;" onclick="selectWatermarkColor('#e11d48', this)" title="Rose Red"></button>
                        <button type="button" class="stamp-color-dot ${state.options.font_color === '#1e293b' ? 'active' : ''}" style="background: #1e293b;" onclick="selectWatermarkColor('#1e293b', this)" title="Slate"></button>
                        <button type="button" class="stamp-color-dot ${state.options.font_color === '#2563eb' ? 'active' : ''}" style="background: #2563eb;" onclick="selectWatermarkColor('#2563eb', this)" title="Royal Blue"></button>
                        <button type="button" class="stamp-color-dot ${state.options.font_color === '#16a34a' ? 'active' : ''}" style="background: #16a34a;" onclick="selectWatermarkColor('#16a34a', this)" title="Emerald"></button>
                        <button type="button" class="stamp-color-dot ${state.options.font_color === '#d97706' ? 'active' : ''}" style="background: #d97706;" onclick="selectWatermarkColor('#d97706', this)" title="Amber"></button>
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.88rem; font-weight: 600; color: var(--text-primary);">
                        <input type="checkbox" id="opt-watermark-mosaic" ${state.options.mosaic === '1' ? 'checked' : ''} onchange="toggleWatermarkMosaic(this.checked)">
                        <span>Repeat across whole page (Tiled Mosaic)</span>
                    </label>
                </div>
            `;
            break;

        case "pagenumber":
            html = `
                <div class="form-group">
                    <label class="form-label">Position on Page (Header / Footer)</label>
                    <div class="pos-grid-container">
                        <div class="pos-grid-3x3" id="pagenumber-pos-grid" style="grid-template-rows: 34px 0 34px;">
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'top' && state.options.horizontal_position === 'left' ? 'active' : ''}" data-v="top" data-h="left" onclick="selectPageNumPos('top', 'left', this)" title="Top Left"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'top' && state.options.horizontal_position === 'center' ? 'active' : ''}" data-v="top" data-h="center" onclick="selectPageNumPos('top', 'center', this)" title="Top Center"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'top' && state.options.horizontal_position === 'right' ? 'active' : ''}" data-v="top" data-h="right" onclick="selectPageNumPos('top', 'right', this)" title="Top Right"></button>
                            <div></div><div></div><div></div>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'bottom' && state.options.horizontal_position === 'left' ? 'active' : ''}" data-v="bottom" data-h="left" onclick="selectPageNumPos('bottom', 'left', this)" title="Bottom Left"></button>
                            <button type="button" class="pos-cell ${state.options.vertical_position === 'bottom' && state.options.horizontal_position === 'center' ? 'active' : ''}" data-v="bottom" data-h="center" onclick="selectPageNumPos('bottom', 'center', this)" title="Bottom Center"></button>
                            <button type="button" class="pos-cell ${(!state.options.vertical_position || state.options.vertical_position === 'bottom') && (!state.options.horizontal_position || state.options.horizontal_position === 'right') ? 'active' : ''}" data-v="bottom" data-h="right" onclick="selectPageNumPos('bottom', 'right', this)" title="Bottom Right"></button>
                        </div>
                        <div class="pos-label-hint" id="pagenum-pos-label">${(state.options.vertical_position || 'bottom').toUpperCase()} ${(state.options.horizontal_position || 'right').toUpperCase()}</div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Numbering Format</label>
                    <select class="form-select" onchange="updatePageNumFormat(this.value)">
                        <option value="Page {n} of {nb}" ${state.options.format === 'Page {n} of {nb}' || !state.options.format ? 'selected' : ''}>Page {n} of {nb} (e.g. Page 1 of 5)</option>
                        <option value="{n} / {nb}" ${state.options.format === '{n} / {nb}' ? 'selected' : ''}>{n} / {nb} (e.g. 1 / 5)</option>
                        <option value="{n}" ${state.options.format === '{n}' ? 'selected' : ''}>{n} (e.g. 1)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Starting Number</label>
                    <input type="number" min="1" max="9999" value="${state.options.starting_number || 1}" class="form-input" onchange="updatePageNumStart(this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Margin</label>
                    <select class="form-select" onchange="updatePageNumMargin(this.value)">
                        <option value="small" ${state.options.margin === 'small' ? 'selected' : ''}>Small Margin (12px)</option>
                        <option value="normal" ${state.options.margin === 'normal' || !state.options.margin ? 'selected' : ''}>Normal Margin (22px)</option>
                        <option value="big" ${state.options.margin === 'big' ? 'selected' : ''}>Big Margin (36px)</option>
                    </select>
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label" style="margin-bottom: 0;">Font Size</label>
                        <span class="form-hint" id="pagenum-size-badge" style="font-weight: 700; color: var(--primary);">${state.options.font_size || 14}px</span>
                    </div>
                    <input type="range" min="10" max="24" value="${state.options.font_size || 14}" class="form-range" style="width: 100%; margin-top: 6px;" oninput="updatePageNumSize(this.value)">
                </div>
            `;
            break;

        case "repair":
            html = `
                <div class="form-group">
                    <div style="padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); color: #166534; font-size: 0.88rem;">
                        <strong>PDF Repair Diagnostic</strong>
                        <p style="margin-top: 4px; font-size: 0.78rem; color: #15803d;">Deep recovery parser checks xref tables, fixes broken metadata, and reconstructs damaged pages.</p>
                    </div>
                </div>
            `;
            break;

        case "pdfocr":
            html = `
                <div class="form-group">
                    <label class="form-label">Document Language</label>
                    <select class="form-select" onchange="setOption('ocr_language', this.value)">
                        <option value="eng" selected>English</option>
                        <option value="spa">Spanish (Español)</option>
                        <option value="fra">French (Français)</option>
                        <option value="deu">German (Deutsch)</option>
                        <option value="ita">Italian (Italiano)</option>
                    </select>
                    <span class="form-hint">Accurately identifies text characters in scanned pages.</span>
                </div>
            `;
            break;

        case "pdfa":
            html = `
                <div class="form-group">
                    <label class="form-label">Archiving Profile</label>
                    <select class="form-select" onchange="setOption('conformance', this.value)">
                        <option value="pdfa-2b" selected>PDF/A-2b (Standard Archival)</option>
                        <option value="pdfa-1b">PDF/A-1b (Legacy)</option>
                    </select>
                </div>
            `;
            break;

        case "pdfjpg":
            html = `
                <div class="form-group">
                    <label class="form-label">Image Output Format</label>
                    <div style="padding: 14px; background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: var(--radius-md); color: #5b21b6; font-size: 0.88rem;">
                        <strong>High-Definition JPG Extraction</strong>
                        <p style="margin-top: 4px; font-size: 0.78rem; color: #6d28d9;">Each page of the PDF will be rendered at crisp 300 DPI.</p>
                    </div>
                </div>
            `;
            break;

        case "protect":
            html = `
                <div class="form-group">
                    <label class="form-label">Encryption Password <span style="color: #ef4444;">*</span></label>
                    <div style="position: relative;">
                        <input type="password" class="form-input" id="opt-password" 
                               oninput="setOption('password', this.value); updateProcessButtonState();"
                               placeholder="Enter secure password">
                        <button type="button" onclick="togglePasswordVisibility('opt-password', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: var(--text-muted); font-size: 0.85rem;">
                            Show
                        </button>
                    </div>
                    <span class="form-hint">Standard 128-bit AES encryption will be applied.</span>
                </div>
            `;
            break;

        case "unlock":
            html = `
                <div class="form-group">
                    <label class="form-label">Current Password (if known)</label>
                    <div style="position: relative;">
                        <input type="password" class="form-input" id="opt-password" 
                               oninput="setOption('password', this.value)"
                               placeholder="Enter existing password if known">
                        <button type="button" onclick="togglePasswordVisibility('opt-password', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: var(--text-muted); font-size: 0.85rem;">
                            Show
                        </button>
                    </div>
                </div>
            `;
            break;

        case "sign":
            html = `
                <div class="form-group">
                    <label class="form-label">E-Signature & Annotation Mode</label>
                    <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
                        <p>✍️ Upload your PDF to launch the <strong>Interactive In-Browser Sign Studio</strong>.</p>
                        <p style="margin-top: 8px;">Draw real signatures, type cursive names, insert today's date, or stamp checkmarks anywhere on the document with 100% privacy.</p>
                    </div>
                </div>
            `;
            break;

        case "viewpdf":
            html = `
                <div class="form-group">
                    <label class="form-label">Full-Screen Reader & Inspector</label>
                    <div style="padding: 14px; background: var(--bg-subtle); border-radius: var(--radius-md); font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
                        <p>📖 Upload any PDF to launch the <strong>Interactive PDF Reader Studio</strong>.</p>
                        <p style="margin-top: 8px;">Enjoy high-resolution viewing with zoom controls, fit-to-width, thumbnail sidebar navigation, view rotation, and instant browser printing.</p>
                    </div>
                </div>
            `;
            break;

        default:
            html = `<p style="font-size: 0.88rem; color: var(--text-muted);">Standard cloud processing will be applied.</p>`;
    }

    container.innerHTML = html;
}

function setOption(key, val) {
    state.options[key] = val;
}

function setRotateAngle(angle, btn) {
    state.options.rotate_angle = angle;
    document.querySelectorAll(".angle-btn").forEach(b => {
        b.style.border = "1px solid var(--border-light)";
        b.style.background = "var(--bg-surface)";
        b.style.color = "var(--text-secondary)";
    });
    btn.style.border = "2px solid var(--primary)";
    btn.style.background = "var(--bg-subtle)";
    btn.style.color = "var(--primary)";
}

function handleSplitModeChange(mode) {
    state.options.split_mode = mode;
    const rangesGroup = document.getElementById("split-ranges-group");
    if (rangesGroup) {
        rangesGroup.style.display = mode === "ranges" ? "block" : "none";
    }
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "Hide";
    } else {
        input.type = "password";
        btn.textContent = "Show";
    }
}

// -------------------------------------------------------------
// File Upload & Drag and Drop
// -------------------------------------------------------------
function setupEventListeners() {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("file-input");

    if (dropzone && fileInput) {
        dropzone.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFilesAdded(Array.from(e.target.files));
            }
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add("dragover");
            }, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove("dragover");
            }, false);
        });

        dropzone.addEventListener("drop", (e) => {
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                handleFilesAdded(Array.from(dt.files));
            }
        });
    }
}

function triggerAddMoreFiles() {
    const fileInput = document.getElementById("file-input");
    if (fileInput) fileInput.click();
}

async function handleFilesAdded(incomingFiles) {
    const tool = state.selectedTool;
    if (!tool) return;

    // Filter valid files based on accept list
    const validFiles = incomingFiles.filter(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const acceptList = (tool.accept || ".pdf").split(',').map(s => s.trim().toLowerCase());
        const isMatch = acceptList.some(acc => acc === ext || (acc === '.pdf' && file.type === 'application/pdf'));
        if (!isMatch) {
            showToast(`Skipped "${file.name}" (unsupported format for this tool)`, "error");
        }
        return isMatch;
    });

    if (validFiles.length === 0) return;

    // Check individual file size (<= 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    const sizeOkFiles = validFiles.filter(file => {
        if (file.size > MAX_SIZE) {
            showToast(`"${file.name}" exceeds 50MB limit`, "error");
            return false;
        }
        return true;
    });

    if (tool.maxFiles === 1) {
        state.files = [sizeOkFiles[0]];
    } else {
        const availableSlots = tool.maxFiles - state.files.length;
        if (availableSlots <= 0) {
            showToast(`Maximum limit of ${tool.maxFiles} files reached for this tool.`, "error");
            return;
        }
        const toAdd = sizeOkFiles.slice(0, availableSlots);
        state.files = state.files.concat(toAdd);
        if (sizeOkFiles.length > availableSlots) {
            showToast(`Only added first ${availableSlots} files (limit: ${tool.maxFiles})`, "error");
        }
    }

    renderFilesList();
    updateProcessButtonState();

    // If PDF file and tool is 'sign', initialize the interactive Signer Studio
    const firstPdf = state.files.find(f => f.name.toLowerCase().endsWith('.pdf'));
    if (firstPdf && tool.id === 'sign') {
        await initSignerStudio(firstPdf);
        return;
    }

    // If PDF file and tool is 'viewpdf', launch PDF Reader Studio directly
    if (firstPdf && tool.id === 'viewpdf') {
        await initPdfReaderFromFile(firstPdf);
        return;
    }

    // If PDF file and tool is 'watermark' or 'pagenumber', launch Real-Time Visual Stamp Preview!
    if (firstPdf && (tool.id === 'watermark' || tool.id === 'pagenumber')) {
        await initStampPreview(firstPdf);
        return;
    }

    // If PDF file and tool benefits from visual canvas (Organize, Merge, Split, Rotate)
    if (firstPdf && (tool.id === 'organize' || tool.id === 'rotate' || tool.id === 'split' || tool.id === 'merge')) {
        await generateVisualPageThumbnails(firstPdf);
    }
}

function removeFile(index) {
    state.files.splice(index, 1);
    renderFilesList();
    if (state.files.length === 0) {
        state.pages = [];
        document.getElementById("page-canvas-container").style.display = "none";
        document.getElementById("page-thumbnails-grid").innerHTML = "";
        const stampContainer = document.getElementById("stamp-preview-container");
        if (stampContainer) stampContainer.style.display = "none";
    }
    updateProcessButtonState();
}

function renderFilesList() {
    const container = document.getElementById("files-list-container");
    const list = document.getElementById("files-list");
    const countBadge = document.getElementById("files-count");
    const dropzone = document.getElementById("dropzone");

    if (state.files.length === 0) {
        container.style.display = "none";
        dropzone.style.display = "block";
        return;
    }

    container.style.display = "block";
    countBadge.textContent = `${state.files.length} File${state.files.length > 1 ? "s" : ""} Selected`;

    list.innerHTML = state.files.map((file, idx) => `
        <div class="file-item">
            <div class="file-item-left">
                <div class="file-pdf-icon">${file.name.split('.').pop().toUpperCase()}</div>
                <div class="file-meta">
                    <span class="file-name" title="${file.name}">${escapeHtml(file.name)}</span>
                    <span class="file-size">${formatBytes(file.size)}</span>
                </div>
            </div>
            <button class="file-remove-btn" onclick="removeFile(${idx})" title="Remove file">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join("");
}

// -------------------------------------------------------------
// PDF.js Interactive Visual Page Thumbnail Canvas
// -------------------------------------------------------------
async function generateVisualPageThumbnails(file) {
    if (typeof pdfjsLib === 'undefined') return;

    const canvasContainer = document.getElementById("page-canvas-container");
    const grid = document.getElementById("page-thumbnails-grid");
    const pageCountBadge = document.getElementById("canvas-page-count");

    canvasContainer.style.display = "block";
    grid.innerHTML = `<div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: var(--text-muted);">Generating visual page previews...</div>`;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        state.pages = [];
        grid.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.35 });

            const canvas = document.createElement("canvas");
            canvas.className = "page-thumbnail-canvas";
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: canvas.getContext("2d"),
                viewport: viewport
            };
            await page.render(renderContext).promise;

            state.pages.push({
                id: `page_${i}_${Date.now()}`,
                pageNum: i,
                originalNum: i,
                rotation: 0,
                isDeleted: false,
                canvasElement: canvas
            });
        }

        pageCountBadge.textContent = `${state.pages.length} Pages`;
        renderThumbnailsGrid();
    } catch (err) {
        console.warn("Could not render page previews:", err);
        canvasContainer.style.display = "none";
    }
}

function renderThumbnailsGrid() {
    const grid = document.getElementById("page-thumbnails-grid");
    if (!grid) return;

    grid.innerHTML = "";

    state.pages.forEach((pageItem, index) => {
        const card = document.createElement("div");
        card.className = `page-thumbnail-card ${pageItem.isDeleted ? 'deleted' : ''}`;
        card.setAttribute("draggable", pageItem.isDeleted ? "false" : "true");
        card.setAttribute("data-index", index);

        // Thumbnail Canvas Clone / Append
        const canvasContainer = document.createElement("div");
        canvasContainer.style.transform = `rotate(${pageItem.rotation}deg)`;
        canvasContainer.style.transition = "transform 0.25s ease";
        canvasContainer.appendChild(pageItem.canvasElement);
        card.appendChild(canvasContainer);

        // Page Number Tag
        const tag = document.createElement("div");
        tag.className = "page-number-tag";
        tag.textContent = pageItem.isDeleted ? `Page ${pageItem.originalNum} (Removed)` : `Page ${pageItem.originalNum}`;
        card.appendChild(tag);

        // Hover Action Buttons
        const actions = document.createElement("div");
        actions.className = "page-card-actions";
        actions.innerHTML = `
            <button type="button" class="page-action-btn" title="Rotate page 90°" onclick="rotateSinglePage(${index}, event)">↻</button>
            <button type="button" class="page-action-btn delete" title="${pageItem.isDeleted ? 'Restore page' : 'Remove page'}" onclick="toggleDeletePage(${index}, event)">
                ${pageItem.isDeleted ? '↺' : '🗑️'}
            </button>
        `;
        card.appendChild(actions);

        // Drag & Drop Listeners for Reordering
        setupPageCardDragEvents(card, index);

        grid.appendChild(card);
    });
}

function setupPageCardDragEvents(card, index) {
    card.addEventListener("dragstart", (e) => {
        card.classList.add("dragging");
        e.dataTransfer.setData("text/plain", index);
    });

    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });

    card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.style.borderColor = "var(--primary)";
    });

    card.addEventListener("dragleave", () => {
        card.style.borderColor = "var(--border-light)";
    });

    card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.style.borderColor = "var(--border-light)";
        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const toIndex = index;

        if (fromIndex !== toIndex && !isNaN(fromIndex)) {
            const movedItem = state.pages.splice(fromIndex, 1)[0];
            state.pages.splice(toIndex, 0, movedItem);
            renderThumbnailsGrid();
        }
    });
}

function rotateSinglePage(index, event) {
    if (event) event.stopPropagation();
    state.pages[index].rotation = (state.pages[index].rotation + 90) % 360;
    renderThumbnailsGrid();
}

function toggleDeletePage(index, event) {
    if (event) event.stopPropagation();
    state.pages[index].isDeleted = !state.pages[index].isDeleted;
    renderThumbnailsGrid();
}

function rotateAllPages(deg) {
    state.pages.forEach(p => {
        if (!p.isDeleted) {
            p.rotation = (p.rotation + deg) % 360;
        }
    });
    renderThumbnailsGrid();
}

function resetCanvasPages() {
    state.pages.sort((a, b) => a.originalNum - b.originalNum);
    state.pages.forEach(p => {
        p.rotation = 0;
        p.isDeleted = false;
    });
    renderThumbnailsGrid();
}

function updateProcessButtonState() {
    const btn = document.getElementById("btn-start-process");
    if (!btn || !state.selectedTool) return;

    const tool = state.selectedTool;
    const hasEnoughFiles = state.files.length >= tool.minFiles;
    
    let isValid = hasEnoughFiles;
    if (tool.id === "protect") {
        isValid = isValid && state.options.password && state.options.password.trim().length > 0;
    }

    btn.disabled = !isValid;
}

// -------------------------------------------------------------
// Core Processing Action
// -------------------------------------------------------------
async function handleStartProcess() {
    const tool = state.selectedTool;
    if (!tool || state.files.length < tool.minFiles) {
        showToast(`Please upload at least ${tool.minFiles} file(s).`, "error");
        return;
    }

    if (tool.id === "viewpdf") {
        await initPdfReaderFromFile(state.files[0]);
        return;
    }

    if (tool.id === "sign") {
        await initSignerStudio(state.files[0]);
        return;
    }

    if (tool.id === "protect" && (!state.options.password || !state.options.password.trim())) {
        showToast("Please enter an encryption password.", "error");
        return;
    }

    state.isProcessing = true;
    showProcessingModal();

    try {
        // Step 1: Dispatch
        updateProcessingStep("Dispatching & Allocating Edge Worker...", "Connecting to high-speed cloud cluster", 25);
        await sleep(350);

        // Step 2: Upload preparation
        updateProcessingStep("Uploading Stream...", `Transferring ${state.files.length} document(s) securely`, 50);

        const formData = new FormData();
        formData.append("tool", tool.id);

        state.files.forEach(f => {
            formData.append("files", f);
        });

        // If visual canvas was manipulated for Organize / Rotate / Split
        if (state.pages && state.pages.length > 0) {
            const removedPages = state.pages
                .filter(p => p.isDeleted)
                .map(p => p.originalNum)
                .join(",");
            if (removedPages) {
                formData.append("remove_pages", removedPages);
            }

            const activePages = state.pages.filter(p => !p.isDeleted);
            const isReordered = activePages.some((p, idx) => p.originalNum !== (idx + 1));
            if (isReordered) {
                const reorderSeq = activePages.map(p => p.originalNum).join(",");
                formData.append("reorder", reorderSeq);
            }

            // Check if any single page has a rotation
            const rotated = state.pages.find(p => p.rotation !== 0);
            if (rotated && !formData.has("rotate_angle")) {
                formData.append("rotate_angle", String(rotated.rotation));
            }
        }

        Object.keys(state.options).forEach(optKey => {
            if (state.options[optKey] !== undefined && state.options[optKey] !== null) {
                formData.append(optKey, state.options[optKey]);
            }
        });

        // Step 3: Trigger server processing
        updateProcessingStep("Executing Transformation...", "Worker engine applying algorithms", 75);

        const response = await fetch("/api/process", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to process document on cluster");
        }

        // Step 4: Finalize
        updateProcessingStep("Ready for Download!", "Output generated successfully", 100);
        await sleep(400);

        hideProcessingModal();
        showResultModal(data);
        showToast(`Task finished in ${data.timer || 'under a second'}!`, "success");

    } catch (err) {
        console.error("Processing failed:", err);
        hideProcessingModal();
        showToast(err.message || "An error occurred while processing.", "error");
    } finally {
        state.isProcessing = false;
    }
}

// -------------------------------------------------------------
// Processing & Result Modal Helpers
// -------------------------------------------------------------
function showProcessingModal() {
    const modal = document.getElementById("processing-modal");
    if (modal) modal.style.display = "flex";
}

function hideProcessingModal() {
    const modal = document.getElementById("processing-modal");
    if (modal) modal.style.display = "none";
}

function updateProcessingStep(title, sub, percent) {
    const titleEl = document.getElementById("processing-step-title");
    const subEl = document.getElementById("processing-step-sub");
    const barEl = document.getElementById("progress-bar-fill");
    const percentEl = document.getElementById("progress-percent");

    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;
    if (barEl) barEl.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
}

function showResultModal(data) {
    state.lastResultData = data;
    const modal = document.getElementById("result-modal");
    const filenameEl = document.getElementById("result-filename");
    const downloadBtn = document.getElementById("btn-download-result");
    const statsContainer = document.getElementById("result-stats");
    const previewBtn = document.getElementById("btn-preview-in-reader");

    if (!modal) return;

    if (filenameEl) filenameEl.textContent = data.filename;

    if (downloadBtn) {
        downloadBtn.href = data.downloadUrl;
        downloadBtn.setAttribute("download", data.filename);
    }

    if (previewBtn) {
        const isPdf = data.filename && data.filename.toLowerCase().endsWith(".pdf");
        previewBtn.style.display = isPdf ? "flex" : "none";
    }

    if (statsContainer) {
        if (data.originalSize && data.filesize) {
            statsContainer.style.display = "flex";
            document.getElementById("stat-orig-size").textContent = formatBytes(data.originalSize);
            document.getElementById("stat-new-size").textContent = formatBytes(data.filesize);

            const savingsBadge = document.getElementById("stat-savings-badge");
            if (data.savedPercent > 0) {
                savingsBadge.textContent = `Saved ${data.savedPercent}%`;
                savingsBadge.style.display = "inline-block";
            } else {
                savingsBadge.style.display = "none";
            }
        } else {
            statsContainer.style.display = "none";
        }
    }

    modal.style.display = "flex";
}

// -------------------------------------------------------------
// Toast & Utilities
// -------------------------------------------------------------
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = type === "error" ? "⚠️" : (type === "success" ? "✅" : "ℹ️");
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.25s ease";
        setTimeout(() => toast.remove(), 250);
    }, 4000);
}

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------------------------------------------------
// Interactive In-Browser PDF Signer & Annotation Studio
// Uses PDF.js for crisp rendering and PDF-Lib for local signing
// -------------------------------------------------------------
async function initSignerStudio(file) {
    if (typeof pdfjsLib === 'undefined' || typeof PDFLib === 'undefined') {
        showToast("PDF rendering or signing library still loading. Please try again.", "error");
        return;
    }

    try {
        showProcessingModal();
        updateProcessingStep("Opening Sign Studio...", "Reading document structure", 30);

        const wsLayout = document.querySelector(".workspace-layout");
        if (wsLayout) wsLayout.style.display = "none";
        const signerStudio = document.getElementById("signer-studio");
        if (signerStudio) signerStudio.style.display = "block";

        state.signer.rawBytes = await file.arrayBuffer();
        state.signer.pdfDoc = await pdfjsLib.getDocument({ data: state.signer.rawBytes }).promise;
        state.signer.totalPages = state.signer.pdfDoc.numPages;
        state.signer.pageNum = 1;
        state.signer.annotations = [];

        hideProcessingModal();
        await renderSignerPage(1);
        showToast("Document loaded in Sign Studio! Add your signature, text, or date.", "info");

        window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err) {
        console.error("Failed to initialize Signer Studio:", err);
        hideProcessingModal();
        showToast("Failed to load document for signing: " + err.message, "error");
    }
}

async function renderSignerPage(pageNum) {
    if (!state.signer.pdfDoc) return;
    state.signer.pageNum = pageNum;

    // Update indicator
    const indicator = document.getElementById("signer-page-indicator");
    if (indicator) {
        indicator.textContent = `Page ${pageNum} / ${state.signer.totalPages}`;
    }

    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");
    if (prevBtn) prevBtn.disabled = pageNum <= 1;
    if (nextBtn) nextBtn.disabled = pageNum >= state.signer.totalPages;

    const page = await state.signer.pdfDoc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // Target viewport width (max 760px for clean editing)
    const targetWidth = Math.min(760, (window.innerWidth - 80));
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.getElementById("signer-page-canvas");
    const wrapper = document.getElementById("signer-page-wrapper");
    const layer = document.getElementById("signer-annotation-layer");

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    wrapper.style.width = `${viewport.width}px`;
    wrapper.style.height = `${viewport.height}px`;

    layer.style.width = `${viewport.width}px`;
    layer.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
        canvasContext: ctx,
        viewport: viewport
    }).promise;

    renderAnnotationsLayer();
}

function changeSignerPage(delta) {
    const newPage = state.signer.pageNum + delta;
    if (newPage >= 1 && newPage <= state.signer.totalPages) {
        renderSignerPage(newPage);
    }
}

function renderAnnotationsLayer() {
    const layer = document.getElementById("signer-annotation-layer");
    if (!layer) return;
    layer.innerHTML = "";

    const pageAnns = state.signer.annotations.filter(a => a.page === state.signer.pageNum);
    pageAnns.forEach(ann => {
        const item = document.createElement("div");
        item.className = "annotation-item";
        item.dataset.id = ann.id;
        item.style.left = `${ann.x}px`;
        item.style.top = `${ann.y}px`;

        if (ann.type === 'sig') {
            item.innerHTML = `
                <img src="${ann.content}" class="annotation-signature-img" style="width:${ann.width}px; height:${ann.height}px;" alt="Signature">
                <button type="button" class="annotation-delete-btn" onclick="deleteAnnotation('${ann.id}', event)" title="Remove signature">✕</button>
            `;
        } else if (ann.type === 'text') {
            item.innerHTML = `
                <div class="annotation-text-input" contenteditable="true" spellcheck="false" style="font-size: ${ann.fontSize || 15}px; color: ${ann.color || '#0f172a'};">${escapeHtml(ann.content)}</div>
                <button type="button" class="annotation-delete-btn" onclick="deleteAnnotation('${ann.id}', event)" title="Remove text">✕</button>
            `;
            const textEl = item.querySelector(".annotation-text-input");
            textEl.addEventListener("input", () => {
                ann.content = textEl.innerText;
            });
            textEl.addEventListener("blur", () => {
                ann.content = textEl.innerText;
            });
        } else if (ann.type === 'date') {
            item.innerHTML = `
                <span class="annotation-date-stamp" style="font-size: ${ann.fontSize || 14}px; font-weight: 700; color: ${ann.color || '#0f172a'}; font-family: var(--font-body);">${escapeHtml(ann.content)}</span>
                <button type="button" class="annotation-delete-btn" onclick="deleteAnnotation('${ann.id}', event)" title="Remove date">✕</button>
            `;
        } else if (ann.type === 'check') {
            item.innerHTML = `
                <span class="annotation-checkmark">✔</span>
                <button type="button" class="annotation-delete-btn" onclick="deleteAnnotation('${ann.id}', event)" title="Remove checkmark">✕</button>
            `;
        }

        makeDraggable(item, ann);
        layer.appendChild(item);
    });
}

function makeDraggable(el, ann) {
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
    let isDragging = false;

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("touchstart", onTouchStart, { passive: false });

    function onMouseDown(e) {
        if (e.target.closest(".annotation-delete-btn")) return;
        if (e.target.isContentEditable) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = ann.x;
        initialTop = ann.y;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const canvas = document.getElementById("signer-page-canvas");
        const maxX = canvas ? canvas.width - (ann.width || 60) : 700;
        const maxY = canvas ? canvas.height - (ann.height || 30) : 900;

        ann.x = Math.max(0, Math.min(maxX, initialLeft + dx));
        ann.y = Math.max(0, Math.min(maxY, initialTop + dy));

        el.style.left = `${ann.x}px`;
        el.style.top = `${ann.y}px`;
    }

    function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }

    function onTouchStart(e) {
        if (e.target.closest(".annotation-delete-btn")) return;
        if (e.target.isContentEditable) return;

        isDragging = true;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        initialLeft = ann.x;
        initialTop = ann.y;

        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);
        e.preventDefault();
    }

    function onTouchMove(e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        const canvas = document.getElementById("signer-page-canvas");
        const maxX = canvas ? canvas.width - (ann.width || 60) : 700;
        const maxY = canvas ? canvas.height - (ann.height || 30) : 900;

        ann.x = Math.max(0, Math.min(maxX, initialLeft + dx));
        ann.y = Math.max(0, Math.min(maxY, initialTop + dy));

        el.style.left = `${ann.x}px`;
        el.style.top = `${ann.y}px`;
        e.preventDefault();
    }

    function onTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
    }
}

function deleteAnnotation(id, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    state.signer.annotations = state.signer.annotations.filter(a => a.id !== id);
    renderAnnotationsLayer();
}

// -------------------------------------------------------------
// Signature Modal & Drawing / Typing Engine
// -------------------------------------------------------------
let isDrawingCanvasSetup = false;

function openSignatureModal() {
    const modal = document.getElementById("signature-modal");
    if (!modal) return;
    modal.style.display = "flex";
    setupSignatureCanvas();
}

function closeSignatureModal() {
    const modal = document.getElementById("signature-modal");
    if (modal) modal.style.display = "none";
}

function switchSigTab(tab) {
    state.signer.activeTab = tab;
    const drawTabBtn = document.getElementById("sig-tab-draw");
    const typeTabBtn = document.getElementById("sig-tab-type");
    const drawPanel = document.getElementById("sig-panel-draw");
    const typePanel = document.getElementById("sig-panel-type");

    if (tab === 'draw') {
        if (drawTabBtn) drawTabBtn.classList.add("active");
        if (typeTabBtn) typeTabBtn.classList.remove("active");
        if (drawPanel) drawPanel.style.display = "block";
        if (typePanel) typePanel.style.display = "none";
    } else {
        if (typeTabBtn) typeTabBtn.classList.add("active");
        if (drawTabBtn) drawTabBtn.classList.remove("active");
        if (typePanel) typePanel.style.display = "block";
        if (drawPanel) drawPanel.style.display = "none";
    }
}

function setupSignatureCanvas() {
    const canvas = document.getElementById("sig-drawing-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = state.signer.currentInkColor || "#0f172a";

    if (isDrawingCanvasSetup) return;
    isDrawingCanvasSetup = true;

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function start(e) {
        state.signer.isDrawing = true;
        state.signer.hasDrawn = true;
        const coords = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        if (e.type === 'touchstart') e.preventDefault();
    }

    function move(e) {
        if (!state.signer.isDrawing) return;
        const coords = getCoords(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        if (e.type === 'touchmove') e.preventDefault();
    }

    function end() {
        state.signer.isDrawing = false;
    }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
}

function clearSignatureCanvas() {
    const canvas = document.getElementById("sig-drawing-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.signer.hasDrawn = false;
}

function setInkColor(color, btn) {
    state.signer.currentInkColor = color;

    document.querySelectorAll(".ink-dot").forEach(d => d.classList.remove("active"));
    if (btn) btn.classList.add("active");

    const canvas = document.getElementById("sig-drawing-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = color;
    }

    const preview = document.getElementById("sig-typed-preview");
    if (preview) {
        preview.style.color = color;
    }
}

function updateTypedSignaturePreview(name) {
    const preview = document.getElementById("sig-typed-preview");
    if (preview) {
        preview.textContent = name.trim() || "Your Signature";
        preview.style.color = state.signer.currentInkColor;
    }
}

function setSigFont(font) {
    state.signer.currentSigFont = font;
    const preview = document.getElementById("sig-typed-preview");
    if (preview) {
        preview.style.fontFamily = font === 'Caveat' ? "'Caveat', cursive" : "'Dancing Script', cursive";
    }
}

function applySignature() {
    let dataUrl = null;

    if (state.signer.activeTab === 'draw') {
        const canvas = document.getElementById("sig-drawing-canvas");
        if (!canvas || !state.signer.hasDrawn) {
            showToast("Please draw your signature first", "info");
            return;
        }
        dataUrl = canvas.toDataURL("image/png");
    } else {
        const input = document.getElementById("sig-type-input");
        const name = (input ? input.value : "").trim() || "Your Signature";

        // Render to offscreen canvas
        const offscreen = document.createElement("canvas");
        offscreen.width = 520;
        offscreen.height = 160;
        const ctx = offscreen.getContext("2d");

        const fontFamily = state.signer.currentSigFont === 'Caveat' ? "'Caveat', cursive" : "'Dancing Script', cursive";
        ctx.font = `64px ${fontFamily}`;
        ctx.fillStyle = state.signer.currentInkColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, offscreen.width / 2, offscreen.height / 2);

        dataUrl = offscreen.toDataURL("image/png");
    }

    state.signer.annotations.push({
        id: "sig_" + Date.now(),
        page: state.signer.pageNum,
        type: "sig",
        x: 60,
        y: 120,
        width: 180,
        height: 65,
        content: dataUrl
    });

    closeSignatureModal();
    renderAnnotationsLayer();
    showToast("Signature inserted! Drag to position anywhere on the page.", "success");
}

function addAnnotation(type) {
    if (type === 'text') {
        state.signer.annotations.push({
            id: 'text_' + Date.now(),
            page: state.signer.pageNum,
            type: 'text',
            x: 80,
            y: 80,
            width: 180,
            height: 38,
            content: 'Type your text here',
            fontSize: 16,
            color: state.signer.currentInkColor || '#0f172a'
        });
        showToast("Text box added! Click to edit and drag to move.", "info");
    } else if (type === 'date') {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        state.signer.annotations.push({
            id: 'date_' + Date.now(),
            page: state.signer.pageNum,
            type: 'date',
            x: 80,
            y: 80,
            width: 130,
            height: 32,
            content: dateStr,
            fontSize: 14,
            color: state.signer.currentInkColor || '#0f172a'
        });
        showToast("Date stamp added!", "info");
    } else if (type === 'check') {
        state.signer.annotations.push({
            id: 'check_' + Date.now(),
            page: state.signer.pageNum,
            type: 'check',
            x: 80,
            y: 80,
            width: 36,
            height: 36,
            content: '✔'
        });
        showToast("Checkmark added!", "info");
    }

    renderAnnotationsLayer();
}

async function saveSignedPdf() {
    if (!state.signer.rawBytes) {
        showToast("No document loaded to sign", "error");
        return;
    }

    if (state.signer.annotations.length === 0) {
        showToast("Add at least one signature, text, or date stamp before signing.", "info");
        return;
    }

    try {
        showProcessingModal();
        updateProcessingStep("Signing Document...", "Loading original document structure", 25);

        if (typeof PDFLib === 'undefined') {
            throw new Error("PDF-Lib engine not available in browser.");
        }

        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const freshBytes = state.files[0] ? await state.files[0].arrayBuffer() : state.signer.rawBytes.slice(0);
        const pdfDoc = await PDFDocument.load(freshBytes);
        const pages = pdfDoc.getPages();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const canvasEl = document.getElementById("signer-page-canvas");
        const renderedWidth = canvasEl.offsetWidth || canvasEl.width;
        const renderedHeight = canvasEl.offsetHeight || canvasEl.height;

        updateProcessingStep("Embedding Signatures...", "Rendering signatures and annotations onto pages", 60);

        for (const ann of state.signer.annotations) {
            const pageIndex = ann.page - 1;
            if (pageIndex < 0 || pageIndex >= pages.length) continue;

            const targetPage = pages[pageIndex];
            const { width: pageWidth, height: pageHeight } = targetPage.getSize();

            const scaleX = pageWidth / renderedWidth;
            const scaleY = pageHeight / renderedHeight;

            const pdfX = ann.x * scaleX;
            const pdfW = (ann.width || 120) * scaleX;
            const pdfH = (ann.height || 40) * scaleY;
            // Coordinate inversion: PDF 0,0 is at bottom-left
            const pdfY = pageHeight - (ann.y * scaleY) - pdfH;

            if (ann.type === 'sig') {
                const imgBytes = await fetch(ann.content).then(r => r.arrayBuffer());
                const embeddedPng = await pdfDoc.embedPng(imgBytes);
                targetPage.drawImage(embeddedPng, {
                    x: pdfX,
                    y: pdfY,
                    width: pdfW,
                    height: pdfH
                });
            } else if (ann.type === 'text' || ann.type === 'date') {
                let r = 0.06, g = 0.09, b = 0.16;
                if (ann.color === '#2563eb') { r = 0.15; g = 0.39; b = 0.92; }
                else if (ann.color === '#dc2626') { r = 0.86; g = 0.15; b = 0.15; }

                const fontSize = (ann.fontSize || 14) * scaleY;
                targetPage.drawText(ann.content || '', {
                    x: pdfX + 2,
                    y: pdfY + 6,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(r, g, b)
                });
            } else if (ann.type === 'check') {
                targetPage.drawText("v", {
                    x: pdfX + 2,
                    y: pdfY + 4,
                    size: 20 * scaleY,
                    font: helveticaFont,
                    color: rgb(0.02, 0.59, 0.41)
                });
            }
        }

        updateProcessingStep("Compiling PDF...", "Generating clean byte stream", 85);
        const signedBytes = await pdfDoc.save();

        const blob = new Blob([signedBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const origFile = state.files[0];
        const origName = origFile ? origFile.name : "document.pdf";
        const resultName = origName.replace(/\.pdf$/i, '') + "_signed.pdf";

        updateProcessingStep("Completed!", "Your signed document is ready to download", 100);
        await sleep(300);

        hideProcessingModal();
        showResultModal({
            filename: resultName,
            downloadUrl: blobUrl,
            filesize: signedBytes.byteLength,
            originalSize: origFile ? origFile.size : null,
            timer: "0.2s"
        });

        showToast("Document signed successfully!", "success");

    } catch (err) {
        console.error("Signing error:", err);
        hideProcessingModal();
        showToast("Error signing document: " + err.message, "error");
    }
}

// -------------------------------------------------------------
// Interactive In-Browser PDF Reader & Viewer Studio
// Full-featured document viewer with zoom, thumbnails, print & download
// -------------------------------------------------------------
async function initPdfReaderFromFile(file) {
    try {
        showProcessingModal();
        updateProcessingStep("Opening PDF Reader...", "Parsing pages and document index", 35);

        const rawBytes = await file.arrayBuffer();
        const downloadUrl = URL.createObjectURL(file);

        hideProcessingModal();
        await initPdfReader(rawBytes, file.name, downloadUrl);
    } catch (err) {
        console.error("Reader load failed:", err);
        hideProcessingModal();
        showToast("Failed to open PDF in reader: " + err.message, "error");
    }
}

async function initPdfReader(rawBytes, filename, downloadUrl) {
    if (typeof pdfjsLib === "undefined") {
        showToast("PDF.js library is not ready.", "error");
        return;
    }

    try {
        state.reader.rawBytes = rawBytes;
        state.reader.filename = filename || "document.pdf";
        state.reader.downloadUrl = downloadUrl || URL.createObjectURL(new Blob([rawBytes], { type: "application/pdf" }));
        state.reader.pageNum = 1;
        state.reader.scale = 1.0;
        state.reader.rotation = 0;
        state.reader.sidebarOpen = true;
        state.reader.fitMode = null;

        const clonedBytes = rawBytes.slice(0);
        const loadingTask = pdfjsLib.getDocument({
            data: clonedBytes,
            onPassword: (callback, reason) => {
                const userPassword = prompt(reason === 2 ? "Incorrect password. Please enter the document password:" : "This document is password-protected. Enter password to view:");
                if (userPassword) {
                    callback(userPassword);
                } else {
                    callback(new Error("Password cancelled"));
                }
            }
        });
        state.reader.pdfDoc = await loadingTask.promise;
        state.reader.totalPages = state.reader.pdfDoc.numPages;

        // Hide Workspace layout & Result Modal, Show Reader Studio
        const wsLayout = document.querySelector(".workspace-layout");
        if (wsLayout) wsLayout.style.display = "none";
        const resultModal = document.getElementById("result-modal");
        if (resultModal) resultModal.style.display = "none";
        const signerStudio = document.getElementById("signer-studio");
        if (signerStudio) signerStudio.style.display = "none";

        const readerStudio = document.getElementById("reader-studio");
        if (readerStudio) readerStudio.style.display = "flex";

        // Update Reader Toolbar info
        const nameEl = document.getElementById("reader-doc-name");
        if (nameEl) nameEl.textContent = state.reader.filename;

        const totalEl = document.getElementById("reader-total-pages");
        if (totalEl) totalEl.textContent = `/ ${state.reader.totalPages}`;

        const pageInput = document.getElementById("reader-page-input");
        if (pageInput) {
            pageInput.max = state.reader.totalPages;
            pageInput.value = 1;
        }

        const downloadBtn = document.getElementById("btn-reader-download");
        if (downloadBtn) {
            downloadBtn.href = state.reader.downloadUrl;
            downloadBtn.setAttribute("download", state.reader.filename);
        }

        await renderReaderCurrentPage();
        renderReaderSidebarThumbnails();

        showToast("PDF Reader opened! Use zoom, thumbnails, or print controls.", "info");
        window.scrollTo({ top: 120, behavior: "smooth" });

    } catch (err) {
        console.error("initPdfReader error:", err);
        showToast("Unable to display document: " + err.message, "error");
    }
}

async function renderReaderCurrentPage() {
    if (!state.reader.pdfDoc) return;

    try {
        const page = await state.reader.pdfDoc.getPage(state.reader.pageNum);
        const rotation = (page.rotate + state.reader.rotation) % 360;
        const unscaledViewport = page.getViewport({ scale: 1.0, rotation });

        const viewportContainer = document.getElementById("reader-viewport");
        const availableW = viewportContainer ? (viewportContainer.clientWidth - 48) : 760;
        const availableH = viewportContainer ? (viewportContainer.clientHeight - 48) : 900;

        // Handle auto-fit modes
        if (state.reader.fitMode === "width") {
            state.reader.scale = Math.max(0.3, Math.min(3.5, availableW / unscaledViewport.width));
        } else if (state.reader.fitMode === "page") {
            const scaleW = availableW / unscaledViewport.width;
            const scaleH = availableH / unscaledViewport.height;
            state.reader.scale = Math.max(0.3, Math.min(3.5, Math.min(scaleW, scaleH)));
        }

        const viewport = page.getViewport({ scale: state.reader.scale, rotation });

        const canvas = document.getElementById("reader-page-canvas");
        const wrapper = document.getElementById("reader-canvas-wrapper");
        if (!canvas || !wrapper) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        wrapper.style.width = `${Math.floor(viewport.width)}px`;
        wrapper.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        // Update toolbar indicators
        const badgeEl = document.getElementById("reader-page-badge");
        if (badgeEl) badgeEl.textContent = `${state.reader.pageNum} / ${state.reader.totalPages}`;

        const pageInput = document.getElementById("reader-page-input");
        if (pageInput) pageInput.value = state.reader.pageNum;

        const zoomEl = document.getElementById("reader-zoom-level");
        if (zoomEl) zoomEl.textContent = `${Math.round(state.reader.scale * 100)}%`;

        const prevBtn = document.getElementById("btn-reader-prev");
        const nextBtn = document.getElementById("btn-reader-next");
        if (prevBtn) prevBtn.disabled = state.reader.pageNum <= 1;
        if (nextBtn) nextBtn.disabled = state.reader.pageNum >= state.reader.totalPages;

        // Update active class in sidebar thumbnails
        document.querySelectorAll(".reader-thumb-card").forEach(card => {
            const p = parseInt(card.dataset.page, 10);
            if (p === state.reader.pageNum) {
                card.classList.add("active");
                card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                card.classList.remove("active");
            }
        });

    } catch (err) {
        console.error("renderReaderCurrentPage error:", err);
    }
}

async function renderReaderSidebarThumbnails() {
    const list = document.getElementById("reader-thumbnails-list");
    if (!list || !state.reader.pdfDoc) return;
    list.innerHTML = "";

    const total = state.reader.totalPages;

    for (let p = 1; p <= total; p++) {
        const card = document.createElement("div");
        card.className = `reader-thumb-card ${p === state.reader.pageNum ? "active" : ""}`;
        card.dataset.page = p;
        card.onclick = () => jumpToReaderPage(p);

        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.className = "reader-thumb-canvas";
        card.appendChild(thumbCanvas);

        const numSpan = document.createElement("span");
        numSpan.className = "reader-thumb-num";
        numSpan.textContent = `Page ${p}`;
        card.appendChild(numSpan);

        list.appendChild(card);

        // Render miniature thumbnail asynchronously
        state.reader.pdfDoc.getPage(p).then(pageObj => {
            const thumbViewport = pageObj.getViewport({ scale: 160 / pageObj.getViewport({ scale: 1.0 }).width });
            thumbCanvas.width = thumbViewport.width;
            thumbCanvas.height = thumbViewport.height;
            const tCtx = thumbCanvas.getContext("2d");
            pageObj.render({ canvasContext: tCtx, viewport: thumbViewport });
        }).catch(e => console.error("Thumbnail error:", e));
    }
}

function changeReaderPage(delta) {
    const target = state.reader.pageNum + delta;
    if (target >= 1 && target <= state.reader.totalPages) {
        state.reader.pageNum = target;
        renderReaderCurrentPage();
    }
}

function jumpToReaderPage(pageNum) {
    const target = parseInt(pageNum, 10);
    if (!isNaN(target) && target >= 1 && target <= state.reader.totalPages) {
        state.reader.pageNum = target;
        renderReaderCurrentPage();
    }
}

function zoomReader(deltaOrPreset) {
    if (deltaOrPreset === "reset") {
        state.reader.scale = 1.0;
        state.reader.fitMode = null;
    } else {
        state.reader.scale = Math.max(0.3, Math.min(3.5, state.reader.scale + deltaOrPreset));
        state.reader.fitMode = null;
    }
    renderReaderCurrentPage();
}

function fitReaderToWidth() {
    state.reader.fitMode = "width";
    renderReaderCurrentPage();
}

function fitReaderToPage() {
    state.reader.fitMode = "page";
    renderReaderCurrentPage();
}

function rotateReaderView() {
    state.reader.rotation = (state.reader.rotation + 90) % 360;
    renderReaderCurrentPage();
}

function toggleReaderSidebar() {
    const sidebar = document.getElementById("reader-sidebar");
    if (!sidebar) return;
    sidebar.classList.toggle("collapsed");
    state.reader.sidebarOpen = !sidebar.classList.contains("collapsed");

    // Adjust fit-to-width if active
    setTimeout(() => {
        if (state.reader.fitMode === "width" || state.reader.fitMode === "page") {
            renderReaderCurrentPage();
        }
    }, 260);
}

function printReaderDocument() {
    if (!state.reader.downloadUrl) {
        showToast("No document loaded to print", "error");
        return;
    }

    try {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        iframe.src = state.reader.downloadUrl;

        document.body.appendChild(iframe);
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => iframe.remove(), 1000);
            }, 300);
        };
    } catch (err) {
        console.error("Print error:", err);
        window.open(state.reader.downloadUrl, "_blank");
    }
}

function closePdfReader() {
    const readerStudio = document.getElementById("reader-studio");
    if (readerStudio) readerStudio.style.display = "none";

    if (state.selectedTool) {
        const wsLayout = document.querySelector(".workspace-layout");
        if (wsLayout) wsLayout.style.display = "grid";
    } else {
        backToHome();
    }
}

async function previewCurrentResultInReader() {
    if (!state.lastResultData || !state.lastResultData.downloadUrl) {
        showToast("No processed file available to preview", "error");
        return;
    }

    try {
        showProcessingModal();
        updateProcessingStep("Opening in Reader...", "Retrieving processed document stream", 40);

        const response = await fetch(state.lastResultData.downloadUrl);
        const rawBytes = await response.arrayBuffer();

        hideProcessingModal();
        await initPdfReader(rawBytes, state.lastResultData.filename, state.lastResultData.downloadUrl);
    } catch (err) {
        console.error("Preview failed:", err);
        hideProcessingModal();
        showToast("Could not preview document: " + err.message, "error");
    }
}

// -------------------------------------------------------------
// Real-Time Stamp & Watermark Visual Preview Logic
// -------------------------------------------------------------
async function initStampPreview(file) {
    const container = document.getElementById("stamp-preview-container");
    if (!container) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        state.stamp.rawBytes = arrayBuffer.slice(0);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        state.stamp.pdfDoc = await loadingTask.promise;
        state.stamp.totalPages = state.stamp.pdfDoc.numPages;
        state.stamp.pageNum = 1;

        // Hide dropzone and page canvas, show files list container & stamp preview container
        const dropzone = document.getElementById("dropzone");
        if (dropzone) dropzone.style.display = "none";
        document.getElementById("files-list-container").style.display = "block";
        document.getElementById("page-canvas-container").style.display = "none";
        container.style.display = "block";

        await renderStampPreviewPage();
    } catch (err) {
        console.error("Failed to load PDF for stamp preview:", err);
        showToast("Could not render PDF preview on canvas", "error");
    }
}

async function renderStampPreviewPage() {
    if (!state.stamp.pdfDoc) return;
    const canvas = document.getElementById("stamp-page-canvas");
    if (!canvas) return;

    const page = await state.stamp.pdfDoc.getPage(state.stamp.pageNum);
    
    // Calculate scale to fit comfortably in viewport (e.g. width ~ 450px)
    const viewportContainer = document.querySelector(".stamp-preview-viewport");
    const targetWidth = Math.min(480, (viewportContainer && viewportContainer.clientWidth ? viewportContainer.clientWidth - 48 : 450));
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / unscaledViewport.width;
    state.stamp.scale = scale;

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Update page indicator badge
    const badge = document.getElementById("stamp-page-badge");
    if (badge) {
        badge.textContent = `Page ${state.stamp.pageNum} of ${state.stamp.totalPages}`;
    }

    // Refresh overlay layer
    updateLiveStampOverlay();
}

function changeStampPreviewPage(delta) {
    if (!state.stamp.pdfDoc) return;
    const newPage = state.stamp.pageNum + delta;
    if (newPage < 1 || newPage > state.stamp.totalPages) return;
    state.stamp.pageNum = newPage;
    renderStampPreviewPage();
}

function updateLiveStampOverlay() {
    const overlay = document.getElementById("stamp-watermark-overlay");
    if (!overlay) return;

    const tool = state.selectedTool;
    if (!tool) return;

    if (tool.id === "watermark") {
        const text = state.options.text || "CONFIDENTIAL";
        const opacity = (parseInt(state.options.opacity || "70") / 100);
        const rotation = state.options.rotation === "0" ? 0 : -45;
        const color = state.options.font_color || "#e11d48";
        const baseSize = parseInt(state.options.font_size || "36");
        const scaledSize = Math.max(12, Math.round(baseSize * (state.stamp.scale || 0.8)));
        const vPos = state.options.vertical_position || "middle";
        const hPos = state.options.horizontal_position || "center";
        const isMosaic = state.options.mosaic === "1";

        if (isMosaic) {
            overlay.className = "stamp-watermark-overlay mosaic-mode";
            overlay.style.cssText = "";
            let mosaicHtml = "";
            for (let i = 0; i < 12; i++) {
                mosaicHtml += `<span class="mosaic-item" style="color: ${color}; opacity: ${opacity}; font-size: ${Math.max(10, Math.round(scaledSize * 0.65))}px;">${escapeHtml(text)}</span>`;
            }
            overlay.innerHTML = mosaicHtml;
            return;
        }

        overlay.className = "stamp-watermark-overlay";
        overlay.innerHTML = escapeHtml(text);

        // Position styles
        let top = "50%";
        let left = "50%";
        let transX = "-50%";
        let transY = "-50%";

        overlay.style.bottom = "auto";
        overlay.style.right = "auto";

        if (vPos === "top") {
            top = "24px";
            transY = "0";
        } else if (vPos === "bottom") {
            top = "auto";
            transY = "0";
            overlay.style.bottom = "24px";
        }

        if (hPos === "left") {
            left = "24px";
            transX = "0";
        } else if (hPos === "right") {
            left = "auto";
            transX = "0";
            overlay.style.right = "24px";
        }

        overlay.style.top = top;
        if (hPos !== "right") overlay.style.left = left;
        overlay.style.transform = `translate(${transX}, ${transY}) rotate(${rotation}deg)`;
        overlay.style.color = color;
        overlay.style.opacity = opacity;
        overlay.style.fontSize = `${scaledSize}px`;

    } else if (tool.id === "pagenumber") {
        overlay.className = "stamp-pagenumber-overlay";
        const fmt = state.options.format || "Page {n} of {nb}";
        const startNum = parseInt(state.options.starting_number || "1");
        const currentP = (state.stamp.pageNum - 1) + startNum;
        const totalP = (state.stamp.totalPages - 1) + startNum;
        const text = fmt.replace("{n}", currentP).replace("{nb}", totalP);
        overlay.innerHTML = escapeHtml(text);

        const vPos = state.options.vertical_position || "bottom";
        const hPos = state.options.horizontal_position || "right";
        const marginMap = { small: "12px", normal: "22px", big: "36px" };
        const m = marginMap[state.options.margin || "normal"] || "22px";
        const baseSize = parseInt(state.options.font_size || "14");
        const scaledSize = Math.max(10, Math.round(baseSize * (state.stamp.scale || 0.8)));

        let top = "auto";
        let bottom = "auto";
        let left = "auto";
        let right = "auto";
        let transX = "0";
        let transY = "0";

        if (vPos === "top") top = m;
        else bottom = m;

        if (hPos === "left") left = m;
        else if (hPos === "right") right = m;
        else {
            left = "50%";
            transX = "-50%";
        }

        overlay.style.top = top;
        overlay.style.bottom = bottom;
        overlay.style.left = left;
        overlay.style.right = right;
        overlay.style.transform = `translate(${transX}, ${transY})`;
        overlay.style.fontSize = `${scaledSize}px`;
        overlay.style.color = state.options.font_color || "#1e293b";
        overlay.style.opacity = "0.9";
    }
}

function setWatermarkText(val) {
    state.options.text = val;
    updateLiveStampOverlay();
}

function selectWatermarkPos(v, h, btn) {
    state.options.vertical_position = v;
    state.options.horizontal_position = h;
    document.querySelectorAll("#watermark-pos-grid .pos-cell").forEach(c => c.classList.remove("active"));
    if (btn) btn.classList.add("active");
    const label = document.getElementById("pos-display-label");
    if (label) {
        label.textContent = `${v.toUpperCase()} ${h.toUpperCase()}`;
    }
    updateLiveStampOverlay();
}

function selectWatermarkRotation(deg, btn) {
    state.options.rotation = deg;
    document.querySelectorAll(".rotation-pill").forEach(p => p.classList.remove("active"));
    if (btn) btn.classList.add("active");
    updateLiveStampOverlay();
}

function updateWatermarkOpacity(val) {
    state.options.opacity = val;
    const badge = document.getElementById("opacity-val-badge");
    if (badge) badge.textContent = `${val}%`;
    updateLiveStampOverlay();
}

function updateWatermarkFontSize(val) {
    state.options.font_size = val;
    const badge = document.getElementById("fontsize-val-badge");
    if (badge) badge.textContent = `${val}px`;
    updateLiveStampOverlay();
}

function selectWatermarkColor(color, btn) {
    state.options.font_color = color;
    document.querySelectorAll(".stamp-color-dot").forEach(d => d.classList.remove("active"));
    if (btn) btn.classList.add("active");
    updateLiveStampOverlay();
}

function toggleWatermarkMosaic(isChecked) {
    state.options.mosaic = isChecked ? "1" : "0";
    updateLiveStampOverlay();
}

function selectPageNumPos(v, h, btn) {
    state.options.vertical_position = v;
    state.options.horizontal_position = h;
    document.querySelectorAll("#pagenumber-pos-grid .pos-cell").forEach(c => c.classList.remove("active"));
    if (btn) btn.classList.add("active");
    const label = document.getElementById("pagenum-pos-label");
    if (label) {
        label.textContent = `${v.toUpperCase()} ${h.toUpperCase()}`;
    }
    updateLiveStampOverlay();
}

function updatePageNumFormat(fmt) {
    state.options.format = fmt;
    updateLiveStampOverlay();
}

function updatePageNumStart(num) {
    state.options.starting_number = num;
    updateLiveStampOverlay();
}

function updatePageNumMargin(margin) {
    state.options.margin = margin;
    updateLiveStampOverlay();
}

function updatePageNumSize(size) {
    state.options.font_size = size;
    const badge = document.getElementById("pagenum-size-badge");
    if (badge) badge.textContent = `${size}px`;
    updateLiveStampOverlay();
}

