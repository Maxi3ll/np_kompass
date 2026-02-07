// Circle-packing layout algorithm for GlassFrog-style visualization
// Organic "Best-Candidate + Relaxation" layout for natural-looking circle placement

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

// --- Seeded PRNG (mulberry32) ---
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

// --- Organic circle packing ---

interface PackItem {
  id: string;
  type: 'circle' | 'role';
  r: number;
  label: string;
  color: string;
  icon?: string;
  x: number;
  y: number;
}

/**
 * Place items organically inside a container circle using
 * best-candidate sampling + overlap relaxation.
 * Optionally avoids existing "obstacle" items (e.g. sub-circles when placing roles).
 */
function packOrganic(
  items: PackItem[],
  containerR: number,
  rng: () => number,
  obstacles: PackItem[] = []
): void {
  if (items.length === 0) return;

  // Single item: center it (but check for obstacles)
  if (items.length === 1 && obstacles.length === 0) {
    items[0].x = 0;
    items[0].y = 0;
    return;
  }

  // Sort largest first for better packing
  items.sort((a, b) => b.r - a.r);

  const placed: PackItem[] = [];

  for (const item of items) {
    let bestX = 0;
    let bestY = 0;
    let bestScore = -Infinity;
    const candidates = 60;

    for (let c = 0; c < candidates; c++) {
      const maxR = containerR - item.r - 4;
      if (maxR <= 0) {
        bestX = 0;
        bestY = 0;
        break;
      }
      const angle = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * maxR;
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist;

      // Min distance to already-placed items of same type
      let minDist = Infinity;
      for (const p of placed) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        const d = Math.sqrt(dx * dx + dy * dy) - p.r - item.r;
        minDist = Math.min(minDist, d);
      }

      // Min distance to obstacles (with extra gap to keep clear)
      const obstacleGap = 8;
      for (const o of obstacles) {
        const dx = cx - o.x;
        const dy = cy - o.y;
        const d = Math.sqrt(dx * dx + dy * dy) - o.r - item.r - obstacleGap;
        minDist = Math.min(minDist, d);
      }

      // Distance from container edge
      const edgeDist = containerR - Math.sqrt(cx * cx + cy * cy) - item.r;
      minDist = Math.min(minDist, edgeDist);

      if (minDist > bestScore) {
        bestScore = minDist;
        bestX = cx;
        bestY = cy;
      }
    }

    item.x = bestX;
    item.y = bestY;
    placed.push(item);
  }

  // --- Relaxation: resolve overlaps ---
  const gap = 5;
  const obstGap = 10;
  for (let iter = 0; iter < 5; iter++) {
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      // Push away from siblings
      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.r + b.r + gap;
        if (dist < minDist && dist > 0.01) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
      }
      // Push away from obstacles (obstacles don't move)
      for (const o of obstacles) {
        const dx = a.x - o.x;
        const dy = a.y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.r + o.r + obstGap;
        if (dist < minDist && dist > 0.01) {
          const push = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x += nx * push;
          a.y += ny * push;
        }
      }
      // Push back inside container
      const d = Math.sqrt(a.x * a.x + a.y * a.y);
      const maxDist = containerR - a.r - 2;
      if (d > maxDist && d > 0.01) {
        const scale = maxDist / d;
        a.x *= scale;
        a.y *= scale;
      }
    }
  }
}

/**
 * Calculate layout positions for sub-circles and roles inside a container.
 * Uses organic packing with weight-based sizing.
 */
export function packCircles(
  containerR: number,
  subCircles: { id: string; name: string; color: string; icon?: string; weight: number }[],
  roles: { id: string; name: string }[],
  parentColor: string
): LayoutItem[] {
  const hasSubCircles = subCircles.length > 0;
  const hasRoles = roles.length > 0;
  if (!hasSubCircles && !hasRoles) return [];

  // Seed based on all item IDs for deterministic layout
  const seedStr = [...subCircles.map(c => c.id), ...roles.map(r => r.id)].join(',');
  const rng = mulberry32(hashString(seedStr));

  // --- Sub-circle sizing: weight-based ---
  let circleItems: PackItem[] = [];
  if (hasSubCircles) {
    const totalWeight = subCircles.reduce((s, c) => s + c.weight, 0);
    const avgWeight = totalWeight / subCircles.length;
    // Base radius scales with how many items we need to fit
    const baseR = Math.min(
      containerR * 0.28,
      containerR / (Math.sqrt(subCircles.length) * 1.4 + 0.6)
    );

    circleItems = subCircles.map(c => {
      // Scale radius by weight ratio (clamped to avoid extremes)
      const wRatio = Math.max(0.7, Math.min(1.4, c.weight / avgWeight));
      return {
        id: c.id,
        type: 'circle' as const,
        r: baseR * wRatio,
        label: c.name,
        color: c.color,
        icon: c.icon,
        x: 0,
        y: 0,
      };
    });
  }

  // --- Role sizing ---
  let roleItems: PackItem[] = [];
  if (hasRoles) {
    const roleR = hasSubCircles
      ? Math.min(18, containerR * 0.07)
      : Math.min(containerR * 0.15, containerR / (Math.sqrt(roles.length) * 1.3 + 0.6));

    roleItems = roles.map(r => ({
      id: r.id,
      type: 'role' as const,
      r: roleR,
      label: r.name,
      color: parentColor,
      icon: undefined,
      x: 0,
      y: 0,
    }));
  }

  // --- Layout ---
  if (hasSubCircles && hasRoles) {
    // Pack sub-circles first
    packOrganic(circleItems, containerR * 0.92, rng);
    // Pack roles avoiding sub-circles — they'll cluster in gaps
    packOrganic(roleItems, containerR * 0.88, rng, circleItems);
  } else if (hasSubCircles) {
    packOrganic(circleItems, containerR * 0.92, rng);
  } else {
    packOrganic(roleItems, containerR * 0.75, rng);
  }

  return [...circleItems, ...roleItems].map(({ x, y, r, id, type, label, color, icon }) => ({
    id, type, x, y, r, label, color, icon,
  }));
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
