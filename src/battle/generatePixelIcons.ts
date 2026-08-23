/**
 * Regenerates every game icon (elements, rarity, currency, scrolls) in the pixel-art style. Not run at
 * bot runtime — a checked-in dev tool, same idea as seed.ts, so the icon set can be tweaked later without
 * rebuilding the whole pixel-art pipeline from scratch. Run with: pnpm exec tsx src/battle/generatePixelIcons.ts
 */
import { createCanvas } from "@napi-rs/canvas";
import * as fs from "fs";
import * as path from "path";
import { makeGrid, unionCircle, unionTriangleUp, unionDiamond, unionPolyline, unionRect, subtractCircle, subtractGrid, rasterizeIcon, PixelGrid } from "./pixelShapes";
import { ELEMENT_COLOR, CLASS_COLOR, RARITY_COLOR, RARITY_STAR_COUNT, PIXEL } from "./pixelPalette";

const GRID_SIZE = 20;
const PIXEL_SIZE = 7;
const ICON_PX = GRID_SIZE * PIXEL_SIZE; // 140x140 output

const ICONS_ROOT = path.join(__dirname, '..', 'public', 'icons');

function renderIcon(build: (grid: PixelGrid) => void, fill: string, shade: string, bgColor?: string): Buffer {
    const canvas = createCanvas(ICON_PX, ICON_PX);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ICON_PX, ICON_PX);
    }

    const grid = makeGrid(GRID_SIZE);
    build(grid);
    rasterizeIcon(ctx, grid, 0, 0, PIXEL_SIZE, fill, shade, PIXEL.border);

    return canvas.toBuffer('image/png');
}

function writeIcon(buffer: Buffer, ...segments: string[]) {
    const targetPath = path.join(ICONS_ROOT, ...segments);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, buffer);
    console.log(`Wrote ${targetPath}`);
}

// --- Elements ---

const elementBuilders: Record<string, (grid: PixelGrid) => void> = {
    pyro: (g) => unionTriangleUp(g, 10, 2, 17, 7),
    aqua: (g) => { unionTriangleUp(g, 10, 2, 12, 5); unionCircle(g, 10, 13, 6); },
    volt: (g) => unionPolyline(g, [[13, 1], [6, 10], [11, 10], [5, 18]], 1),
    terra: (g) => unionTriangleUp(g, 10, 3, 17, 8),
    aero: (g) => {
        unionPolyline(g, [[2, 5], [10, 5], [15, 2]], 0);
        unionPolyline(g, [[2, 10], [13, 10], [18, 7]], 0);
        unionPolyline(g, [[2, 15], [9, 15], [14, 12]], 0);
    },
    lumen: (g) => {
        unionCircle(g, 10, 10, 5);
        unionPolyline(g, [[10, 1], [10, 3]], 1);
        unionPolyline(g, [[10, 17], [10, 19]], 1);
        unionPolyline(g, [[1, 10], [3, 10]], 1);
        unionPolyline(g, [[17, 10], [19, 10]], 1);
        unionPolyline(g, [[3, 3], [5, 5]], 1);
        unionPolyline(g, [[15, 15], [17, 17]], 1);
        unionPolyline(g, [[17, 3], [15, 5]], 1);
        unionPolyline(g, [[3, 17], [5, 15]], 1);
    },
    shade: (g) => { unionCircle(g, 9, 10, 7); subtractCircle(g, 13, 7, 6); },
    neutralis: (g) => { unionCircle(g, 10, 10, 8); subtractCircle(g, 10, 10, 5); },
};

for (const [key, builder] of Object.entries(elementBuilders)) {
    const palette = ELEMENT_COLOR[key];
    const buffer = renderIcon(builder, palette.fill, palette.shade);
    writeIcon(buffer, 'elements', `element-${key}.png`);
}

// --- Classes: silhouettes chosen to stay legible at icon scale and to avoid echoing an element
// shape (Mage avoids a plain triangle since Pyro/Terra already use one; Support avoids a heart since
// that's reserved for the battle embed's HP indicator) ---

const classBuilders: Record<string, (grid: PixelGrid) => void> = {
    // Sword: pointed tip, slim blade, narrow crossguard, handle, pommel — kept slim throughout so it
    // reads as a blade rather than a plus-sign.
    warrior: (g) => {
        unionTriangleUp(g, 10, 1, 5, 1.5);
        unionRect(g, 9, 5, 11, 12);
        unionRect(g, 6, 12, 14, 13);
        unionRect(g, 9, 14, 11, 17);
        unionCircle(g, 10, 18, 1.5);
    },
    // Wand: thin diagonal shaft with a clearly bulbous orb at the tip — the orb needs to be visibly
    // wider than the shaft or the two blend into one same-colored diagonal bar.
    mage: (g) => {
        unionPolyline(g, [[5, 17], [14, 4]], 0);
        unionCircle(g, 15, 3, 3);
    },
    // Shield: rounded shoulders, rectangular body, tapering to a point at the base.
    tank: (g) => {
        unionCircle(g, 10, 6, 6);
        unionRect(g, 4, 6, 16, 13);
        for (let y = 13; y <= 18; y++) {
            const t = (y - 13) / 5;
            const halfW = 6 * (1 - t);
            for (let x = 0; x < 20; x++) {
                if (Math.abs(x - 10) <= halfW) g[y][x] = true;
            }
        }
    },
    // Bow (left-side arc) with a straight arrow through the middle and a diamond arrowhead.
    hunter: (g) => {
        for (let y = 2; y <= 18; y++) {
            for (let x = 0; x < 20; x++) {
                const dx = x - 8, dy = y - 10;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist >= 7 && dist <= 8.5 && x <= 10) g[y][x] = true;
            }
        }
        unionPolyline(g, [[3, 10], [17, 10]], 0);
        unionDiamond(g, 17, 10, 2);
    },
    // Plus/cross: the classic support-role symbol, distinct from the HP heart used elsewhere.
    support: (g) => {
        unionRect(g, 8, 3, 12, 17);
        unionRect(g, 3, 8, 17, 12);
    },
};

