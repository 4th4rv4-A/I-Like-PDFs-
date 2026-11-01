const dns = require("node:dns");
try {
    dns.setDefaultResultOrder("ipv4first");
} catch (e) {
    // Older node versions ignore
}

// ilovepdfService.js - Core reverse engineered client for iLovePDF cluster

class ILovePdfService {
    constructor() {
        this.cachedToken = null;
        this.tokenExpiry = 0;
        this.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    }

    /**
     * Extracts an active public JWT token from the web frontend
     */
    async getAuthToken(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && this.cachedToken && this.tokenExpiry > now) {
            return this.cachedToken;
        }

        let lastErr = null;
        // Try multiple endpoints if one throttles or times out
        const endpoints = [
            "https://www.ilovepdf.com/compress_pdf",
            "https://www.ilovepdf.com/merge_pdf",
            "https://www.ilovepdf.com/"
        ];

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 7000);

                const res = await fetch(url, {
                    headers: { "User-Agent": this.userAgent },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!res.ok) continue;
                const html = await res.text();
                const match = html.match(/var ilovepdfConfig = (\{.*?\});/);
                if (!match) continue;

                const config = JSON.parse(match[1]);
                if (config.token) {
                    this.cachedToken = config.token;
                    // Cache token for 50 minutes
                    this.tokenExpiry = now + (50 * 60 * 1000);
                    return this.cachedToken;
                }
            } catch (err) {
                lastErr = err;
            }
        }

        if (this.cachedToken) {
            // Return stale token if available
            return this.cachedToken;
        }

        console.error("[ILovePdfService] Error getting auth token:", lastErr);
        throw new Error(`Authentication token error: ${lastErr ? lastErr.message : 'Unknown error'}`);
    }

    /**
     * Initializes a task on the dispatch API
     */
    async startTask(tool) {
        const token = await this.getAuthToken();
        const res = await fetch(`https://api.ilovepdf.com/v1/start/${tool}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "User-Agent": this.userAgent
            }
        });

        if (!res.ok) {
            // If token expired, retry once with fresh token
            if (res.status === 401 || res.status === 403) {
                const freshToken = await this.getAuthToken(true);
                const retryRes = await fetch(`https://api.ilovepdf.com/v1/start/${tool}`, {
                    headers: {
                        "Authorization": `Bearer ${freshToken}`,
                        "Accept": "application/json",
                        "User-Agent": this.userAgent
                    }
                });
                if (!retryRes.ok) {
                    const errText = await retryRes.text();
                    throw new Error(`Start task failed (${retryRes.status}): ${errText}`);
                }
                return await retryRes.json();
            }
            const errText = await res.text();
            throw new Error(`Start task failed (${res.status}): ${errText}`);
        }

        return await res.json();
    }

    /**
     * Generates a security payload required for processing
     */
    async getSecurityPayload(tool) {
        const url = `https://www.ilovepdf.com/b/gensp/${tool}?ts=${Date.now()}`;
        const res = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": this.userAgent
            }
        });
        if (!res.ok) {
            throw new Error(`Failed to generate security payload: HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.payload;
    }

    /**
     * Uploads a file buffer to the assigned worker server
     */
    async uploadFile(server, taskId, fileBuffer, originalFilename) {
        const token = await this.getAuthToken();
        const formData = new FormData();
        formData.append("task", taskId);
        const blob = new Blob([fileBuffer], { type: "application/octet-stream" });
        formData.append("file", blob, originalFilename);

        const res = await fetch(`https://${server}/v1/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "User-Agent": this.userAgent
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`File upload to ${server} failed (${res.status}): ${err}`);
        }

        const data = await res.json();
        return data.server_filename;
    }

    /**
     * Triggers tool processing on the assigned worker
     */
    async processTask(server, taskId, tool, uploadedFiles, options = {}) {
        const token = await this.getAuthToken();
        const spPayload = await this.getSecurityPayload(tool);

        const formData = new FormData();
        formData.append("task", taskId);
        formData.append("tool", tool);
        formData.append("sp", spPayload);

        // Append file entries
        uploadedFiles.forEach((file, idx) => {
            formData.append(`files[${idx}][server_filename]`, file.server_filename);
            formData.append(`files[${idx}][filename]`, file.originalFilename || `file_${idx + 1}.pdf`);
            if (file.rotate !== undefined) {
                formData.append(`files[${idx}][rotate]`, String(file.rotate));
            }
            if (file.password) {
                formData.append(`files[${idx}][password]`, file.password);
            }
        });

        // Output filename
        if (options.output_filename) {
            formData.append("output_filename", options.output_filename);
        } else {
            formData.append("output_filename", `ilikepdfs_${tool}`);
        }

        // Tool-specific options
        if (tool === "compress") {
            const level = options.compression_level || "recommended";
            formData.append("compression_level", level);
        } else if (tool === "split") {
            const mode = options.split_mode || "ranges";
            formData.append("split_mode", mode);
            if (options.ranges) {
                formData.append("ranges", options.ranges);
            }
        } else if (tool === "protect") {
            if (!options.password) throw new Error("Password is required to protect PDF");
            formData.append("password", options.password);
        } else if (tool === "unlock") {
            if (options.password) {
                formData.append("password", options.password);
            }
        } else if (tool === "pdfjpg") {
            formData.append("pdfjpg_mode", options.pdfjpg_mode || "pages");
            if (options.dpi) formData.append("dpi", String(options.dpi));
        } else if (tool === "imagepdf") {
            formData.append("orientation", options.orientation || "portrait");
            formData.append("margin", options.margin || "0");
            formData.append("pagesize", options.pagesize || "fit");
            formData.append("merge_after", "1");
        } else if (tool === "watermark") {
            formData.append("mode", options.mode || "text");
            formData.append("text", options.text || "CONFIDENTIAL");
            formData.append("pages", options.pages || "all");
            formData.append("vertical_position", options.vertical_position || "middle");
            formData.append("horizontal_position", options.horizontal_position || "center");
            formData.append("font_size", String(options.font_size || "36"));
            formData.append("opacity", String(options.opacity || "70"));
            if (options.font_color) formData.append("font_color", options.font_color);
            if (options.rotation !== undefined) formData.append("rotation", String(options.rotation));
            if (options.mosaic) formData.append("mosaic", String(options.mosaic));
        } else if (tool === "pagenumber") {
            formData.append("facing_pages", "0");
            formData.append("pages", options.pages || "all");
            formData.append("vertical_position", options.vertical_position || "bottom");
            formData.append("horizontal_position", options.horizontal_position || "right");
            if (options.format) formData.append("format", options.format);
            if (options.starting_number) formData.append("starting_number", String(options.starting_number));
            if (options.margin) formData.append("margin", options.margin);
            if (options.font_size) formData.append("font_size", String(options.font_size));
            if (options.font_color) formData.append("font_color", options.font_color);
        } else if (tool === "pdfocr") {
            formData.append("ocr_language", options.ocr_language || "eng");
        } else if (tool === "pdfa") {
            formData.append("conformance", options.conformance || "pdfa-2b");
        } else if (tool === "pdfoffice") {
            formData.append("convert_to", options.convert_to || "docx");
        } else if (tool === "officepdf") {
            // officepdf accepts word, excel, powerpoint and converts to pdf
        } else if (tool === "organize") {
            const filesMap = {};
            uploadedFiles.forEach((file, idx) => {
                filesMap[`file_${idx}`] = file.server_filename;
            });
            formData.append("files_organize", options.files_organize || JSON.stringify(filesMap));

            let seq = "";
            if (options.reorder) {
                seq = options.reorder.split(",").map(p => `file_0:${p.trim()}#0`).join(",");
            } else if (options.organize_options || options.options) {
                seq = options.organize_options || options.options;
            } else {
                seq = Object.keys(filesMap).map(k => `${k}:1-end#0`).join(",");
            }
            formData.append("options", seq);
            if (options.remove_pages) formData.append("remove_pages", options.remove_pages);
            if (options.reorder) formData.append("reorder", options.reorder);
        }

        const res = await fetch(`https://${server}/v1/process`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "User-Agent": this.userAgent
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Process failed (${res.status}): ${err}`);
        }

        const result = await res.json();

        // If asynchronous task, poll until ready
        if (result.status === "TaskProcessing" || result.status === "TaskWaiting") {
            return await this.pollTask(server, taskId, token);
        }

        return result;
    }

    /**
     * Polls task status until TaskSuccess or failure
     */
    async pollTask(server, taskId, token, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 1500));
            const res = await fetch(`https://${server}/v1/task/${taskId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "User-Agent": this.userAgent
                }
            });

            if (!res.ok) continue;
            const data = await res.json();
            if (data.status === "TaskSuccess") {
                return data;
            }
            if (data.status === "TaskError") {
                throw new Error(`Processing error: ${data.status_message || "Task failed"}`);
            }
        }
        throw new Error("Task processing timed out");
    }

    /**
     * Downloads the final processed file bytes
     */
    async downloadResult(server, taskId) {
        const token = await this.getAuthToken();
        const res = await fetch(`https://${server}/v1/download/${taskId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "User-Agent": this.userAgent
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to download result (${res.status})`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "application/pdf";
        return {
            buffer: Buffer.from(arrayBuffer),
            contentType
        };
    }
}

module.exports = new ILovePdfService();
