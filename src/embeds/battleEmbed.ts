import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { BattleTurnEvent, BattleResult } from "../battle/runBattle";
import { renderBattleScene, BattleCharacterView } from "../battle/renderBattleScene";
import { RARITY_STAR_COUNT } from "../battle/pixelPalette";
import { getElementEmoji, getClassEmoji } from "../utils";
import { getAppEmojiMention } from "../lib/appEmojis";

const SCENE_FILENAME = 'battle-scene.png';
const HP_BAR_SEGMENTS = 12;
const SKILL_GAUGE_SEGMENTS = 8;

function heartEmoji(health: number): string {
    if (health <= 0) return getAppEmojiMention('heart_broken') || '💔';
    return getAppEmojiMention('heart') || '❤️';
}

async function sceneAttachment(buffer: Buffer): Promise<AttachmentBuilder> {
    return new AttachmentBuilder(buffer, { name: SCENE_FILENAME });
}

function hpBar(health: number, maxHealth: number): string {
    const pct = Math.min(1, Math.max(0, health) / maxHealth);
    const filled = Math.round(HP_BAR_SEGMENTS * pct);
    return '█'.repeat(filled) + '░'.repeat(HP_BAR_SEGMENTS - filled);
}

// Deliberately a different glyph from the HP bar (▰/▱ diamonds vs █/░ blocks) and a shorter length,
// so the two gauges read as distinct at a glance even though both are plain text. Full = skill ready.
// Always at least 1 segment filled, even right after using the skill (cooldown === maxCooldown) — a
// bar that's 100% one repeated glyph is what triggers Discord's "jumbo" (oversized) rendering, so a
// fully-empty gauge is the one state we never want to produce, not just the fully-full one.
function skillGauge(cooldown: number, maxCooldown: number): string {
    const filled = maxCooldown <= 0
        ? SKILL_GAUGE_SEGMENTS
        : Math.max(1, Math.round(SKILL_GAUGE_SEGMENTS * (maxCooldown - cooldown) / maxCooldown));
    return '▰'.repeat(filled) + '▱'.repeat(SKILL_GAUGE_SEGMENTS - filled);
}