for (const [key, builder] of Object.entries(classBuilders)) {
    const palette = CLASS_COLOR[key];
    const buffer = renderIcon(builder, palette.fill, palette.shade);
    writeIcon(buffer, 'classes', `class-${key}.png`);
}

// --- HP heart: two lobes bridged by a rect, tapering to a point at the base. The broken variant
// reuses the same silhouette with a jagged crack subtracted down the middle, in a grayed-out palette
// so it reads as "drained" at a glance next to the vibrant red full heart. ---

function buildHeart(g: PixelGrid): void {
    unionCircle(g, 6, 7, 4);
    unionCircle(g, 14, 7, 4);
    unionRect(g, 3, 7, 17, 11);
    for (let y = 11; y <= 17; y++) {
        const t = (y - 11) / 6;
        const halfW = 8 * (1 - t);
        for (let x = 0; x < 20; x++) {
            if (Math.abs(x - 10) <= halfW) g[y][x] = true;
        }
    }
}

{
    const buffer = renderIcon(buildHeart, '#ff4d5e', '#a01f2e');
    writeIcon(buffer, 'misc', 'heart.png');
}
{
    const buffer = renderIcon((g) => {
        buildHeart(g);
        const crack = makeGrid(GRID_SIZE);
        unionPolyline(crack, [[10, 2], [8, 7], [12, 10], [8, 14], [10, 18]], 1);
        subtractGrid(g, crack);
    }, '#7a7a8c', '#3f3f4d');
    writeIcon(buffer, 'misc', 'heart-broken.png');
}

// --- Rarity badges: diamond gem shape + star-count pips drawn beneath ---

const RARITY_NAME: Record<number, string> = { 1: 'legendary', 2: 'epic', 3: 'rare', 4: 'uncommon', 5: 'common' };

for (const rarity of [1, 2, 3, 4, 5]) {
    const color = RARITY_COLOR[rarity];
    const canvas = createCanvas(ICON_PX, ICON_PX);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const grid = makeGrid(GRID_SIZE);
    unionDiamond(grid, 10, 7, 6);
    rasterizeIcon(ctx, grid, 0, 0, PIXEL_SIZE, color, PIXEL.bg2, PIXEL.border);

    const starCount = RARITY_STAR_COUNT[rarity];
    const pipSize = 12;
    const pipGap = 6;
    const totalWidth = starCount * pipSize + (starCount - 1) * pipGap;
    let pipX = (ICON_PX - totalWidth) / 2;
    const pipY = ICON_PX - 34;
    for (let i = 0; i < starCount; i++) {
        ctx.fillStyle = PIXEL.border;
        ctx.fillRect(pipX - 2, pipY - 2, pipSize + 4, pipSize + 4);
        ctx.fillStyle = PIXEL.gold;
        ctx.fillRect(pipX, pipY, pipSize, pipSize);
        pipX += pipSize + pipGap;
    }

    writeIcon(canvas.toBuffer('image/png'), 'rarity', `rarity-${RARITY_NAME[rarity]}.png`);
}

// --- Currency ---

{
    const buffer = renderIcon((g) => {
        unionCircle(g, 10, 10, 8);
        subtractCircle(g, 10, 10, 6.5);
        unionRect(g, 9, 4, 10, 16);
        unionRect(g, 4, 9, 16, 10);
    }, PIXEL.gold, '#a67c2e');
    writeIcon(buffer, 'currency', 'currency-anicoin.png');
}
{
    const buffer = renderIcon((g) => unionDiamond(g, 10, 10, 8), PIXEL.skillCyan, '#2f7d8a');
    writeIcon(buffer, 'currency', 'currency-anicrystal.png');
}

// --- Scrolls ---

const scrollBuilders: [string, string, string][] = [
    ['scroll_novice', '#c9a876', '#8a6b3f'],
    ['scroll_elite', '#b9c4d6', '#5f6c80'],
    ['scroll_series', '#e8c878', '#a97bf0'],
];

for (const [filename, fill, shade] of scrollBuilders) {
    const buffer = renderIcon((g) => {
        unionRect(g, 5, 3, 14, 16);
        unionCircle(g, 9, 3, 4);
        unionCircle(g, 9, 16, 4);
    }, fill, shade);
    writeIcon(buffer, 'scrolls', `${filename}.png`);
}

console.log('Done regenerating pixel icons.');
