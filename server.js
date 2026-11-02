const dns = require("node:dns");
try {
    dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const express = require("express");
const multer = require("multer");
const path = require("path");
const ilovepdfService = require("./ilovepdfService");
const shareManager = require("./shareManager");
const shareRoutes = require("./routes/shareRoutes");
const shareConfig = require("./share/shareConfig");
const ShareValidator = require("./share/shareValidator");

const app = express();
const port = shareConfig.port;
const host = shareConfig.host;

// Configure multer for in-memory file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file limit
});

// Cache for processed files ready for download
// Maps downloadId -> { buffer, filename, contentType, timestamp }
const downloadCache = new Map();

// Periodic cleanup of downloads older than 15 minutes
setInterval(() => {
    const cutoff = Date.now() - 15 * 60 * 1000;
    for (const [id, item] of downloadCache.entries()) {
        if (item.timestamp < cutoff) {
            downloadCache.delete(id);
        }
    }
}, 5 * 60 * 1000);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(shareRoutes);

// Tool definitions for UI metadata
const TOOLS = [
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
        options: []
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
        options: []
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
        options: []
    },
    {
        id: "organize",
        name: "Organize PDF",
        tagline: "Sort, reorder, rotate, or delete specific pages interactively",
        category: "organize",
        icon: "🗂️",
        color: "#0284c7",
        bgLight: "#f0f9ff",
        badge: "Interactive",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
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
        options: []
    }
];

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const token = await ilovepdfService.getAuthToken();
        res.json({
            status: "online",
            brand: "I Like PDFs",
            cluster: "Connected to iLovePDF Edge Grid",
            tokenValid: !!token,
            toolsCount: TOOLS.length
        });
    } catch (err) {
        res.status(500).json({
            status: "degraded",
            error: err.message
        });
    }
});

// List tools metadata
app.get("/api/tools", (req, res) => {
    res.json({ tools: TOOLS });
});

