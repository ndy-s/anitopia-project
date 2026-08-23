import { SKRSContext2D } from "@napi-rs/canvas";

// Grid-based pixel icon builder: fill a boolean mask with shape helpers, auto-outline, then rasterize.
// Used both by the one-off icon-generation script (src/battle/generatePixelIcons.ts) and anywhere the
// battle scene draws an icon directly on canvas.
export type PixelGrid = boolean[][];

export function makeGrid(size: number): PixelGrid {
    return Array.from({ length: size }, () => new Array(size).fill(false));
}

export function unionCircle(grid: PixelGrid, cx: number, cy: number, r: number): void {
    const size = grid.length;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - cx, dy = y - cy;
            if (dx * dx + dy * dy <= r * r) grid[y][x] = true;
        }
    }
}

export function unionTriangleUp(grid: PixelGrid, cx: number, topY: number, bottomY: number, halfWidthAtBottom: number): void {
    const size = grid.length;
    const h = bottomY - topY;
    for (let y = topY; y <= bottomY; y++) {
        const t = (y - topY) / h;
        const halfW = halfWidthAtBottom * t;
        for (let x = 0; x < size; x++) {
            if (Math.abs(x - cx) <= halfW) grid[y][x] = true;
        }
    }
}

export function unionDiamond(grid: PixelGrid, cx: number, cy: number, r: number): void {
    const size = grid.length;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (Math.abs(x - cx) + Math.abs(y - cy) <= r) grid[y][x] = true;
        }
    }
}

export function unionRect(grid: PixelGrid, x0: number, y0: number, x1: number, y1: number): void {
    const size = grid.length;
    for (let y = Math.max(0, y0); y <= Math.min(size - 1, y1); y++) {
        for (let x = Math.max(0, x0); x <= Math.min(size - 1, x1); x++) {
            grid[y][x] = true;
        }
    }
}

export function unionPolyline(grid: PixelGrid, points: [number, number][], thickness: number): void {
    const size = grid.length;
    for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[i + 1];
        const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 4 + 1;
        for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const x = Math.round(x0 + (x1 - x0) * t);
            const y = Math.round(y0 + (y1 - y0) * t);
            for (let oy = -thickness; oy <= thickness; oy++) {
                for (let ox = -thickness; ox <= thickness; ox++) {
                    const gx = x + ox, gy = y + oy;
                    if (gy >= 0 && gy < size && gx >= 0 && gx < size) grid[gy][gx] = true;
                }
            }
        }
    }
}

export function subtractGrid(grid: PixelGrid, other: PixelGrid): void {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid.length; x++) {
            if (other[y][x]) grid[y][x] = false;
        }
    }
}

export function subtractCircle(grid: PixelGrid, cx: number, cy: number, r: number): void {
    const size = grid.length;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - cx, dy = y - cy;
            if (dx * dx + dy * dy <= r * r) grid[y][x] = false;
        }
    }
}

function computeOutline(grid: PixelGrid): PixelGrid {
    const size = grid.length;
    const outline = makeGrid(size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x]) continue;
            const neighbors: [number, number][] = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx]) {
                    outline[y][x] = true;
                    break;
                }
            }
        }
    }
    return outline;
}

/**
 * Rasterizes a grid: filled cells painted fillColor (top ~55%) / shadeColor (bottom, simple pseudo-light
 * from above), a 1px auto-generated outline in outlineColor. `pixelSize` is the on-canvas size of one
 * grid cell — always draw with ctx.imageSmoothingEnabled = false upstream for crisp edges.
 */
export function rasterizeIcon(
    ctx: SKRSContext2D,
    grid: PixelGrid,
    originX: number,
    originY: number,
    pixelSize: number,
    fillColor: string,
    shadeColor: string,
    outlineColor: string = '#000000',
    shadeThreshold: number = 0.55
): void {
    const size = grid.length;
    const outline = computeOutline(grid);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = y > size * shadeThreshold ? shadeColor : fillColor;
                ctx.fillRect(originX + x * pixelSize, originY + y * pixelSize, pixelSize, pixelSize);
            } else if (outline[y][x]) {
                ctx.fillStyle = outlineColor;
                ctx.fillRect(originX + x * pixelSize, originY + y * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}
