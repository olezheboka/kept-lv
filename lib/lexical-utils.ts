
export const ensureRichTextState = (text: string | null | undefined): string => {
    if (text) {
        try {
            const json = JSON.parse(text);
            if (json.root) return text; // It's likely valid Lexical JSON
        } catch {
            // Not JSON, fall back
        }
    }

    // Convert plain text (or empty) to simple Lexical paragraph
    return JSON.stringify({
        root: {
            children: [
                {
                    children: text ? [
                        {
                            detail: 0,
                            format: 0,
                            mode: "normal",
                            style: "",
                            text: text,
                            type: "text",
                            version: 1,
                        },
                    ] : [],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
        },
    });
};

export const getPlainTextFromLexical = (jsonString: string | null | undefined): string => {
    if (!jsonString) return "";

    try {
        const json = JSON.parse(jsonString);
        if (!json.root) return jsonString; // Fallback if plain text

        interface LexicalNode {
            text?: string;
            children?: LexicalNode[];
        }

        const extractText = (node: LexicalNode): string => {
            if (node.text) return node.text;
            if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractText).join("");
            }
            return "";
        };

        return extractText(json.root);
    } catch {
        return jsonString || ""; // Return raw if parse fails
    }
};