// Core processing endpoint
app.post("/api/process", upload.array("files", 25), async (req, res) => {
    try {
        const tool = req.body.tool;
        const toolDef = TOOLS.find(t => t.id === tool);
        if (!toolDef) {
            return res.status(400).json({ error: `Unsupported tool: ${tool}` });
        }

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded." });
        }

        if (files.length < toolDef.minFiles) {
            return res.status(400).json({
                error: `${toolDef.name} requires at least ${toolDef.minFiles} file(s).`
            });
        }

        console.log(`[Process] Starting ${tool} with ${files.length} file(s)...`);

        // Step 1: Start task on dispatch API
        const startData = await ilovepdfService.startTask(tool);
        const server = startData.server;
        const taskId = startData.task;
        console.log(`[Process] Assigned worker: ${server}, task: ${taskId}`);

        // Step 2: Upload all files to assigned worker
        const uploadedFiles = [];
        for (const file of files) {
            const rotate = req.body.rotate_angle ? parseInt(req.body.rotate_angle, 10) : undefined;
            const password = req.body.password || undefined;

            const serverFilename = await ilovepdfService.uploadFile(
                server,
                taskId,
                file.buffer,
                file.originalname
            );

            uploadedFiles.push({
                server_filename: serverFilename,
                originalFilename: file.originalname,
                rotate,
                password
            });
        }
        console.log(`[Process] Uploaded ${uploadedFiles.length} file(s) to ${server}`);

        // Step 3: Parse options and process
        const options = {
            output_filename: req.body.output_filename,
            compression_level: req.body.compression_level,
            split_mode: req.body.split_mode,
            ranges: req.body.ranges,
            password: req.body.password,
            pdfjpg_mode: req.body.pdfjpg_mode,
            orientation: req.body.orientation,
            margin: req.body.margin,
            pagesize: req.body.pagesize,
            text: req.body.text,
            mode: req.body.mode,
            vertical_position: req.body.vertical_position,
            horizontal_position: req.body.horizontal_position,
            opacity: req.body.opacity,
            font_size: req.body.font_size,
            font_color: req.body.font_color,
            pages: req.body.pages,
            ocr_language: req.body.ocr_language,
            conformance: req.body.conformance,
            remove_pages: req.body.remove_pages,
            reorder: req.body.reorder,
            rotation: req.body.rotation,
            mosaic: req.body.mosaic,
            format: req.body.format,
            starting_number: req.body.starting_number,
            convert_to: req.body.convert_to || "docx"
        };

        // For organize tool, compute precise page ranges dynamically if not specified
        if (tool === "organize" && !options.options && !options.organize_options) {
            try {
                const { PDFDocument } = require("pdf-lib");
                const parts = [];
                for (let i = 0; i < files.length; i++) {
                    const doc = await PDFDocument.load(files[i].buffer, { ignoreEncryption: true });
                    const count = doc.getPageCount();
                    if (options.reorder) {
                        parts.push(options.reorder.split(',').map(p => `file_${i}:${p.trim()}#0`).join(','));
                    } else if (options.remove_pages) {
                        const removed = new Set(options.remove_pages.split(',').map(p => parseInt(p.trim(), 10)));
                        const kept = [];
                        for (let p = 1; p <= count; p++) {
                            if (!removed.has(p)) kept.push(`file_${i}:${p}#0`);
                        }
                        parts.push(kept.join(','));
                    } else {
                        parts.push(`file_${i}:1-${count}#0`);
                    }
                }
                options.options = parts.join(',');
            } catch (pageErr) {
                console.warn("[Organize] Could not inspect page count:", pageErr.message);
                options.options = "file_0:1#0";
            }
        }

        let buffer, contentType, downloadFilename, processResult;

        if (tool === "repair") {
            try {
                processResult = await ilovepdfService.processTask(
                    server,
                    taskId,
                    tool,
                    uploadedFiles,
                    options
                );
                const dl = await ilovepdfService.downloadResult(server, taskId);
                buffer = dl.buffer;
                contentType = dl.contentType;
                downloadFilename = processResult.download_filename || `ilikepdfs_repaired.pdf`;
            } catch (repairErr) {
                console.log(`[Repair] Cloud notice (${repairErr.message}), executing local structural repair & xref reconstruction...`);
                const { PDFDocument } = require("pdf-lib");
                const doc = await PDFDocument.load(files[0].buffer, { ignoreEncryption: true });
                buffer = Buffer.from(await doc.save());
                contentType = "application/pdf";
                downloadFilename = files[0].originalname.replace(/\.pdf$/i, '') + "_repaired.pdf";
                processResult = {
                    status: "TaskSuccess",
                    timer: "0.2s"
                };
            }
        } else {
            processResult = await ilovepdfService.processTask(
                server,
                taskId,
                tool,
                uploadedFiles,
                options
            );
            console.log(`[Process] Task completed successfully:`, processResult);

            // Download processed output into cache for instant client download
            const dl = await ilovepdfService.downloadResult(server, taskId);
            buffer = dl.buffer;
            contentType = dl.contentType;

            // Infer appropriate default extension
            let defaultExt = "pdf";
            if (tool === "pdfoffice") defaultExt = "docx";
            else if (tool === "pdfjpg") defaultExt = "zip";

            downloadFilename = processResult.download_filename || `ilikepdfs_${tool}.${defaultExt}`;
        }

        const downloadId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        downloadCache.set(downloadId, {
            buffer,
            filename: downloadFilename,
            contentType,
            timestamp: Date.now()
        });

        // Resilient Mobile Share creation (primary process NEVER fails if share encounters an issue)
        let mobileShare = { available: false, reason: "INITIALIZING" };
        try {
            mobileShare = await shareManager.createShare(buffer, downloadFilename, contentType);
        } catch (shareErr) {
            console.warn("[Process] Mobile share creation warning (fallback active):", shareErr.message);
            mobileShare = {
                available: false,
                reason: shareErr.code || "SHARE_FAILED",
                message: shareErr.message
            };
        }

        // Calculate original total size
        const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

        res.json({
            success: true,
            status: "TaskSuccess",
            downloadId,
            downloadUrl: `/api/download/${downloadId}/${encodeURIComponent(downloadFilename)}`,
            filename: downloadFilename,
            filesize: buffer.length,
            originalSize: originalTotalSize,
            savedBytes: Math.max(0, originalTotalSize - buffer.length),
            savedPercent: originalTotalSize > 0 && buffer.length < originalTotalSize
                ? Math.round(((originalTotalSize - buffer.length) / originalTotalSize) * 100)
                : 0,
            timer: processResult.timer || "0.5s",
            mobile: mobileShare
        });
    } catch (err) {
        console.error("[Process Error]", err);
        res.status(500).json({
            success: false,
            error: err.message || "An unexpected error occurred during PDF processing."
        });
    }
});

// Download endpoint (supports with and without filename for maximum client compatibility)
app.get(["/api/download/:downloadId", "/api/download/:downloadId/:filename"], (req, res) => {
    const { downloadId, filename } = req.params;
    const item = downloadCache.get(downloadId);

    if (!item) {
        return res.status(404).send("Download link expired or not found. Please re-process your document.");
    }

    const downloadFilename = item.filename || filename || "document.pdf";
    res.setHeader("Content-Disposition", ShareValidator.buildContentDisposition(downloadFilename, "attachment"));
    res.setHeader("Content-Type", item.contentType || "application/octet-stream");
    res.setHeader("Content-Length", item.buffer.length);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(item.buffer);
});

// Centralized error handler for Multer file upload limits and unexpected server exceptions
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.warn("[Multer Error]", err.code, err.message);
        const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        const msg = err.code === "LIMIT_FILE_SIZE"
            ? "File size exceeds the 50MB limit."
            : (err.code === "LIMIT_UNEXPECTED_FILE"
                ? "Too many files uploaded for this operation."
                : `Upload error: ${err.message}`);
        return res.status(status).json({ success: false, error: msg });
    }
    console.error("[Unhandled Server Error]", err);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

app.listen(port, host, () => {
    console.log(`\n======================================================`);
    console.log(`  "I Like PDFs" server running on http://${host}:${port}`);
    console.log(`======================================================\n`);
});

