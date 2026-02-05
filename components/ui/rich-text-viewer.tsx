
"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { cn } from "@/lib/utils";
import { LexicalTheme } from "./lexical-theme";

import { ImageNode } from "./image-node";

interface RichTextViewerProps {
    value: string; // JSON string from editor
    className?: string;
}

export function RichTextViewer({ value, className }: RichTextViewerProps) {
    if (!value) return null;

    const ensureRichTextState = (text: string): string => {
        try {
            const json = JSON.parse(text);

            // Handle double-stringified JSON (common DB issue)
            if (typeof json === 'string') {
                try {
                    const innerJson = JSON.parse(json);
                    if (innerJson && innerJson.root) {
                        return json; // Return the inner string which is the valid Lexical state
                    }
                } catch (e) {
                    // Inner text is not JSON, proceed
                }
            }

            if (json && json.root) return text;
        } catch (e) {
            // Not JSON
        }
        return JSON.stringify({
            root: {
                children: [
                    {
                        children: [
                            {
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: text,
                                type: "text",
                                version: 1,
                            },
                        ],
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

    const initialConfig = {
        namespace: "MyEditor",
        theme: LexicalTheme,
        onError(error: Error) {
            console.error(error);
        },
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
            ImageNode,
            HorizontalRuleNode,
        ],
        editable: false, // Read-only mode
        editorState: ensureRichTextState(value),
    };

    return (
        <div className={cn("relative", className)}>
            <LexicalComposer initialConfig={initialConfig}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className="outline-none prose prose-slate dark:prose-invert max-w-none prose-a:text-[#0A57D0]" />
                    }
                    placeholder={null}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <ListPlugin />
                <LinkPlugin />

                <ClickableLinkPlugin />
                <TablePlugin />
                <HorizontalRulePlugin />
                <TabIndentationPlugin />
            </LexicalComposer>
        </div>
    );
}
