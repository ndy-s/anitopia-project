import { createCanvas, loadImage, Image, SKRSContext2D } from "@napi-rs/canvas";
import * as path from "path";
import { drawPixelText, drawPixelTextCentered, measurePixelText } from "./pixelFont";
import { PIXEL } from "./pixelPalette";

const WIDTH = 760;
const HEADER_H = 76;
const GROUND_H = 46;
const SPRITE_SIZE = 96;
const SPRITE_GAP = 18;
const SCENE_PAD_TOP = 40;
const SCENE_PAD_BOTTOM = 26;
const HEIGHT = HEADER_H + SCENE_PAD_TOP + SPRITE_SIZE + SCENE_PAD_BOTTOM + GROUND_H;

const ELEMENT_ICON_DIR = path.join(__dirname, '..', 'public', 'icons', 'elements');

const elementIconCache = new Map<string, Promise<Image>>();

export interface BattleCharacterView {
    name: string;
    health: number;
    maxHealth: number;
    element: string;
    rarity: number;
    level: number;
    characterClass: string;
    activeSkillCooldown: number;
    activeSkillMaxCooldown: number;
}

export function resolveElementIconPath(element: string): string {
    return path.join(ELEMENT_ICON_DIR, `element-${element.toString().toLowerCase()}.png`);
}

function loadElementIcon(element: string): Promise<Image> {
    const key = element.toString().toLowerCase();

    if (elementIconCache.has(key)) {
        return elementIconCache.get(key) as Promise<Image>;
    }

    const promise = loadImage(resolveElementIconPath(element));
    elementIconCache.set(key, promise);
    return promise;
}

// Chunky pixel-art panel: solid fill + a hard-cornered border, no rounding, no gradients.
function drawPixelPanel(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, fill: string, borderColor: string, borderWidth: number) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = borderColor;
    ctx.fillRect(x, y, w, borderWidth);
    ctx.fillRect(x, y + h - borderWidth, w, borderWidth);
    ctx.fillRect(x, y, borderWidth, h);
    ctx.fillRect(x + w - borderWidth, y, borderWidth, h);
}

