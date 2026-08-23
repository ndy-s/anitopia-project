/**
 * Regenerates the bot's brand mark (square icon + wide logo banner) in the pixel-art style, reusing the
 * same shape/font/palette system as the game icons. Not run at bot runtime — a checked-in dev tool, same
 * idea as generatePixelIcons.ts. Run with: pnpm exec tsx src/battle/generateBrandMark.ts
 *
 * Keeps the original mark's identity deliberately: gold "A" monogram, diagonal teal blade through it,
 * a small ruby gem accent, a dotted outer ring + thin inner ring, on the same navy background.
 */
import { createCanvas } from "@napi-rs/canvas";
import * as fs from "fs";
import * as path from "path";
import { makeGrid, unionCircle, unionPolyline, unionDiamond, unionRect, unionTriangleUp, subtractCircle, subtractGrid, rasterizeIcon, PixelGrid } from "./pixelShapes";
import { drawPixelText } from "./pixelFont";
import { PIXEL } from "./pixelPalette";

const PUBLIC_ROOT = path.join(__dirname, '..', 'public');

function unionRingDots(grid: PixelGrid, cx: number, cy: number, r: number, dotCount: number, dotHalfSize: number) {
    for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const dx = Math.round(cx + Math.cos(angle) * r);
        const dy = Math.round(cy + Math.sin(angle) * r);
        unionRect(grid, dx - dotHalfSize, dy - dotHalfSize, dx + dotHalfSize, dy + dotHalfSize);
    }
}

function drawSparkle(ctx: any, cx: number, cy: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - 1, cy - size, 2, size * 2);
    ctx.fillRect(cx - size, cy - 1, size * 2, 2);
}

/**
 * A bold triangular "A": outer triangle minus a smaller hollow triangle (stopped at the crossbar),
 * leaving a solid base below. Purpose-built for use as a large standalone emblem — the compact 5x7
 * bitmap font (pixelFont.ts) is designed for small inline text and its "A" has a flat 3-wide top rather
 * than a pointed apex, which reads fine at text scale but looked like an "H" blown up to icon size.
 */
function buildLetterA(size: number, cx: number, apexY: number, baseY: number, halfWidthAtBase: number, crossbarY: number, holeHalfWidthAtCrossbar: number): PixelGrid {
    const grid = makeGrid(size);
    unionTriangleUp(grid, cx, apexY, baseY, halfWidthAtBase);

    const hole = makeGrid(size);
    unionTriangleUp(hole, cx, apexY + 6, crossbarY, holeHalfWidthAtCrossbar);
    subtractGrid(grid, hole);

    return grid;
}

// --- Square icon (used as bot avatar reference + in-embed thumbnail: anitopia_icon.png) ---

const ICON_GRID = 60;
const ICON_PIXEL = 8;
const ICON_PX = ICON_GRID * ICON_PIXEL; // 480

function drawBrandMonogram(ctx: any, cx: number, cy: number, ringR: number, pixelSize: number) {
    const dotsGrid = makeGrid(ICON_GRID);
    unionRingDots(dotsGrid, cx, cy, ringR, 26, 1);
    rasterizeIcon(ctx, dotsGrid, 0, 0, pixelSize, PIXEL.gold, '#a6812e', PIXEL.border);

    const innerRingGrid = makeGrid(ICON_GRID);
    unionCircle(innerRingGrid, cx, cy, ringR - 9);
    subtractCircle(innerRingGrid, cx, cy, ringR - 10.5);
    rasterizeIcon(ctx, innerRingGrid, 0, 0, pixelSize, PIXEL.gold, '#a6812e', PIXEL.border);

    // Solid backing disc behind the letter — without this, the ring/blade show through the letter's
    // own hollow counter (the gap above an "A"'s crossbar) and it stops reading as a letter at all.
    const discGrid = makeGrid(ICON_GRID);
    unionCircle(discGrid, cx, cy, ringR - 10.5);
    rasterizeIcon(ctx, discGrid, 0, 0, pixelSize, PIXEL.panel, PIXEL.bg2, PIXEL.border);

    const bladeGrid = makeGrid(ICON_GRID);
    unionPolyline(bladeGrid, [[cx - (ringR - 12), cy + (ringR - 12)], [cx + (ringR - 12), cy - (ringR - 12)]], 2);
    rasterizeIcon(ctx, bladeGrid, 0, 0, pixelSize, PIXEL.verdigris, '#3f7a68', PIXEL.border);

    const apexY = cy - 15, baseY = cy + 17, crossbarY = cy + 3;
    const letterGrid = buildLetterA(ICON_GRID, cx, apexY, baseY, 15, crossbarY, 6);
    rasterizeIcon(ctx, letterGrid, 0, 0, pixelSize, PIXEL.gold, '#a6812e', PIXEL.border, 0.92);

    const gemGrid = makeGrid(ICON_GRID);
    unionDiamond(gemGrid, cx, crossbarY, 2.6);
    rasterizeIcon(ctx, gemGrid, 0, 0, pixelSize, PIXEL.ember, '#a83c30', PIXEL.border);

    drawSparkle(ctx, (cx - ringR + 6) * pixelSize, (cy - ringR + 10) * pixelSize, 5, PIXEL.gold);
    drawSparkle(ctx, (cx + ringR - 6) * pixelSize, (cy + ringR - 8) * pixelSize, 4, PIXEL.gold);
}

{
    const canvas = createCanvas(ICON_PX, ICON_PX);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PIXEL.bg1;
    ctx.fillRect(0, 0, ICON_PX, ICON_PX);

    drawBrandMonogram(ctx, 30, 30, 26, ICON_PIXEL);

    fs.writeFileSync(path.join(PUBLIC_ROOT, 'anitopia_icon.png'), canvas.toBuffer('image/png'));
    console.log('Wrote anitopia_icon.png');
}

// --- Wide banner logo (README hero image: anitopia_logo.png) ---

{
    const W = 1200, H = 360;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PIXEL.bg1;
    ctx.fillRect(0, 0, W, H);

    // Reuse the exact same monogram drawing logic at a smaller grid scale, offset into the left
    // third of the banner — this is what keeps the icon and the logo's mark visually identical.
    const markGrid = ICON_GRID;
    // Integer pixel size only — fillRect with fractional cell sizes (e.g. 4.2) leaves faint seams
    // between cells since imageSmoothingEnabled only affects drawImage scaling, not vector fills.
    const markPixel = 4; // 60 * 4 = 240px mark, comfortably inside the 360px-tall banner
    const markCanvas = createCanvas(markGrid * markPixel, markGrid * markPixel);
    const markCtx = markCanvas.getContext('2d');
    markCtx.imageSmoothingEnabled = false;

    drawBrandMonogram(markCtx, 30, 30, 26, markPixel);

    const markSize = markGrid * markPixel;
    ctx.drawImage(markCanvas, 54, (H - markSize) / 2, markSize, markSize);

    const textX = 54 + markSize + 40;
    drawPixelText(ctx, 'ANITOPIA', textX, 118, 9, PIXEL.gold);
    drawPixelText(ctx, 'SUMMON - BATTLE - COLLECT', textX + 4, 208, 3, PIXEL.verdigris);

    fs.writeFileSync(path.join(PUBLIC_ROOT, 'anitopia_logo.png'), canvas.toBuffer('image/png'));
    console.log('Wrote anitopia_logo.png');
}

console.log('Done regenerating brand mark.');
