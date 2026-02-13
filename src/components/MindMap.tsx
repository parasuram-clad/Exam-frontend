import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MindMapNode {
    id: string;
    title: string;
    children: MindMapNode[];
    isExpanded: boolean;
    level: number;
}

interface MindMapProps {
    data: MindMapNode;
    onNodeToggle?: (nodeId: string) => void;
    zoom?: number;
    pan?: { x: number; y: number };
    searchQuery?: string;
}

// Consistent spacing based on NotebookLM
const SPACING = {
    horizontalGap: 80,    // Gap between parent node edge and children
    vertical: 24,         // Vertical gap between sibling nodes
    nodeHeight: 48,       // Standard node height
};

// Calculate node width based on text length
const getNodeWidth = (title: string) => {
    const baseWidth = 160;
    const charWidth = 7.5;
    const calculatedWidth = Math.max(baseWidth, Math.min(title.length * charWidth + 48, 340));
    return calculatedWidth;
};

// Get NotebookLM-style colors
const getNodeColor = (level: number, isHighlighted?: boolean) => {
    if (isHighlighted) {
        return {
            bg: '#FFF9C4', // Light Yellow for search
            text: '#856404',
            border: '#FFEE58'
        };
    }

    if (level === 0) {
        return {
            bg: '#d1d9e6',
            text: '#1f2937',
            border: '#b8c4d6'
        };
    }

    if (level === 1) {
        return {
            bg: '#d1e7dd',
            text: '#0f5132',
            border: '#b8d4c8'
        };
    }

    if (level === 2) {
        return {
            bg: '#d1f2eb',
            text: '#0a4d3c',
            border: '#b8e6d8'
        };
    }

    return {
        bg: '#f8fafc',
        text: '#64748b',
        border: '#e2e8f0'
    };
};

const MindMap = ({ data, onNodeToggle, zoom = 1, pan = { x: 0, y: 0 }, searchQuery = "" }: MindMapProps) => {
    // Render node recursively with consistent spacing
    const renderNode = (node: MindMapNode, x: number, y: number): { element: JSX.Element; height: number } => {
        const isHighlighted = searchQuery && node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const colors = getNodeColor(node.level, !!isHighlighted);
        const nodeWidth = getNodeWidth(node.title);

        let currentY = y;
        const visibleChildren: Array<{ element: JSX.Element; height: number; childY: number }> = [];

        // Render children if expanded with consistent vertical spacing
        if (node.isExpanded && node.children.length > 0) {
            node.children.forEach((child) => {
                const result = renderNode(child, x + nodeWidth + SPACING.horizontalGap, currentY);
                visibleChildren.push({ ...result, childY: currentY });
                currentY += result.height + SPACING.vertical;
            });
        }

        const totalHeight = node.isExpanded && node.children.length > 0
            ? currentY - y - SPACING.vertical
            : SPACING.nodeHeight;

        // Center the parent node vertically relative to its children
        const centerY = y + (node.isExpanded && node.children.length > 0 ? totalHeight / 2 : SPACING.nodeHeight / 2);

        return {
            height: Math.max(totalHeight, SPACING.nodeHeight),
            element: (
                <g key={node.id} className="transition-all duration-300">
                    {/* Connection lines - thin curved lines like NotebookLM */}
                    {node.isExpanded && visibleChildren.map((child, idx) => {
                        const childCenterY = child.childY + child.height / 2;
                        const startX = x + nodeWidth;
                        const startY = centerY;
                        const endX = x + nodeWidth + SPACING.horizontalGap;
                        const endY = childCenterY;

                        // Smooth bezier curve - more fluid like NotebookLM
                        const controlX1 = startX + (SPACING.horizontalGap * 0.45);
                        const controlX2 = endX - (SPACING.horizontalGap * 0.45);

                        return (
                            <path
                                key={`line-${node.id}-${idx}`}
                                d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
                                stroke="#c7d2e0"
                                strokeWidth="2"
                                fill="none"
                                opacity="0.45"
                                className="mind-map-line-expand"
                                style={{ strokeLinecap: 'round' }}
                            />
                        );
                    })}

                    {/* Node pill */}
                    <g
                        transform={`translate(${x}, ${centerY - SPACING.nodeHeight / 2})`}
                        onClick={() => node.children.length > 0 && onNodeToggle?.(node.id)}
                        className={cn(
                            "transition-all duration-300",
                            node.children.length > 0 ? "cursor-pointer" : "cursor-default",
                            isHighlighted && "scale-105"
                        )}
                    >
                        <rect
                            width={nodeWidth}
                            height={SPACING.nodeHeight}
                            rx="24"
                            fill={colors.bg}
                            stroke={isHighlighted ? "#FBC02D" : colors.border}
                            strokeWidth={isHighlighted ? "2" : "1"}
                            className="hover:shadow-md transition-shadow"
                            style={{
                                filter: isHighlighted ? 'drop-shadow(0 4px 6px rgba(251, 192, 45, 0.3))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))'
                            }}
                        />

                        {/* Node text */}
                        <foreignObject width={nodeWidth - 56} height={SPACING.nodeHeight} x="18" y="0">
                            <div className="flex items-center h-full">
                                <span
                                    className={cn(
                                        "text-[14px] leading-[18px] font-medium transition-colors",
                                        isHighlighted ? "font-bold" : "font-medium"
                                    )}
                                    style={{
                                        color: colors.text,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {node.title}
                                </span>
                            </div>
                        </foreignObject>

                        {/* Expand/collapse chevron */}
                        {node.children.length > 0 && (
                            <g transform={`translate(${nodeWidth - 30}, ${SPACING.nodeHeight / 2})`}>
                                {node.isExpanded ? (
                                    <path
                                        d="M 3 -4 L -2 0 L 3 4"
                                        stroke={colors.text}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        opacity="0.6"
                                        className="transition-all duration-200"
                                    />
                                ) : (
                                    <path
                                        d="M -2 -4 L 3 0 L -2 4"
                                        stroke={colors.text}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        opacity="0.6"
                                        className="transition-all duration-200"
                                    />
                                )}
                            </g>
                        )}
                    </g>

                    {/* Render children with smooth transition */}
                    <g
                        style={{
                            opacity: node.isExpanded ? 1 : 0,
                            transition: 'opacity 0.35s ease-in-out',
                            pointerEvents: node.isExpanded ? 'auto' : 'none'
                        }}
                    >
                        {visibleChildren.map(child => child.element)}
                    </g>
                </g>
            )
        };
    };

    const treeResult = renderNode(data, 80, 100);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#fafbfc]">
            <style dangerouslySetInnerHTML={{
                __html: `
          .mind-map-line-expand {
            animation: fadeInLine 0.35s ease-in-out;
          }
          @keyframes fadeInLine {
            from {
              opacity: 0;
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
            }
            to {
              opacity: 0.6;
              stroke-dasharray: 1000;
              stroke-dashoffset: 0;
            }
          }
        `
            }} />
            <div
                id="mindmap-container"
                className="relative w-full h-full"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <svg
                    id="mindmap-svg"
                    width="5000"
                    height="5000"
                    className="min-w-full min-h-full"
                    viewBox="0 0 5000 5000"
                >
                    {treeResult.element}
                </svg>
            </div>
        </div>
    );
};

export default MindMap;
