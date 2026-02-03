"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_CRITICAL,
    LexicalEditor,
    SELECTION_CHANGE_COMMAND,
    $createTextNode,
    $createParagraphNode,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import {
    $isTableNode,
    $isTableSelection,
    $insertTableRowAtSelection,
    $insertTableColumnAtSelection,
    $deleteTableRowAtSelection,
    $deleteTableColumnAtSelection,
    $mergeCells,
    $unmergeCell,
    TableCellNode,
    TableNode,
    TableRowNode,
    $isTableCellNode,
    $isTableRowNode,
    $createTableCellNode,
    TableCellHeaderStates,
    INSERT_TABLE_COMMAND,
} from "@lexical/table";
import {
    $getNearestNodeOfType,
    mergeRegister,
} from "@lexical/utils";
import {
    Scissors,
    Merge,
    Split,
    PaintBucket,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Table as TableIcon,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    TableProperties,
    Hash,
    Trash2,
    Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Separator } from "@/components/ui/separator";

// Helper to check if selection is inside a table
function $isSelectionInTable(selection: ReturnType<typeof $getSelection>): boolean {
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const tableNode = $getNearestNodeOfType(selection.anchor.getNode(), TableNode);
        return !!tableNode;
    }
    return false;
}

const ToolbarButton = ({
    onClick,
    isActive,
    isDisabled,
    children,
    title,
    className,
}: {
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    children: React.ReactNode;
    title: string;
    className?: string;
}) => (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    disabled={isDisabled}
                    onClick={(e) => {
                        e.preventDefault();
                        onClick();
                    }}
                    className={cn(
                        "p-1.5 rounded transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed h-7 w-7 flex items-center justify-center",
                        isActive ? "bg-muted text-primary" : "text-muted-foreground",
                        className
                    )}
                    type="button"
                >
                    {children}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {title}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export function TableToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isTableSelected, setIsTableSelected] = useState(false);
    const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);
    const [tableRows, setTableRows] = useState(1);
    const [tableCols, setTableCols] = useState(1);

    const updateToolbar = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            const isInTable = $isSelectionInTable(selection);
            setIsTableSelected(isInTable);
        });
    }, [editor]);

    // Helper actions using TableUtils directly (using AtSelection variants)
    const insertRow = (below = true) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                $insertTableRowAtSelection(below);
            }
        });
    };

    const insertColumn = (right = true) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                $insertTableColumnAtSelection(right);
            }
        });
    };

    const deleteRow = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                $deleteTableRowAtSelection();
            }
        });
    };

    const deleteColumn = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                $deleteTableColumnAtSelection();
            }
        });
    };

    const mergeSelected = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection)) {
                const nodes = selection.getNodes();
                const cellNodes = nodes.filter($isTableCellNode);
                if (cellNodes.length > 1) {
                    $mergeCells(cellNodes);
                }
            }
        });
    };

    const splitCell = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const cellNode = $getNearestNodeOfType(anchorNode, TableCellNode);
                if (cellNode && (cellNode.getColSpan() > 1 || cellNode.getRowSpan() > 1)) {
                    $unmergeCell();
                }
            }
        });
    };

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                updateToolbar();
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [editor, updateToolbar]);

    // if (!isTableSelected) return null;
    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b p-1 bg-muted/40 animate-in slide-in-from-top-1 overflow-x-auto">
            {/* Insert Table */}
            <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            "p-1.5 rounded transition-colors hover:bg-muted h-7 w-7 flex items-center justify-center",
                            isTablePopoverOpen ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                        title="Insert Table"
                        type="button"
                    >
                        <TableIcon className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-center text-muted-foreground">
                            {tableCols} x {tableRows}
                        </div>
                        <div
                            className="grid gap-1"
                            style={{ gridTemplateColumns: "repeat(10, 1fr)" }}
                            onMouseLeave={() => {
                                setTableCols(1);
                                setTableRows(1);
                            }}
                        >
                            {Array.from({ length: 100 }).map((_, i) => {
                                const row = Math.floor(i / 10) + 1;
                                const col = (i % 10) + 1;
                                const isSelected = row <= tableRows && col <= tableCols;

                                return (
                                    <button
                                        key={i}
                                        className={cn(
                                            "w-4 h-4 border rounded-sm transition-colors",
                                            isSelected
                                                ? "bg-primary border-primary"
                                                : "bg-muted border-transparent hover:border-primary/50"
                                        )}
                                        onMouseEnter={() => {
                                            setTableRows(row);
                                            setTableCols(col);
                                        }}
                                        onClick={() => {
                                            editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                                                columns: String(col),
                                                rows: String(row),
                                                includeHeaders: false,
                                            });
                                            setIsTablePopoverOpen(false);
                                            setTableRows(1);
                                            setTableCols(1);
                                        }}
                                        type="button"
                                        aria-label={`${row} rows, ${col} columns`}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                            {tableCols} Columns x {tableRows} Rows
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Row Operations */}
            <ToolbarButton
                onClick={() => insertRow(false)}
                isDisabled={!isTableSelected}
                title="Insert Row Above"
            >
                <ArrowUp className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => insertRow(true)}
                isDisabled={!isTableSelected}
                title="Insert Row Below"
            >
                <ArrowDown className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={deleteRow}
                isDisabled={!isTableSelected}
                title="Delete Row"
                className="hover:text-destructive"
            >
                <Scissors className="w-4 h-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Column Operations */}
            <ToolbarButton
                onClick={() => insertColumn(false)}
                isDisabled={!isTableSelected}
                title="Insert Column Left"
            >
                <ArrowLeft className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => insertColumn(true)}
                isDisabled={!isTableSelected}
                title="Insert Column Right"
            >
                <ArrowRight className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={deleteColumn}
                isDisabled={!isTableSelected}
                title="Delete Column"
                className="hover:text-destructive"
            >
                <Scissors className="w-4 h-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Merge/Split */}
            <ToolbarButton
                onClick={mergeSelected}
                isDisabled={!isTableSelected}
                title="Merge Cells"
            >
                <Merge className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={splitCell}
                isDisabled={!isTableSelected}
                title="Split Cell"
            >
                <Split className="w-4 h-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Cell Background */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button disabled={!isTableSelected} className="flex items-center justify-center h-7 w-7 rounded hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" title="Cell Background">
                        <PaintBucket className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2">
                    <div className="flex gap-1">
                        {['transparent', '#f3f4f6', '#e5e7eb', '#d1d5db', '#fca5a5', '#86efac', '#93c5fd'].map(color => (
                            <div
                                key={color}
                                className="w-5 h-5 rounded border cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color === 'transparent' ? '#fff' : color, backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #f00 50%, transparent 50%)' : 'none' }}
                                onClick={() => {
                                    editor.update(() => {
                                        const selection = $getSelection();
                                        // Handle table selection (multiple cells selected)
                                        if ($isTableSelection(selection)) {
                                            const nodes = selection.getNodes();
                                            const cellNodes = nodes.filter($isTableCellNode);
                                            cellNodes.forEach((cell) => {
                                                const element = editor.getElementByKey(cell.getKey());
                                                if (element) {
                                                    element.style.backgroundColor = color === 'transparent' ? '' : color;
                                                }
                                            });
                                        } else if ($isRangeSelection(selection)) {
                                            // Handle single cell (cursor in cell)
                                            const cellNode = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                                            if (cellNode) {
                                                const element = editor.getElementByKey(cellNode.getKey());
                                                if (element) {
                                                    element.style.backgroundColor = color === 'transparent' ? '' : color;
                                                }
                                            }
                                        }
                                    });
                                }}
                            />
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Vertical Alignment */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button disabled={!isTableSelected} className="flex items-center justify-center h-7 w-7 rounded hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" title="Vertical Alignment">
                        <AlignVerticalJustifyCenter className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                                const cellNode = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                                if (cellNode) {
                                    const element = editor.getElementByKey(cellNode.getKey());
                                    if (element) element.style.verticalAlign = 'top';
                                }
                            }
                        });
                    }}>
                        <AlignVerticalJustifyStart className="w-3.5 h-3.5 mr-2" /> Top
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                                const cellNode = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                                if (cellNode) {
                                    const element = editor.getElementByKey(cellNode.getKey());
                                    if (element) element.style.verticalAlign = 'middle';
                                }
                            }
                        });
                    }}>
                        <AlignVerticalJustifyCenter className="w-3.5 h-3.5 mr-2" /> Middle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                                const cellNode = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                                if (cellNode) {
                                    const element = editor.getElementByKey(cellNode.getKey());
                                    if (element) element.style.verticalAlign = 'bottom';
                                }
                            }
                        });
                    }}>
                        <AlignVerticalJustifyEnd className="w-3.5 h-3.5 mr-2" /> Bottom
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Table Properties (Heading Row/Column) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button disabled={!isTableSelected} className="flex items-center justify-center h-7 w-7 rounded hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" title="Table Properties">
                        <TableProperties className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                                // Toggle first row as header
                                const tableNode = $getNearestNodeOfType(selection.anchor.getNode(), TableNode);
                                if (tableNode) {
                                    const firstRow = tableNode.getFirstChild();
                                    if (firstRow && $isTableRowNode(firstRow)) {
                                        const cells = firstRow.getChildren();
                                        cells.forEach((cell) => {
                                            if ($isTableCellNode(cell)) {
                                                cell.toggleHeaderStyle(TableCellHeaderStates.ROW);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }}>
                        Toggle Heading Row
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        editor.update(() => {
                            const selection = $getSelection();
                            if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                                // Toggle first column as header
                                const tableNode = $getNearestNodeOfType(selection.anchor.getNode(), TableNode);
                                if (tableNode) {
                                    const rows = tableNode.getChildren();
                                    rows.forEach((row) => {
                                        if ($isTableRowNode(row)) {
                                            const firstCell = row.getFirstChild();
                                            if (firstCell && $isTableCellNode(firstCell)) {
                                                firstCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }}>
                        Toggle Heading Column
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Numbering Column */}
            <ToolbarButton
                onClick={() => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
                            const tableNode = $getNearestNodeOfType(selection.anchor.getNode(), TableNode);
                            if (tableNode) {
                                const rows = tableNode.getChildren();
                                let rowIndex = 0;
                                rows.forEach((row) => {
                                    if ($isTableRowNode(row)) {
                                        // Create a new cell with the row number
                                        const isFirstRow = rowIndex === 0;
                                        const cellContent = isFirstRow ? '#' : String(rowIndex);

                                        // Create paragraph with text
                                        const paragraph = $createParagraphNode();
                                        paragraph.append($createTextNode(cellContent));

                                        // Create table cell (header for first row)
                                        const newCell = $createTableCellNode(isFirstRow ? 1 : 0);
                                        newCell.append(paragraph);

                                        // Insert at the beginning of the row
                                        const firstChild = row.getFirstChild();
                                        if (firstChild) {
                                            firstChild.insertBefore(newCell);
                                        } else {
                                            row.append(newCell);
                                        }

                                        rowIndex++;
                                    }
                                });
                            }
                        }
                    });
                }}
                title="Add Numbering Column"
                isDisabled={!isTableSelected}
            >
                <Hash className="w-4 h-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Delete Table */}
            <ToolbarButton
                onClick={() => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
                            const table = $getNearestNodeOfType(selection.anchor.getNode(), TableNode);
                            if (table) {
                                table.remove();
                            }
                        }
                    });
                }}
                title="Delete Table"
                isDisabled={!isTableSelected}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2 className="w-4 h-4" />
            </ToolbarButton>

        </div>
    );
}