function rarityStars(rarity: number): string {
    const filled = RARITY_STAR_COUNT[rarity] ?? 1;
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function buildTeamFieldValue(team: BattleCharacterView[]): string {
    return team.map((character) => {
        const hpText = `${Math.max(0, Math.ceil(character.health))}/${Math.ceil(character.maxHealth)}`;

        return [
            `**${character.name}** LV.${character.level} ${getClassEmoji(character.characterClass)} ${getElementEmoji(character.element)}`,
            rarityStars(character.rarity),
            `${hpText} ${heartEmoji(character.health)}`,
            hpBar(character.health, character.maxHealth),
            // Leading non-breaking space (U+00A0 — a plain ASCII space gets trimmed by Discord's
            // markdown renderer, so it wouldn't survive) as a default lead-in before the gauge.
            ` ${skillGauge(character.activeSkillCooldown, character.activeSkillMaxCooldown)}`,
        ].join('\n');
    }).join('\n\n');
}

export async function buildBattleIntroEmbed(teamA: BattleCharacterView[], teamB: BattleCharacterView[], sideALabel: string, sideBLabel: string) {
    const buffer = await renderBattleScene({ teamA, teamB, sideALabel, sideBLabel, phase: 'intro' });

    const embed = new EmbedBuilder()
        .setColor('Blurple')
        .setTitle('⚔️ Battle Start')
        .addFields(
            { name: sideALabel, value: buildTeamFieldValue(teamA), inline: true },
            { name: sideBLabel, value: buildTeamFieldValue(teamB), inline: true },
            { name: '[Battle Log]', value: 'Let the fight begin!', inline: false },
        )
        .setImage(`attachment://${SCENE_FILENAME}`);

    return { embed, files: [await sceneAttachment(buffer)] };
}

export async function buildBattleTurnEmbed(event: BattleTurnEvent, sideALabel: string, sideBLabel: string) {
    const missed = event.damage === 0;
    const isSkill = event.actionType === 'active' && event.skillName;

    const buffer = await renderBattleScene({
        teamA: event.teamA,
        teamB: event.teamB,
        sideALabel,
        sideBLabel,
        phase: 'turn',
        turn: event.turn,
        attackerSide: event.attackerSide,
        attackerName: event.attackerName,
        targetName: event.targetName,
        actionType: event.actionType,
        attackerPassive: event.attackerPassive,
        targetPassive: event.targetPassive,
    });

    const attackerTeamTag = event.attackerSide === 'A' ? sideALabel : sideBLabel;
    const targetTeamTag = event.attackerSide === 'A' ? sideBLabel : sideALabel;
    const attackerTag = `**${event.attackerName}** (${attackerTeamTag})`;
    const targetTag = `**${event.targetName}** (${targetTeamTag})`;

    const lines: string[] = [];

    if (event.actionType === 'skipped') {
        const skipText = event.skillName === 'Freeze' ? 'is frozen solid and can\'t move'
            : event.skillName === 'Sleep' ? 'is fast asleep and can\'t move'
            : 'is paralyzed and can\'t move';
        lines.push(`❄️ ${attackerTag} ${skipText}!`);
    } else {
        lines.push(
            isSkill
                ? (missed
                    ? `🔸 ${attackerTag} uses *${event.skillName}* on ${targetTag}, but it fails!`
                    : `🔸 ${attackerTag} uses *${event.skillName}* on ${targetTag} for **${event.damage}** damage!`)
                : (missed
                    ? `🔸 ${attackerTag} attacks ${targetTag}, but misses!`
                    : `🔸 ${attackerTag} attacks ${targetTag} for **${event.damage}** damage!`)
        );
        for (const summary of event.activeEffectSummary) lines.push(`  ↳ ${summary}`);

        if (event.attackerPassive) {
            lines.push(`🔹 ${attackerTag}'s passive *${event.attackerPassive}* activates!`);
            for (const summary of event.attackerPassiveEffectSummary) lines.push(`  ↳ ${summary}`);
        }
        if (event.targetPassive) {
            lines.push(`🔹 ${targetTag}'s passive *${event.targetPassive}* activates!`);
            for (const summary of event.targetPassiveEffectSummary) lines.push(`  ↳ ${summary}`);
        }
    }

    const embed = new EmbedBuilder()
        .setColor(isSkill ? '#6fd8e8' : 'Blurple')
        .setTitle(`[Turn ${event.turn}]`)
        .addFields(
            { name: sideALabel, value: buildTeamFieldValue(event.teamA), inline: true },
            { name: sideBLabel, value: buildTeamFieldValue(event.teamB), inline: true },
            { name: '[Battle Log]', value: lines.join('\n'), inline: false },
        )
        .setImage(`attachment://${SCENE_FILENAME}`);

    return { embed, files: [await sceneAttachment(buffer)] };
}

export async function buildBattleResultEmbed(result: BattleResult, teamA: BattleCharacterView[], teamB: BattleCharacterView[], sideALabel: string, sideBLabel: string) {
    const resultText = result === 'A'
        ? `🏆 **${sideALabel}** wins the battle!`
        : result === 'B'
            ? `🏆 **${sideBLabel}** wins the battle!`
            : `🤝 It's a **draw**! Neither side could finish the fight.`;

    const buffer = await renderBattleScene({
        teamA, teamB, sideALabel, sideBLabel,
        phase: 'result',
    });

    const embed = new EmbedBuilder()
        .setColor(result === 'draw' ? 'Grey' : 'Gold')
        .setTitle('Battle Result')
        .setDescription(resultText)
        .addFields(
            { name: sideALabel, value: buildTeamFieldValue(teamA), inline: true },
            { name: sideBLabel, value: buildTeamFieldValue(teamB), inline: true },
        )
        .setImage(`attachment://${SCENE_FILENAME}`);

    return { embed, files: [await sceneAttachment(buffer)] };
}
