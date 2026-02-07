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
 * Place items evenly on a ring, ensuring no overlap.
 * Returns the ring radius used (may be larger than requested if items are too big).
 */
function placeOnRing(
  items: { id: string; type: 'circle' | 'role'; r: number; label: string; color: string; icon?: string }[],
  preferredRingR: number,
  angleOffset: number
): LayoutItem[] {
  if (items.length === 0) return [];

  // Calculate minimum ring radius to prevent overlap
  // Adjacent items need: 2 * R * sin(π/N) >= 2 * maxR + gap
  const maxR = Math.max(...items.map(i => i.r));
  const gap = 6;
  const minRingR = items.length > 1
    ? (maxR + gap / 2) / Math.sin(Math.PI / items.length)
    : 0;
  const ringR = Math.max(preferredRingR, minRingR);

  return items.map((item, i) => {
    const angle = angleOffset + (2 * Math.PI * i) / items.length;
    return {
      ...item,
      x: items.length === 1 ? 0 : Math.cos(angle) * ringR,
      y: items.length === 1 ? 0 : Math.sin(angle) * ringR,
    };
  });
}

/**
 * Calculate layout positions for sub-circles and roles inside a container.
 * Sub-circles go on the main ring, roles on an inner ring.
 */
export function packCircles(
  containerR: number,
  subCircles: { id: string; name: string; color: string; icon?: string; weight: number }[],
  roles: { id: string; name: string }[],
  parentColor: string
): LayoutItem[] {
  const hasSubCircles = subCircles.length > 0;
  const hasRoles = roles.length > 0;

  // --- Sub-circle sizing ---
  // Uniform-ish size: scale slightly by weight but keep tight range
  const circleR = hasSubCircles
    ? Math.min(containerR * 0.22, containerR / (subCircles.length * 0.55 + 1))
    : 0;

  const circleItems = subCircles.map(c => ({
    id: c.id,
    type: 'circle' as const,
    r: circleR,
    label: c.name,
    color: c.color,
    icon: c.icon,
  }));

  // --- Role sizing ---
  const roleR = hasSubCircles
    ? Math.min(18, containerR * 0.07)  // small when alongside sub-circles
    : Math.min(containerR * 0.15, containerR / (roles.length * 0.5 + 1)); // larger when alone

  const roleItems = roles.map(r => ({
    id: r.id,
    type: 'role' as const,
    r: roleR,
    label: r.name,
    color: parentColor,
    icon: undefined,
  }));

  // --- Layout ---
  if (!hasSubCircles && !hasRoles) return [];

  // Only roles: single ring centered
  if (!hasSubCircles) {
    return placeOnRing(roleItems, containerR * 0.5, -Math.PI / 2);
  }

  // Only sub-circles: single ring
  if (!hasRoles) {
    return placeOnRing(circleItems, containerR * 0.55, -Math.PI / 2);
  }

  // Both: sub-circles on outer ring, roles on inner ring
  const outerRing = placeOnRing(circleItems, containerR * 0.58, -Math.PI / 2);
  // Offset roles to sit between sub-circles
  const roleAngleOffset = -Math.PI / 2 + Math.PI / Math.max(roles.length, subCircles.length);
  const innerRing = placeOnRing(roleItems, containerR * 0.22, roleAngleOffset);

  return [...outerRing, ...innerRing];
}

/**
 * Build a tree structure from flat circles and roles data.
 */
export function buildCircleTree(
  circles: { id: string; name: string; color?: string | null; icon?: string | null; parent_circle_id?: string | null }[],
  roles: { id: string; name: string; circle_id?: string; circle?: { id: string; name: string; color?: string | null; icon?: string | null } | null }[]
): CircleNode | null {
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
