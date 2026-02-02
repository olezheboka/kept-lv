
"use client";

import { useEffect, useState, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getNearestNodeOfType } from "@lexical/utils";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, $isListNode } from "@lexical/list";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";

import { CodeHighlightNode, CodeNode, $createCodeNode, $isCodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HorizontalRuleNode, INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ImageNode, $createImageNode, ImagePayload } from "./image-node";
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    $isTextNode,
    $createParagraphNode,
    LexicalCommand,
    createCommand,
    $insertNodes,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from "lexical";

import { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $setBlocksType, $patchStyleText } from "@lexical/selection";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo,
    Redo,
    Subscript,
    Superscript,
    Minus,
    Image as ImageIcon,
    ChevronDown,
    Baseline,
    Link as LinkIcon,
    Check,
    X,
    Eraser,
    FileCode,
    Indent,
    Outdent,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LexicalTheme } from "./lexical-theme";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// --- Commands ---
export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand("INSERT_IMAGE_COMMAND");


// --- Plugins & Toolbar ---

const ToolbarButton = ({
    onClick,
    isActive,
    isDisabled,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    children: React.ReactNode;
    title: string;
}) => (
    <button
        disabled={isDisabled}
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        className={cn(
            "p-1.5 rounded transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
            isActive ? "bg-muted text-primary" : "text-muted-foreground"
        )}
        title={title}
        type="button"
    >
        {children}
    </button>
);

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkTargetBlank, setLinkTargetBlank] = useState(false);

    // Image State
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [imageWidth, setImageWidth] = useState("");
    const [imageHeight, setImageHeight] = useState("");
    const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);

    // Block Type State
    const [blockType, setBlockType] = useState("paragraph");

    const updateToolbar = () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsCode(selection.hasFormat("code"));
            setIsSubscript(selection.hasFormat("subscript"));
            setIsSuperscript(selection.hasFormat("superscript"));

            // Check for link
            const node = selection.anchor.getNode();
            const parent = node.getParent();
            const isLinkNode = $isLinkNode(parent) || $isLinkNode(node);
            setIsLink(isLinkNode);

            if (isLinkNode) {
                const linkNode = ($isLinkNode(parent) ? parent : node) as LinkNode;
                setLinkUrl(linkNode.getURL());
                setLinkTargetBlank(linkNode.getTarget() === "_blank");
            } else {
                setLinkUrl("");
                setLinkTargetBlank(false);
            }

            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === "root"
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
                    const type = parentList ? parentList.getTag() : element.getTag();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    setBlockType(type);
                }
            }
        }
    };

    useEffect(() => {
        return editor.registerCommand(
            CAN_UNDO_COMMAND,
            (payload) => {
                setCanUndo(payload);
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setCanRedo(payload);
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor]);

    // Image Plugin Registration
    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error("ImageNode: ImageNode not registered on editor");
        }
        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload: ImagePayload) => {
                const imageNode = $createImageNode(payload);
                $insertNodes([imageNode]);
                if ($isRangeSelection($getSelection())) {
                    // $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                }
                return true;
            },
            COMMAND_PRIORITY_CRITICAL
        );
    }, [editor]);

    // Helpers
    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
        setBlockType("paragraph");
    };

    const formatHeading = (headingLevel: "h1" | "h2" | "h3") => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingLevel));
            }
        });
        setBlockType(headingLevel);
    };

    const formatBulletList = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };

    const formatNumberedList = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    };

    const indentContent = () => {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    };

    const outdentContent = () => {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    };


    const toggleQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (blockType === 'quote') {
                    $setBlocksType(selection, () => $createParagraphNode());
                    setBlockType("paragraph");
                } else {
                    $setBlocksType(selection, () => $createQuoteNode());
                    setBlockType("quote");
                }
            }
        });
    };

    const toggleCodeBlock = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (blockType === 'code') {
                    $setBlocksType(selection, () => $createParagraphNode());
                    setBlockType("paragraph");
                } else {
                    $setBlocksType(selection, () => $createCodeNode());
                    setBlockType("code");
                }
            }
        });
    };

    const clearFormatting = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                nodes.forEach((node) => {
                    if ($isTextNode(node)) {
                        node.setFormat(0);
                        node.setStyle('');
                    }
                });
                // Remove Links
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);

                // Reset Block type to paragraph
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
        setBlockType("paragraph");
    };

    const insertHorizontalRule = () => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    };

    const insertLink = () => {
        if (!linkUrl) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            return;
        }
        // Validate URL protocol
        const validUrl = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: validUrl, target: linkTargetBlank ? "_blank" : undefined });
    };

    const insertImage = () => {
        if (!imageUrl) return;

        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: imageUrl,
            altText: imageAlt,
            width: imageWidth ? parseInt(imageWidth) : undefined,
            height: imageHeight ? parseInt(imageHeight) : undefined,
        });

        // Reset and close
        setImageUrl("");
        setImageAlt("");
        setImageWidth("");
        setImageHeight("");
        setIsImagePopoverOpen(false);
    };

    // Helper for Text Color / Bg
    const applyStyleText = (styles: Record<string, string>) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, styles);
            }
        });
    };

    const textColorOptions = ["#000000", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#6b7280", "#9ca3af", "#ffffff"];
    const bgColorOptions = ["transparent", "#fecaca", "#bbf7d0", "#bfdbfe", "#fef08a", "#f3f4f6", "#e5e7eb", "#000000"];

    // Moved ToolbarButton outside

    const blockTypeMap: Record<string, string> = {
        "paragraph": "Normal",
        "h1": "Heading 1",
        "h2": "Heading 2",
        "h3": "Heading 3",
        "ul": "Bullet List",
        "ol": "Numbered List",
        "quote": "Quote",
        "code": "Code Block",
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/20">
            <ToolbarButton
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                isDisabled={!canUndo}
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => {
                    editor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                isDisabled={!canRedo}
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Heading Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 h-7 px-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded transition-colors" title="Formatting">
                        {blockTypeMap[blockType] || "Normal"}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={formatParagraph} className={cn(blockType === "paragraph" && "bg-accent")}>
                        <span className="text-sm">Normal</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatHeading("h1")} className={cn(blockType === "h1" && "bg-accent")}>
                        <Heading1 className="w-4 h-4 mr-2" />
                        <span className="text-xl font-bold">Heading 1</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatHeading("h2")} className={cn(blockType === "h2" && "bg-accent")}>
                        <Heading2 className="w-4 h-4 mr-2" />
                        <span className="text-lg font-bold">Heading 2</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatHeading("h3")} className={cn(blockType === "h3" && "bg-accent")}>
                        <Heading3 className="w-4 h-4 mr-2" />
                        <span className="text-base font-bold">Heading 3</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Colors Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center p-1.5 rounded transition-colors hover:bg-muted text-muted-foreground" title="Colors">
                        <Baseline className="w-4 h-4" />
                        <ChevronDown className="w-3 h-3 ml-0.5 opacity-50" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-3">
                    <div className="mb-2">
                        <span className="text-xs font-semibold text-muted-foreground mb-1 block">Text Color</span>
                        <div className="flex flex-wrap gap-1">
                            {textColorOptions.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className="w-6 h-6 rounded-md border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => applyStyleText({ color })}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="mt-2">
                        <span className="text-xs font-semibold text-muted-foreground mb-1 block">Highlight</span>
                        <div className="flex flex-wrap gap-1">
                            {bgColorOptions.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn("w-6 h-6 rounded-md border border-gray-200 cursor-pointer hover:scale-110 transition-transform", color === "transparent" && "relative overflow-hidden")}
                                    style={{ backgroundColor: color }}
                                    onClick={() => applyStyleText({ 'background-color': color })}
                                    title={color}
                                >
                                    {color === "transparent" && (
                                        <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs pointer-events-none">\</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Inline Text Styling */}
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                isActive={isBold}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                isActive={isItalic}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                isActive={isUnderline}
                title="Underline"
            >
                <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                isActive={isStrikethrough}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
                isActive={isSubscript}
                title="Subscript"
            >
                <Subscript className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
                isActive={isSuperscript}
                title="Superscript"
            >
                <Superscript className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Link */}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            "p-1.5 rounded transition-colors hover:bg-muted",
                            isLink ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                        title="Insert Link"
                        type="button"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Input
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 h-8 text-sm"
                                autoComplete="off"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        insertLink();
                                    }
                                }}
                            />
                            <Button onClick={() => insertLink()} size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Check className="w-4 h-4" />
                            </Button>
                            {isLink && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() => {
                                        setLinkUrl("");
                                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                                    }}
                                    title="Remove Link"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="link-target"
                                checked={linkTargetBlank}
                                onCheckedChange={(checked) => setLinkTargetBlank(!!checked)}
                            />
                            <Label htmlFor="link-target" className="text-xs">Open in new tab</Label>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Horizontal Rule */}
            <ToolbarButton onClick={insertHorizontalRule} title="Horizontal Rule">
                <Minus className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Group: Inline Code, Quote, Code Block */}
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                isActive={isCode}
                title="Inline Code"
            >
                <Code className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={toggleQuote}
                isActive={blockType === "quote"}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={toggleCodeBlock}
                isActive={blockType === "code"}
                title="Code Block"
            >
                <FileCode className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Lists */}
            <ToolbarButton onClick={formatBulletList} title="Bullet List">
                <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={formatNumberedList} title="Numbered List">
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={outdentContent} title="Outdent">
                <Outdent className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={indentContent} title="Indent">
                <Indent className="w-4 h-4" />
            </ToolbarButton>


            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Alignment */}
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
                title="Align Left"
            >
                <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
                title="Align Center"
            >
                <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
                title="Align Right"
            >
                <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
                title="Justify"
            >
                <AlignJustify className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Image Button with Popover */}
            <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                <PopoverTrigger asChild>
                    <button
                        className="p-1.5 rounded transition-colors hover:bg-muted text-muted-foreground"
                        title="Insert Image"
                        type="button"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-3">
                        <h4 className="font-medium leading-none">Insert Image</h4>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label htmlFor="img-url" className="text-right text-xs">URL</Label>
                                <Input
                                    id="img-url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="col-span-2 h-8"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label htmlFor="img-alt" className="text-right text-xs">Alt Text</Label>
                                <Input
                                    id="img-alt"
                                    value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    className="col-span-2 h-8"
                                    placeholder="Description"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label htmlFor="img-width" className="text-right text-xs">Width (px)</Label>
                                <Input
                                    id="img-width"
                                    type="number"
                                    value={imageWidth}
                                    onChange={(e) => setImageWidth(e.target.value)}
                                    className="col-span-2 h-8"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-2">
                                <Label htmlFor="img-height" className="text-right text-xs">Height (px)</Label>
                                <Input
                                    id="img-height"
                                    type="number"
                                    value={imageHeight}
                                    onChange={(e) => setImageHeight(e.target.value)}
                                    className="col-span-2 h-8"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <Button onClick={insertImage} className="w-full" size="sm">
                            Insert Image
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="w-[1px] h-6 bg-border mx-1" />

            {/* Clear Formatting - Always last */}
            <ToolbarButton onClick={clearFormatting} title="Clear Formatting">
                <Eraser className="w-4 h-4" />
            </ToolbarButton>

        </div>
    );
}

// --- Main Component ---

interface RichTextEditorProps {
    value?: string; // JSON string
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // Additional classes for the container
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Start typing...",
    className,
}: RichTextEditorProps) {
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
            HorizontalRuleNode,
            ImageNode, // Registered ImageNode
        ],
        editorState: value || undefined, // Load initial state if present
    };

    return (
        <div className={cn("rounded-md border border-input shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden bg-background", className)}>
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="min-h-[150px] p-4 outline-none prose prose-slate dark:prose-invert max-w-none" />
                        }
                        placeholder={
                            <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <HorizontalRulePlugin />
                    <TabIndentationPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

                    <OnChangePlugin
                        onChange={(editorState) => {
                            const jsonString = JSON.stringify(editorState.toJSON());
                            onChange(jsonString);
                        }}
                    />
                </div>
            </LexicalComposer>
        </div>
    );
}