function wrapPixelText(text: string, maxWidth: number, pixelSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (measurePixelText(test, pixelSize) > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// Simple deterministic grass texture — fixed tick pattern, not randomized, so the ground doesn't
// visibly "flicker" between successive turn images even though each turn re-renders the full canvas.
function drawGround(ctx: SKRSContext2D, y: number) {
    ctx.fillStyle = PIXEL.grass;
    ctx.fillRect(0, y, WIDTH, GROUND_H);
    ctx.fillStyle = PIXEL.border;
    ctx.fillRect(0, y, WIDTH, 3);

    ctx.fillStyle = PIXEL.grassLight;
    const tickW = 10;
    for (let x = 4; x < WIDTH; x += tickW * 2) {
        const tickH = (x / tickW) % 3 === 0 ? 10 : 6;
        ctx.fillRect(x, y + 4, 4, tickH);
    }
}

function hpBarColor(pct: number): string {
    if (pct > 0.5) return PIXEL.verdigris;
    if (pct > 0.25) return PIXEL.amber;
    return PIXEL.ember;
}

async function drawSprite(
    ctx: SKRSContext2D,
    character: BattleCharacterView,
    x: number,
    groundY: number,
    isAttacker: boolean,
    isTarget: boolean,
    isSkillUser: boolean,
    isPassiveUser: boolean
) {
    const isDead = character.health <= 0;
    const y = groundY - SPRITE_SIZE / 2 + 4;
    const panelX = x - SPRITE_SIZE / 2;
    const panelY = y - SPRITE_SIZE / 2;

    ctx.save();
    ctx.globalAlpha = isDead ? 0.3 : 1;

    const stateColor = isSkillUser ? PIXEL.skillCyan : isAttacker ? PIXEL.gold : isTarget ? PIXEL.ember : PIXEL.border;
    drawPixelPanel(ctx, panelX, panelY, SPRITE_SIZE, SPRITE_SIZE, PIXEL.panel, PIXEL.border, 3);
    if (stateColor !== PIXEL.border) {
        ctx.strokeStyle = stateColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX + 4.5, panelY + 4.5, SPRITE_SIZE - 9, SPRITE_SIZE - 9);
    }

    const elementIcon = await loadElementIcon(character.element);
    const iconSize = SPRITE_SIZE - 22;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(elementIcon, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);

    if (isPassiveUser) {
        drawPixelPanel(ctx, panelX + SPRITE_SIZE - 20, panelY - 4, 22, 22, PIXEL.passiveViolet, PIXEL.border, 2);
    }

    ctx.restore();

    // A slim HP sliver under each sprite — enough to read team state from the image alone at a
    // glance; the precise numbers live in the embed text above, not duplicated here.
    const barW = SPRITE_SIZE;
    const barH = 6;
    const barX = x - barW / 2;
    const barY = groundY - 6;
    const pct = Math.min(1, Math.max(0, character.health) / character.maxHealth);

    ctx.fillStyle = '#2a1420';
    ctx.fillRect(barX, barY, barW, barH);
    if (pct > 0) {
        ctx.fillStyle = hpBarColor(pct);
        ctx.fillRect(barX, barY, Math.floor(barW * pct), barH);
    }
}

export interface RenderSceneOptions {
    teamA: BattleCharacterView[];
    teamB: BattleCharacterView[];
    sideALabel: string;
    sideBLabel: string;
    phase: 'intro' | 'turn' | 'result';
    turn?: number;
    attackerSide?: 'A' | 'B';
    attackerName?: string;
    targetName?: string;
    actionType?: 'attack' | 'active' | 'skipped';
    attackerPassive?: string | null;
    targetPassive?: string | null;
}

async function drawTeam(
    ctx: SKRSContext2D,
    team: BattleCharacterView[],
    anchorX: number,
    groundY: number,
    highlightAttacker?: string,
    highlightTarget?: string,
    isSkillTurn?: boolean,
    passiveUserNames?: string[]
) {
    const step = SPRITE_SIZE + SPRITE_GAP;
    const n = team.length;

    for (let i = 0; i < n; i++) {
        const character = team[i];
        const offset = (i - (n - 1) / 2) * step;
        const x = anchorX + offset;

        await drawSprite(
            ctx, character, x, groundY,
            character.name === highlightAttacker,
            character.name === highlightTarget,
            character.name === highlightAttacker && !!isSkillTurn,
            (passiveUserNames ?? []).includes(character.name)
        );
    }
}

export async function renderBattleScene(options: RenderSceneOptions): Promise<Buffer> {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = PIXEL.bg1;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const groundY = HEIGHT - GROUND_H;
    drawGround(ctx, groundY);

    const headerText = options.phase === 'intro' ? 'BATTLE START'
        : options.phase === 'result' ? 'BATTLE RESULT'
            : `TURN ${options.turn}`;
    drawPixelTextCentered(ctx, headerText, WIDTH / 2, 14, 5, PIXEL.gold);

    const sideALines = wrapPixelText(`A: ${options.sideALabel}`, 330, 1.5);
    const sideBLines = wrapPixelText(`B: ${options.sideBLabel}`, 330, 1.5);
    sideALines.forEach((line, i) => drawPixelText(ctx, line, 25, 58 + i * 16, 1.5, PIXEL.bone));
    sideBLines.forEach((line, i) => {
        const w = measurePixelText(line, 1.5);
        drawPixelText(ctx, line, WIDTH - 25 - w, 58 + i * 16, 1.5, PIXEL.bone);
    });

    const isSkillTurn = options.actionType === 'active';
    const attackerPassiveNamesA = options.attackerSide === 'A' && options.attackerPassive && options.attackerName ? [options.attackerName] : [];
    const attackerPassiveNamesB = options.attackerSide === 'B' && options.attackerPassive && options.attackerName ? [options.attackerName] : [];
    const targetPassiveNamesA = options.attackerSide === 'B' && options.targetPassive && options.targetName ? [options.targetName] : [];
    const targetPassiveNamesB = options.attackerSide === 'A' && options.targetPassive && options.targetName ? [options.targetName] : [];

    await drawTeam(
        ctx, options.teamA, 190, groundY,
        options.attackerSide === 'A' ? options.attackerName : undefined,
        options.attackerSide === 'B' ? options.targetName : undefined,
        isSkillTurn,
        [...attackerPassiveNamesA, ...targetPassiveNamesA]
    );
    await drawTeam(
        ctx, options.teamB, WIDTH - 190, groundY,
        options.attackerSide === 'B' ? options.attackerName : undefined,
        options.attackerSide === 'A' ? options.targetName : undefined,
        isSkillTurn,
        [...attackerPassiveNamesB, ...targetPassiveNamesB]
    );

    return canvas.toBuffer('image/png');
}
