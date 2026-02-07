// Circle-packing layout algorithm for GlassFrog-style visualization
// Positions sub-circles and roles within a parent circle using ring-based layout

export interface LayoutItem {
  id: string;
  type: 'circle' | 'role';
  x: number;
  y: number;
  r: number;
  label: string;
  color: string;
  icon?: string;
}

export interface CircleNode {
  id: string;
  name: string;
  color: string;
  icon?: string;
  children: CircleNode[];
  roles: { id: string; name: string }[];
}

/**
 * Calculate layout positions for items inside a container circle.
 * Uses ring-based placement: items are distributed evenly around rings.
 *
 * @param containerR - Radius of the container circle
 * @param items - Items to position (sub-circles + roles)
 * @returns Positioned items with x,y relative to container center (0,0)
 */
export function packCircles(
  containerR: number,
  subCircles: { id: string; name: string; color: string; icon?: string; weight: number }[],
  roles: { id: string; name: string }[],
  parentColor: string
): LayoutItem[] {
  const results: LayoutItem[] = [];
  const allItems = [
    ...subCircles.map(c => ({ ...c, type: 'circle' as const })),
    ...roles.map(r => ({ ...r, type: 'role' as const, color: parentColor, weight: 1, icon: undefined })),
  ];

  if (allItems.length === 0) return results;

  // Calculate radii for sub-circles based on weight (sqrt scaling)
  const maxWeight = Math.max(...allItems.map(i => i.weight), 1);
  const minItemR = containerR * 0.08;
  const maxItemR = containerR * 0.28;

  function itemRadius(item: typeof allItems[number]): number {
    if (item.type === 'role') return minItemR;
    const normalized = Math.sqrt(item.weight / maxWeight);
    return minItemR + (maxItemR - minItemR) * Math.max(normalized, 0.4);
  }

  // Single item: center
  if (allItems.length === 1) {
    const item = allItems[0];
    const r = itemRadius(item);
    results.push({
      id: item.id,
      type: item.type,
      x: 0,
      y: 0,
      r,
      label: item.type === 'circle' ? item.name : item.name,
      color: item.color,
      icon: item.icon,
    });
    return results;
  }

  // Place items in rings
  // Ring 1: up to 6 items, Ring 2: remaining items
  const ring1Count = Math.min(allItems.length, allItems.length <= 8 ? allItems.length : 6);
  const ring1Items = allItems.slice(0, ring1Count);
  const ring2Items = allItems.slice(ring1Count);

  // Ring 1 radius: items sit at ~55% of container radius
  const ring1R = containerR * 0.50;
  // Ring 2 radius: items sit at ~82% of container radius
  const ring2R = containerR * 0.80;

  // Place ring 1
  const angleOffset1 = -Math.PI / 2; // Start from top
  for (let i = 0; i < ring1Items.length; i++) {
    const item = ring1Items[i];
    const angle = angleOffset1 + (2 * Math.PI * i) / ring1Items.length;
    const r = itemRadius(item);
    results.push({
      id: item.id,
      type: item.type,
      x: Math.cos(angle) * ring1R,
      y: Math.sin(angle) * ring1R,
      r,
      label: item.name,
      color: item.color,
      icon: item.icon,
    });
  }

  // Place ring 2
  if (ring2Items.length > 0) {
    const angleOffset2 = -Math.PI / 2 + Math.PI / ring2Items.length; // Offset to stagger
    for (let i = 0; i < ring2Items.length; i++) {
      const item = ring2Items[i];
      const angle = angleOffset2 + (2 * Math.PI * i) / ring2Items.length;
      const r = itemRadius(item);
      results.push({
        id: item.id,
        type: item.type,
        x: Math.cos(angle) * ring2R,
        y: Math.sin(angle) * ring2R,
        r,
        label: item.name,
        color: item.color,
        icon: item.icon,
      });
    }
  }

  return results;
}

/**
 * Build a tree structure from flat circles and roles data.
 */
export function buildCircleTree(
  circles: { id: string; name: string; color?: string | null; icon?: string | null; parent_circle_id?: string | null }[],
  roles: { id: string; name: string; circle_id?: string; circle?: { id: string; name: string; color?: string | null; icon?: string | null } | null }[]
): CircleNode | null {
  // Find root (Anker-Kreis = no parent)
  const root = circles.find(c => !c.parent_circle_id);
  if (!root) return null;

  function buildNode(circle: typeof circles[number]): CircleNode {
    const children = circles
      .filter(c => c.parent_circle_id === circle.id)
      .map(c => buildNode(c));

    const circleRoles = roles
      .filter(r => {
        const cId = r.circle_id || r.circle?.id;
        return cId === circle.id;
      })
      .map(r => ({ id: r.id, name: r.name }));

    return {
      id: circle.id,
      name: circle.name,
      color: circle.color || '#4A90D9',
      icon: circle.icon || undefined,
      children,
      roles: circleRoles,
    };
  }

  return buildNode(root);
}
