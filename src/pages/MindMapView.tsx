import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    X,
    Search,
    Download,
    Share2,
    Maximize2,
    ZoomIn,
    ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { topicContent } from "@/data/studyData";
import MindMap, { MindMapNode } from "@/components/MindMap";

const MindMapViewPage = () => {
    const { topicId, subtopicId, sectionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const stateData = location.state as { mindmapData: any; sectionTitle: string } | null;

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 120, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const [rootNode, setRootNode] = useState<MindMapNode | null>(null);

    // Constants for calculations
    const SPACING = {
        horizontalGap: 80,
        vertical: 24,
        nodeHeight: 48,
        breathingRoom: 100
    };

    // Build tree recursively from data
    const buildTree = (id: string, title: string, level: number, childrenData: any[]): MindMapNode => {
        return {
            id,
            title,
            level,
            isExpanded: level === 0, // Expand root by default
            children: childrenData.map((child, idx) => {
                const childId = `${id}-${idx}`;
                if (typeof child === 'string') {
                    return { id: childId, title: child, level: level + 1, isExpanded: false, children: [] };
                }
                if (child.term) {
                    return { id: childId, title: child.term, level: level + 1, isExpanded: false, children: [] };
                }
                // Handle nested structure: title + details
                return buildTree(childId, child.title || child.heading || "Detail", level + 1, child.details || child.subPoints || []);
            })
        };
    };

    // Get content data and build tree
    useEffect(() => {
        // If we have data passed from navigation state, use it
        if (stateData?.mindmapData) {
            const children = stateData.mindmapData.children || [];
            const root = buildTree(stateData.mindmapData.id || "root", stateData.mindmapData.title || stateData.sectionTitle, 0, children);
            setRootNode(root);
            return;
        }

        const topic = topicContent[topicId as keyof typeof topicContent];
        if (!topic) return;

        const mainContent = (topic as any)[subtopicId as string];
        if (!mainContent) return;

        let initialRoot: MindMapNode;

        if (sectionId) {
            const section = mainContent.sections.find((s: any) => s.id.toString() === sectionId);
            if (section) {
                const children: any[] = [];

                if (section.content?.keyPoints?.length) {
                    children.push({
                        title: "Core Concepts",
                        details: section.content.keyPoints
                    });
                }

                if (section.content?.keyTerms?.length) {
                    children.push({
                        title: "Glossary",
                        details: section.content.keyTerms.map((kt: any) => `${kt.term}: ${kt.definition}`)
                    });
                }

                if (section.content?.importantDates?.length) {
                    children.push({
                        title: "Timeline",
                        details: section.content.importantDates.map((d: any) => `${d.year} - ${d.event}`)
                    });
                }

                initialRoot = buildTree("root", section.title, 0, children);
            } else {
                return;
            }
        } else {
            initialRoot = {
                id: "root",
                title: mainContent.title,
                level: 0,
                isExpanded: true,
                children: mainContent.sections.map((section: any, sIdx: number) => {
                    const sectionIdStr = `section-${sIdx}`;
                    const sectionChildren: any[] = [];

                    if (section.content?.keyPoints) sectionChildren.push(...section.content.keyPoints);
                    if (section.content?.keyTerms) {
                        sectionChildren.push({
                            title: "Glossary",
                            details: section.content.keyTerms.map((kt: any) => kt.term)
                        });
                    }

                    return buildTree(sectionIdStr, section.title, 1, sectionChildren);
                })
            };
        }

        setRootNode(initialRoot);
    }, [topicId, subtopicId, sectionId, stateData]);

    // Calculate node height recursively
    const calculateNodeHeight = (node: MindMapNode): number => {
        if (!node.isExpanded || node.children.length === 0) {
            return SPACING.nodeHeight;
        }

        let totalHeight = 0;
        node.children.forEach((child, idx) => {
            totalHeight += calculateNodeHeight(child);
            if (idx < node.children.length - 1) {
                totalHeight += SPACING.vertical;
            }
        });

        return Math.max(totalHeight, SPACING.nodeHeight);
    };

    // Calculate text width (helper for bounds)
    const getNodeWidth = (title: string) => {
        const baseWidth = 160;
        const charWidth = 7.5;
        return Math.max(baseWidth, Math.min(title.length * charWidth + 48, 340));
    };

    // Find node position and bounds
    const findNodeBounds = (
        targetId: string,
        node: MindMapNode,
        x: number,
        y: number
    ): { x: number; y: number; width: number; height: number; found: boolean; node: MindMapNode | null } => {
        const nodeWidth = getNodeWidth(node.title);

        if (node.id === targetId) {
            return {
                x,
                y,
                width: nodeWidth,
                height: calculateNodeHeight(node),
                found: true,
                node
            };
        }

        if (node.isExpanded && node.children.length > 0) {
            let currentY = y;
            const nodeHeight = calculateNodeHeight(node);

            for (const child of node.children) {
                const result = findNodeBounds(
                    targetId,
                    child,
                    x + nodeWidth + SPACING.horizontalGap,
                    currentY
                );

                if (result.found) {
                    return result;
                }

                const childHeight = calculateNodeHeight(child);
                currentY += childHeight + SPACING.vertical;
            }
        }

        return { x: 0, y: 0, width: 0, height: 0, found: false, node: null };
    };

    const toggleNode = (nodeId: string) => {
        if (!rootNode) return;

        // Find current node bounds before toggling
        const beforeBounds = findNodeBounds(nodeId, rootNode, 80, 100);
        if (!beforeBounds.found || !beforeBounds.node) return;

        const wasExpanded = beforeBounds.node.isExpanded;

        const updateNode = (node: MindMapNode): MindMapNode => {
            if (node.id === nodeId) {
                return { ...node, isExpanded: !node.isExpanded };
            }
            return {
                ...node,
                children: node.children.map(updateNode)
            };
        };

        const newRootNode = updateNode(rootNode);
        setRootNode(newRootNode);

        // Viewport adjustment
        if (!wasExpanded && canvasRef.current) {
            setTimeout(() => {
                const afterBounds = findNodeBounds(nodeId, newRootNode, 80, 100);
                if (!afterBounds.found) return;

                const viewportWidth = canvasRef.current!.clientWidth;
                const viewportHeight = canvasRef.current!.clientHeight;

                const totalWidth = afterBounds.width + SPACING.horizontalGap + 200 + SPACING.breathingRoom * 2;
                const totalHeight = afterBounds.height + SPACING.breathingRoom * 2;

                const widthRatio = viewportWidth / totalWidth;
                const heightRatio = viewportHeight / totalHeight;
                const idealZoom = Math.min(widthRatio, heightRatio, zoom);

                let targetZoom = zoom;
                if (idealZoom < zoom) {
                    targetZoom = Math.max(idealZoom, 0.6);
                    setZoom(targetZoom);
                }

                const nodeCenterX = afterBounds.x + afterBounds.width / 2;
                const nodeCenterY = afterBounds.y + afterBounds.height / 2;

                const newPanX = viewportWidth * 0.25 - nodeCenterX * targetZoom;
                const newPanY = viewportHeight * 0.5 - nodeCenterY * targetZoom;

                setPan({ x: newPanX, y: newPanY });
            }, 50);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.92 : 1.08;
        const newZoom = Math.min(Math.max(zoom * delta, 0.4), 2);
        setZoom(newZoom);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const [searchQuery, setSearchQuery] = useState("");

    // Auto-expand nodes that match search query
    useEffect(() => {
        if (!searchQuery || !rootNode) return;

        const expandMatchingNodes = (node: MindMapNode): { node: MindMapNode; hasMatch: boolean } => {
            let hasMatch = node.title.toLowerCase().includes(searchQuery.toLowerCase());

            const updatedChildren = node.children.map(child => {
                const result = expandMatchingNodes(child);
                if (result.hasMatch) {
                    hasMatch = true;
                }
                return result.node;
            });

            return {
                node: {
                    ...node,
                    children: updatedChildren,
                    isExpanded: hasMatch ? true : node.isExpanded
                },
                hasMatch
            };
        };

        const result = expandMatchingNodes(rootNode);
        if (result.hasMatch) {
            setRootNode(result.node);
        }
    }, [searchQuery]);

    const handleDownload = () => {
        const svg = document.getElementById("mindmap-svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${pageTitle?.replace(/\s+/g, "_") || "mindmap"}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const mainContentData = topicContent[topicId as keyof typeof topicContent]?.[(subtopicId as string) as any] as any;

    if (!mainContentData && !rootNode && !stateData) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-xs">We couldn't find the structural map data for this topic.</p>
            <Button onClick={() => navigate(-1)} className="rounded-full px-8">
                Go Back
            </Button>
        </div>
    );

    if (!rootNode) return <div className="p-10 text-center">Loading...</div>;

    const pageTitle = stateData?.sectionTitle || (sectionId
        ? mainContentData?.sections?.find((s: any) => s.id.toString() === sectionId)?.title
        : mainContentData?.title);

    return (
        <div className="fixed inset-0 z-[70] flex flex-col bg-white overflow-hidden">
            {/* Header - NotebookLM style */}
            <div className="h-auto md:h-16 bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-2 md:py-0 z-10 gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-gray-100 shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block" />
                    <div className="min-w-0 flex-1 md:flex-none">
                        <h2 className="font-medium text-[14px] md:text-[16px] text-gray-900 leading-none truncate">
                            {pageTitle}
                        </h2>
                        <p className="text-[10px] md:text-[12px] text-gray-500 mt-1">
                            Interactive Structural Map
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <div className="relative flex-1 md:w-64 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search concepts..."
                            className="w-full pl-9 pr-8 py-1.5 md:py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7C79EC]/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-gray-100"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownload}
                            className="h-9 w-9 rounded-full hover:bg-gray-100"
                            title="Download SVG"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={canvasRef}
                className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#fafbfc]"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <MindMap
                    data={rootNode}
                    onNodeToggle={toggleNode}
                    zoom={zoom}
                    pan={pan}
                    searchQuery={searchQuery}
                />

                {/* Instructions - bottom left */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-5 py-3 pointer-events-none hidden sm:block">
                    <p className="text-[13px] text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium text-gray-800">
                            <span className="w-2 h-2 rounded-full bg-[#7C79EC]" />
                            Click nodes to expand
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>Scroll to zoom</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>Drag to pan</span>
                    </p>
                </div>

                {/* Zoom Controls - NotebookLM style */}
                <div className="absolute bottom-6 right-6 flex items-center gap-1 md:gap-2 bg-white rounded-full shadow-xl border border-gray-100 px-3 md:px-4 py-1.5 md:py-2 scale-90 md:scale-100 origin-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(Math.max(zoom * 0.8, 0.4))}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-gray-100"
                    >
                        <ZoomOut className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                    </Button>

                    <div className="w-10 md:w-14 text-center text-[11px] md:text-[13px] text-gray-700 font-medium">
                        {Math.round(zoom * 100)}%
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(Math.min(zoom * 1.2, 2))}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-gray-100"
                    >
                        <ZoomIn className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                    </Button>

                    <div className="w-px h-5 md:h-6 bg-gray-200 mx-0.5 md:mx-1" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setZoom(1);
                            setPan({ x: 120, y: 80 });
                        }}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-gray-100"
                        title="Reset View"
                    >
                        <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MindMapViewPage;
