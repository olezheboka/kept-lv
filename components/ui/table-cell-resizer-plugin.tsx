"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef, useState, useCallback } from "react";

interface ResizeState {
    isResizing: boolean;
    direction: "column" | "row" | null;
    startPos: number;
    startSize: number;
    targetIndex: number;
    table: HTMLTableElement | null;
}

/**
 * Plugin to enable column and row resizing in Lexical tables.
 * Shows resize handles on cell edges.
 */
export function TableCellResizerPlugin() {
    const [editor] = useLexicalComposerContext();
    const resizeStateRef = useRef<ResizeState>({
        isResizing: false,
        direction: null,
        startPos: 0,
        startSize: 0,
        targetIndex: -1,
        table: null,
    });

    const [cursor, setCursor] = useState<"col-resize" | "row-resize" | null>(null);

    // Handle mouse move during resize
    const handleMouseMove = useCallback((event: MouseEvent) => {
        const state = resizeStateRef.current;

        if (!state.isResizing || !state.table) return;

        if (state.direction === "column") {
            const diff = event.clientX - state.startPos;
            const newWidth = Math.max(50, state.startSize + diff);

            // Apply width to all cells in the same column
            const rows = state.table.querySelectorAll("tr");
            rows.forEach((row) => {
                const cells = row.querySelectorAll("th, td");
                const cell = cells[state.targetIndex] as HTMLTableCellElement;
                if (cell) {
                    cell.style.width = `${newWidth}px`;
                    cell.style.minWidth = `${newWidth}px`;
                    cell.style.maxWidth = `${newWidth}px`;
                }
            });
        } else if (state.direction === "row") {
            const diff = event.clientY - state.startPos;
            const newHeight = Math.max(30, state.startSize + diff);

            // Apply height to the target row
            const rows = state.table.querySelectorAll("tr");
            const targetRow = rows[state.targetIndex] as HTMLTableRowElement;
            if (targetRow) {
                targetRow.style.height = `${newHeight}px`;
                // Also set min-height on cells
                const cells = targetRow.querySelectorAll("th, td");
                cells.forEach((cell) => {
                    (cell as HTMLElement).style.minHeight = `${newHeight}px`;
                });
            }
        }
    }, []);

    // Handle mouse up - end resize
    const handleMouseUp = useCallback(() => {
        resizeStateRef.current = {
            isResizing: false,
            direction: null,
            startPos: 0,
            startSize: 0,
            targetIndex: -1,
            table: null,
        };
        setCursor(null);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, []);

    // Global event listeners for resize
    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Editor event listeners
    useEffect(() => {
        const rootElement = editor.getRootElement();
        if (!rootElement) return;

        const handleEditorMouseMove = (event: MouseEvent) => {
            if (resizeStateRef.current.isResizing) return;

            const target = event.target as HTMLElement;
            const cell = target.closest("th, td") as HTMLTableCellElement;

            if (!cell) {
                setCursor(null);
                return;
            }

            const rect = cell.getBoundingClientRect();
            const isNearRightEdge = event.clientX > rect.right - 6;
            const isNearBottomEdge = event.clientY > rect.bottom - 6;

            if (isNearRightEdge && !isNearBottomEdge) {
                setCursor("col-resize");
            } else if (isNearBottomEdge && !isNearRightEdge) {
                setCursor("row-resize");
            } else if (isNearRightEdge && isNearBottomEdge) {
                // Corner - prefer column resize
                setCursor("col-resize");
            } else {
                setCursor(null);
            }
        };

        const handleEditorMouseDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const cell = target.closest("th, td") as HTMLTableCellElement;

            if (!cell) return;

            const rect = cell.getBoundingClientRect();
            const isNearRightEdge = event.clientX > rect.right - 6;
            const isNearBottomEdge = event.clientY > rect.bottom - 6;

            const table = cell.closest("table");
            if (!table) return;

            if (isNearRightEdge) {
                event.preventDefault();
                event.stopPropagation();

                const row = cell.parentElement as HTMLTableRowElement;
                const columnIndex = Array.from(row.children).indexOf(cell);

                resizeStateRef.current = {
                    isResizing: true,
                    direction: "column",
                    startPos: event.clientX,
                    startSize: cell.offsetWidth,
                    targetIndex: columnIndex,
                    table,
                };

                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
            } else if (isNearBottomEdge) {
                event.preventDefault();
                event.stopPropagation();

                const row = cell.parentElement as HTMLTableRowElement;
                const rows = Array.from(table.querySelectorAll("tr"));
                const rowIndex = rows.indexOf(row);

                resizeStateRef.current = {
                    isResizing: true,
                    direction: "row",
                    startPos: event.clientY,
                    startSize: row.offsetHeight,
                    targetIndex: rowIndex,
                    table,
                };

                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
            }
        };

        rootElement.addEventListener("mousemove", handleEditorMouseMove);
        rootElement.addEventListener("mousedown", handleEditorMouseDown, true);

        return () => {
            rootElement.removeEventListener("mousemove", handleEditorMouseMove);
            rootElement.removeEventListener("mousedown", handleEditorMouseDown, true);
        };
    }, [editor]);

    // Apply cursor style to editor
    useEffect(() => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            rootElement.style.cursor = cursor || "";
        }
    }, [cursor, editor]);

    return null;
}
