
import {
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from "lexical";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
} from "lexical";

export interface ImagePayload {
    altText: string;
    height?: number;
    key?: NodeKey;
    maxWidth?: number;
    src: string;
    width?: number;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLImageElement) {
        const { alt: altText, src, width, height } = domNode;
        const node = $createImageNode({ altText, height, src, width });
        return { node };
    }
    return null;
}

export type SerializedImageNode = Spread<
    {
        altText: string;
        height?: number;
        maxWidth?: number;
        src: string;
        width?: number;
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.JSX.Element> {
    __src: string;
    __altText: string;
    __width: "inherit" | number;
    __height: "inherit" | number;
    __maxWidth: number;

    static getType(): string {
        return "image";
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__maxWidth,
            node.__width,
            node.__height,
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, maxWidth, src } = serializedNode;
        return $createImageNode({
            altText,
            height,
            maxWidth,
            src,
            width,
        });
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("img");
        element.setAttribute("src", this.__src);
        element.setAttribute("alt", this.__altText);
        if (this.__width) {
            element.setAttribute("width", this.__width.toString());
        }
        if (this.__height) {
            element.setAttribute("height", this.__height.toString());
        }
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: (node: Node) => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }

    constructor(
        src: string,
        altText: string,
        maxWidth: number,
        width?: "inherit" | number,
        height?: "inherit" | number,
        key?: NodeKey
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width || "inherit";
        this.__height = height || "inherit";
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.__altText,
            height: this.__height === "inherit" ? 0 : this.__height,
            maxWidth: this.__maxWidth,
            src: this.__src,
            type: "image",
            version: 1,
            width: this.__width === "inherit" ? 0 : this.__width,
        };
    }

    setWidthAndHeight(
        width: "inherit" | number,
        height: "inherit" | number
    ): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement("span");
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    decorate(): React.JSX.Element {
        return (
            <ImageComponent
                src={this.__src}
                altText={this.__altText}
                width={this.__width}
                height={this.__height}
                maxWidth={this.__maxWidth}
                nodeKey={this.getKey()}
            />
        );
    }
}

export function $createImageNode({
    altText,
    height,
    maxWidth = 500,
    src,
    width,
}: ImagePayload): ImageNode {
    return new ImageNode(
        src,
        altText,
        maxWidth,
        width,
        height,
    );
}

export function $isImageNode(
    node: LexicalNode | null | undefined
): node is ImageNode {
    return node instanceof ImageNode;
}

function ImageComponent({
    src,
    altText,
    nodeKey,
    width,
    height,
    maxWidth,
}: {
    src: string;
    altText: string;
    nodeKey: NodeKey;
    width: "inherit" | number;
    height: "inherit" | number;
    maxWidth: number;
}) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = React.useState(false);
    const imageRef = React.useRef<HTMLImageElement>(null);

    const onDelete = React.useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                    node.remove();
                }
            }
            return false;
        },
        [isSelected, nodeKey]
    );

    React.useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CLICK_COMMAND,
                (event: MouseEvent) => {
                    if (event.target === imageRef.current) {
                        if (!event.shiftKey) {
                            clearSelection();
                        }
                        setSelected(!isSelected);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW
            )
        );
    }, [clearSelection, editor, isSelected, onDelete, setSelected]);

    return (
        <div className={isSelected ? "ring-2 ring-primary rounded-md inline-block relative" : "inline-block relative"}>
            <img
                ref={imageRef}
                src={src}
                alt={altText}
                style={{
                    height: height === "inherit" ? "auto" : height,
                    width: width === "inherit" ? "auto" : width,
                    maxWidth: maxWidth,
                }}
                className="max-w-full h-auto rounded-md"
            />
        </div>
    );
}
