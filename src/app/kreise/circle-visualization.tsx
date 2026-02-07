"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildCircleTree, packCircles, type CircleNode, type LayoutItem } from "@/lib/circle-packing";

interface CircleVisualizationProps {
  circles: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
    parent_circle_id?: string | null;
    role_count?: number;
  }[];
  roles: {
    id: string;
    name: string;
    circle_id?: string;
    circle?: { id: string; name: string; color?: string | null; icon?: string | null } | null;
  }[];
}

// SVG viewBox dimensions
const VB_W = 800;
const VB_H = 600;
const CENTER_X = VB_W / 2;
const CENTER_Y = VB_H / 2;
const OUTER_R = 265;

export function CircleVisualization({ circles, roles }: CircleVisualizationProps) {
  const router = useRouter();
  const [focusPath, setFocusPath] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const tree = useMemo(() => buildCircleTree(circles, roles), [circles, roles]);

  const focusedNode = useMemo(() => {
    if (!tree) return null;
    let node: CircleNode = tree;
    for (const id of focusPath) {
      const child = node.children.find(c => c.id === id);
      if (!child) break;
      node = child;
    }
    return node;
  }, [tree, focusPath]);

  const breadcrumbs = useMemo(() => {
    if (!tree) return [];
    const trail: { id: string; name: string; path: string[] }[] = [
      { id: tree.id, name: tree.name, path: [] },
    ];
    let node: CircleNode = tree;
    for (let i = 0; i < focusPath.length; i++) {
      const child = node.children.find(c => c.id === focusPath[i]);
      if (!child) break;
      trail.push({
        id: child.id,
        name: child.name,
        path: focusPath.slice(0, i + 1),
      });
      node = child;
    }
    return trail;
  }, [tree, focusPath]);

  const layoutItems = useMemo(() => {
    if (!focusedNode) return [];
    const subCircles = focusedNode.children.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      weight: c.roles.length + c.children.length * 2 + 1,
    }));
    return packCircles(OUTER_R, subCircles, focusedNode.roles, focusedNode.color);
  }, [focusedNode]);

  const handleCircleClick = useCallback((item: LayoutItem) => {
    if (item.type === 'circle') {
      setFocusPath(prev => [...prev, item.id]);
    } else {
      router.push(`/rollen/${item.id}`);
    }
  }, [router]);

  const handleBreadcrumbClick = useCallback((path: string[]) => {
    setFocusPath(path);
  }, []);

  if (!tree || !focusedNode) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        Keine Kreise vorhanden
      </div>
    );
  }

  const subCircleItems = layoutItems.filter(i => i.type === 'circle');
  const roleItems = layoutItems.filter(i => i.type === 'role');

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-1.5 text-sm flex-wrap">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50 flex-shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            <button
              onClick={() => handleBreadcrumbClick(crumb.path)}
              className={`hover:text-[var(--np-blue)] transition-colors ${
                i === breadcrumbs.length - 1
                  ? 'font-semibold text-foreground font-[family-name:var(--font-display)]'
                  : 'text-muted-foreground'
              }`}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* SVG Visualization */}
      <div className="aspect-[4/3] min-h-[500px] relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full h-full"
          role="img"
          aria-label={`Kreisvisualisierung: ${focusedNode.name}`}
        >
          {/* Outer container circle */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={OUTER_R}
            fill={focusedNode.color}
            fillOpacity={0.05}
            stroke={focusedNode.color}
            strokeOpacity={0.20}
            strokeWidth={1.5}
          />

          {/* Container label at top */}
          <text
            x={CENTER_X}
            y={CENTER_Y - OUTER_R + 24}
            textAnchor="middle"
            className="fill-foreground font-[family-name:var(--font-display)]"
            fontSize={14}
            fontWeight={600}
            opacity={0.45}
          >
            {focusedNode.icon ? `${focusedNode.icon} ${focusedNode.name}` : focusedNode.name}
          </text>

          {/* --- Sub-circles --- */}
          {subCircleItems.map(item => {
            const cx = CENTER_X + item.x;
            const cy = CENTER_Y + item.y;
            const isHovered = hoveredId === item.id;

            return (
              <g
                key={item.id}
                className="cursor-pointer"
                onClick={() => handleCircleClick(item)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Hover highlight ring */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={item.r + 3}
                    fill="none"
                    stroke={item.color}
                    strokeOpacity={0.35}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    className="circle-viz-transition"
                  />
                )}

                {/* Circle shape */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={item.r}
                  fill={item.color}
                  fillOpacity={isHovered ? 0.15 : 0.08}
                  stroke={item.color}
                  strokeOpacity={isHovered ? 0.5 : 0.25}
                  strokeWidth={1.5}
                  className="circle-viz-transition"
                />

                {/* Icon */}
                {item.icon && (
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={Math.min(item.r * 0.4, 20)}
                    className="pointer-events-none select-none"
                  >
                    {item.icon}
                  </text>
                )}

                {/* Label - SVG text, multiline via tspans */}
                <SubCircleLabel
                  cx={cx}
                  cy={item.icon ? cy + item.r * 0.32 : cy}
                  maxWidth={item.r * 1.6}
                  label={item.label}
                  fontSize={Math.min(Math.max(item.r * 0.22, 10), 13)}
                />
              </g>
            );
          })}

          {/* --- Roles --- */}
          {roleItems.map(item => {
            const cx = CENTER_X + item.x;
            const cy = CENTER_Y + item.y;
            const isHovered = hoveredId === item.id;

            return (
              <g
                key={item.id}
                className="cursor-pointer"
                onClick={() => handleCircleClick(item)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={item.r}
                  fill={item.color}
                  fillOpacity={isHovered ? 0.25 : 0.12}
                  stroke={item.color}
                  strokeOpacity={isHovered ? 0.5 : 0.2}
                  strokeWidth={1}
                  className="circle-viz-transition"
                />

                {/* Label below the circle */}
                <text
                  x={cx}
                  y={cy + item.r + 12}
                  textAnchor="middle"
                  className="pointer-events-none select-none fill-foreground font-[family-name:var(--font-sans)]"
                  fontSize={9}
                  opacity={isHovered ? 0.9 : 0.55}
                >
                  {truncate(item.label, 18)}
                </text>

                {/* Tooltip on hover: full name */}
                {isHovered && item.label.length > 18 && (
                  <g>
                    <rect
                      x={cx - measureText(item.label, 11) / 2 - 6}
                      y={cy - item.r - 28}
                      width={measureText(item.label, 11) + 12}
                      height={20}
                      rx={6}
                      fill="var(--card)"
                      stroke="var(--border)"
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={cy - item.r - 15}
                      textAnchor="middle"
                      className="fill-foreground font-[family-name:var(--font-sans)]"
                      fontSize={11}
                    >
                      {item.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Empty state */}
          {layoutItems.length === 0 && (
            <text
              x={CENTER_X}
              y={CENTER_Y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground"
              fontSize={14}
            >
              Keine Rollen in diesem Kreis
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-border/50 flex items-center gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full border-[1.5px]" style={{ borderColor: 'var(--np-blue)', backgroundColor: 'oklch(0.60 0.15 240 / 0.08)' }} />
          Sub-Kreis (klicken zum Reinzoomen)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.60 0.15 240 / 0.15)' }} />
          Rolle (klicken zum Öffnen)
        </span>
      </div>
    </div>
  );
}

/** Render a multi-line SVG text label centered at cx, cy */
function SubCircleLabel({ cx, cy, maxWidth, label, fontSize }: {
  cx: number; cy: number; maxWidth: number; label: string; fontSize: number;
}) {
  const lines = wrapText(label, maxWidth, fontSize);
  const lineHeight = fontSize * 1.25;
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;

  return (
    <text
      x={cx}
      textAnchor="middle"
      className="pointer-events-none select-none fill-foreground font-[family-name:var(--font-display)]"
      fontSize={fontSize}
      fontWeight={600}
      opacity={0.8}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={cx} y={startY + i * lineHeight} dominantBaseline="central">
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** Simple text wrapping by splitting on spaces */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (measureText(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  // Max 3 lines, truncate last if needed
  if (lines.length > 3) {
    return [...lines.slice(0, 2), lines[2] + '…'];
  }
  return lines;
}

/** Rough text width measurement (avg char width ≈ 0.55 * fontSize) */
function measureText(text: string, fontSize: number): number {
  return text.length * fontSize * 0.55;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
