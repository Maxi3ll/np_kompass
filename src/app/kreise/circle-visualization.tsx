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
const OUTER_R = 270;

export function CircleVisualization({ circles, roles }: CircleVisualizationProps) {
  const router = useRouter();
  const [focusPath, setFocusPath] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Build the tree once
  const tree = useMemo(() => buildCircleTree(circles, roles), [circles, roles]);

  // Navigate the tree to find the currently focused node
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

  // Build breadcrumb trail
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

  // Calculate layout for current focus
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

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-1.5 text-sm flex-wrap">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
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
          <defs>
            {/* Clip paths for text inside circles */}
            {layoutItems.map(item => (
              <clipPath key={`clip-${item.id}`} id={`clip-${item.id}`}>
                <circle cx={CENTER_X + item.x} cy={CENTER_Y + item.y} r={item.r * 0.85} />
              </clipPath>
            ))}
          </defs>

          {/* Outer container circle */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={OUTER_R}
            fill={focusedNode.color}
            fillOpacity={0.06}
            stroke={focusedNode.color}
            strokeOpacity={0.25}
            strokeWidth={2}
          />

          {/* Container label at top */}
          <text
            x={CENTER_X}
            y={CENTER_Y - OUTER_R + 28}
            textAnchor="middle"
            className="fill-foreground font-[family-name:var(--font-display)]"
            fontSize={16}
            fontWeight={600}
            opacity={0.6}
          >
            {focusedNode.icon && (
              <tspan>{focusedNode.icon} </tspan>
            )}
            <tspan>{focusedNode.name}</tspan>
          </text>

          {/* Layout items */}
          {layoutItems.map(item => {
            const cx = CENTER_X + item.x;
            const cy = CENTER_Y + item.y;
            const isHovered = hoveredId === item.id;
            const isSubCircle = item.type === 'circle';
            const scale = isHovered ? 1.05 : 1;

            return (
              <g
                key={item.id}
                className="cursor-pointer circle-viz-transition"
                onClick={() => handleCircleClick(item)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                transform={`translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* Circle shape */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={item.r}
                  fill={item.color}
                  fillOpacity={isSubCircle ? 0.10 : 0.20}
                  stroke={item.color}
                  strokeOpacity={isHovered ? 0.6 : 0.3}
                  strokeWidth={isSubCircle ? 1.5 : 1}
                />

                {/* Icon for sub-circles */}
                {isSubCircle && item.icon && (
                  <text
                    x={cx}
                    y={cy - item.r * 0.15}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={Math.min(item.r * 0.45, 24)}
                    className="pointer-events-none"
                  >
                    {item.icon}
                  </text>
                )}

                {/* Label */}
                <foreignObject
                  x={cx - item.r * 0.85}
                  y={isSubCircle && item.icon ? cy + item.r * 0.05 : cy - item.r * 0.4}
                  width={item.r * 1.7}
                  height={item.r * (isSubCircle && item.icon ? 0.8 : 0.8)}
                  clipPath={`url(#clip-${item.id})`}
                  className="pointer-events-none"
                >
                  <div
                    className={`flex items-center justify-center h-full text-center leading-tight ${
                      isSubCircle
                        ? 'font-[family-name:var(--font-display)] font-semibold'
                        : 'font-[family-name:var(--font-sans)]'
                    }`}
                    style={{
                      fontSize: isSubCircle
                        ? `${Math.min(Math.max(item.r * 0.22, 10), 14)}px`
                        : `${Math.min(Math.max(item.r * 0.28, 8), 12)}px`,
                      color: 'var(--foreground)',
                      opacity: 0.85,
                    }}
                  >
                    {item.label}
                  </div>
                </foreignObject>

                {/* Sub-circle indicator: small arrow */}
                {isSubCircle && (
                  <g opacity={isHovered ? 0.7 : 0.3} className="circle-viz-transition">
                    <circle
                      cx={cx + item.r * 0.6}
                      cy={cy + item.r * 0.6}
                      r={8}
                      fill={item.color}
                      fillOpacity={0.2}
                    />
                    <path
                      d={`M${cx + item.r * 0.6 - 3} ${cy + item.r * 0.6} L${cx + item.r * 0.6 + 3} ${cy + item.r * 0.6}`}
                      stroke={item.color}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                    <path
                      d={`M${cx + item.r * 0.6 + 1} ${cy + item.r * 0.6 - 2.5} L${cx + item.r * 0.6 + 3} ${cy + item.r * 0.6} L${cx + item.r * 0.6 + 1} ${cy + item.r * 0.6 + 2.5}`}
                      stroke={item.color}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Empty state inside a circle */}
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
      <div className="px-4 py-2.5 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 opacity-60" style={{ borderColor: 'var(--np-blue)', backgroundColor: 'var(--np-blue)', opacity: 0.15 }} />
          <span className="border-2 rounded-full w-3 h-3" style={{ borderColor: 'var(--np-blue)' }} />
          Kreis (klicken zum Reinzoomen)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--np-blue)', opacity: 0.25 }} />
          Rolle (klicken zum Öffnen)
        </span>
      </div>
    </div>
  );
}
