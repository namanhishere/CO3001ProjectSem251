import Express from "express";

export abstract class MaterialAbstract {
    abstract getIcon(): string;
    abstract getDisplayName(): string;
    abstract getInternalCallname(): string;
    abstract getClientCreateForm(): string;
    abstract getClientCreateTrigger(): string;
    abstract getDisplayComponent(materialInfo:any): string;
    abstract getRouter(): Express.Router;
}

export class MaterialManager {
    private static instance: MaterialManager;
    private materials: Map<string, MaterialAbstract> = new Map();

    private constructor() { }

    public static getInstance(): MaterialManager {
        if (!MaterialManager.instance) {
            MaterialManager.instance = new MaterialManager();
        }
        return MaterialManager.instance;
    }

    public registerMaterial(material: MaterialAbstract): void {
        if (this.materials.has(material.getInternalCallname())) {
            console.warn(`Material with callname "${material.getInternalCallname()}" is already registered.`);
            return;
        }
        this.materials.set(material.getInternalCallname(), material);
    }

    public getMaterial(internalCallname: string): MaterialAbstract | undefined {
        return this.materials.get(internalCallname);
    }

    public getAllMaterials(): MaterialAbstract[] {
        return Array.from(this.materials.values());
    }
}// Assuming MaterialAbstract is in a separate file

export class TextMaterial extends MaterialAbstract {
    getIcon(): string {
        // Returns a class name for a font icon, or a path to an image
        return "fas fa-font";
    }

    getDisplayName(): string {
        return "Text";
    }

    getInternalCallname(): string {
        return "text_material";
    }

    getClientCreateForm(): string {
        // Returns an HTML string for the creation form
        return `
            <div class="form-group">
                <label for="text-content">Content</label>
                <textarea class="form-control" id="text-content" name="content" rows="3"></textarea>
            </div>
        `;
    }

    getClientCreateTrigger(): string {
        // A JavaScript function call to open a modal or navigate
        return "openMaterialCreationModal('text_material')";
    }

    /**
     * Generates the HTML to display the text material.
     * @param materialInfo An object expected to have a 'content' property.
     * @returns An HTML string.
     */
    getDisplayComponent(materialInfo: { content: string }): string {
        // Basic sanitization to prevent HTML injection
        const escapeHtml = (unsafe: string) => {
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        }

        const content = materialInfo.content || "No content provided.";
        return `<p>${escapeHtml(content)}</p>`;
    }

    getRouter(): Express.Router {
        const router = Express.Router();
        router.post('/create', (req, res) => {
            // Logic to create and save a new text material
            const { content } = req.body;
            console.log("Creating text material with content:", content);
            res.json({ success: true, message: "Text material created.", data: { content } });
        });
        return router;
    }
}

export class UrlMaterial extends MaterialAbstract {
    getIcon(): string {
        return "fas fa-link";
    }

    getDisplayName(): string {
        return "URL / Link";
    }

    getInternalCallname(): string {
        return "url_material";
    }

    getClientCreateForm(): string {
        return `
            <div class="form-group">
                <label for="url-link">Link URL</label>
                <input type="url" class="form-control" id="url-link" name="url" placeholder="https://example.com">
            </div>
            <div class="form-group">
                <label for="url-display-text">Display Text (Optional)</label>
                <input type="text" class="form-control" id="url-display-text" name="displayText" placeholder="Click here!">
            </div>
        `;
    }

    getClientCreateTrigger(): string {
        return "openMaterialCreationModal('url_material')";
    }

    /**
     * Generates the HTML to display the URL material as a clickable link.
     * @param materialInfo An object expected to have a 'url' and optional 'displayText' property.
     * @returns An HTML string.
     */
    getDisplayComponent(materialInfo: { url: string, displayText?: string }): string {
        if (!materialInfo || !materialInfo.url) {
            return `<p class="text-danger">Invalid URL data provided.</p>`;
        }

        const displayText = materialInfo.displayText || materialInfo.url;
        // Basic validation for URL
        try {
            const validUrl = new URL(materialInfo.url);
            return `<a href="${validUrl.href}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
        } catch (error) {
            return `<p class="text-danger">Invalid URL: ${materialInfo.url}</p>`;
        }
    }

    getRouter(): Express.Router {
        const router = Express.Router();
        router.post('/create', (req, res) => {
            // Logic to create and save a new URL material
            const { url, displayText } = req.body;
            console.log(`Creating URL material with URL: ${url} and Display Text: ${displayText}`);
            res.json({ success: true, message: "URL material created.", data: { url, displayText } });
        });
        return router;
    }
}

//chỗ này sẽ viết thêm 1 cái cho quiz nhưng mà từ từ viết sau.