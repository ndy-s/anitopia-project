import { Character, PARALYSIS_SKIP_CHANCE, SLEEP_SELF_WAKE_CHANCE, ATTRIBUTE_PROPERTY_ALIASES } from "../classes/Character";
import { Team } from "../classes/Team";
import { BattleCharacterView } from "./renderBattleScene";

export interface BattleTurnEvent {
    turn: number;
    attackerSide: 'A' | 'B';
    attackerName: string;
    targetName: string;
    damage: number;
    actionType: 'attack' | 'active' | 'skipped';
    skillName: string | null;
    activeEffectSummary: string[];
    attackerPassive: string | null;
    attackerPassiveEffectSummary: string[];
    targetPassive: string | null;
    targetPassiveEffectSummary: string[];
    teamA: BattleCharacterView[];
    teamB: BattleCharacterView[];
}

export type BattleResult = 'A' | 'B' | 'draw';

export interface BattleOutcome {
    result: BattleResult;
    turns: BattleTurnEvent[];
}

const MAX_TURNS = 50;
const TURN_DELAY_MS = 2_500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function snapshotTeam(team: Character[]): BattleCharacterView[] {
    return team.map((character) => ({
        name: character.name,
        health: character.health,
        maxHealth: character.maxHealth,
        element: character.element.toString(),
        rarity: character.rarity,
        level: character.level,
        characterClass: character.characterClass,
        activeSkillCooldown: character.activeSkillCooldown,
        activeSkillMaxCooldown: character.activeSkill.cooldown ?? 0,
    }));
}

// Tank class identity: alive Tanks draw single-target selection (basic attacks and Single-target
// skills) ahead of the rest of the team. Highest/Lowest Health/Random/Area targeting intentionally
// bypasses this — taunt only redirects "pick someone" attacks, not utility/nuke skills.
function pickPrimaryTarget(entities: Character[]): Character | undefined {
    const alive = entities.filter((entity) => entity.health > 0);
    const tank = alive.find((entity) => entity.characterClass === 'Tank');
    return tank ?? alive[0];
}

function activatePassive(character: Character, enemies: Character[], allies: Character[]) {
    const target = pickPrimaryTarget(enemies);
    if (target) character.activateSkill(target, enemies, character, allies, 'passive');
}

export async function runBattle(
    teamA: Team,
    teamB: Team,
    onTurn: (event: BattleTurnEvent) => Promise<void>
): Promise<BattleOutcome> {
    const charactersA = teamA.members;
    const charactersB = teamB.members;
    const allCharacters = [...charactersA, ...charactersB];
    const turns: BattleTurnEvent[] = [];

    let turn = 0;

    while (!teamA.isDefeated() && !teamB.isDefeated() && turn < MAX_TURNS) {
        turn++;

        allCharacters.sort((a, b) => {
            if (a.speed === b.speed) return 0.5 - Math.random();
            return b.speed - a.speed;
        });

        for (const character of allCharacters) {
            if (character.health <= 0) continue;

            character.status = character.status.filter((stat) => {
                if (stat.type === 'Bleed' || stat.type === 'Poison') {
                    if (stat.duration === 0) return false;

                    const reductionValue = Math.ceil(character.maxHealth * stat.value);
                    character.health -= reductionValue;
                    stat.duration--;
                    return true;
                } else if (stat.type === 'Burn') {
                    if (stat.duration === 0) return false;

                    character.health -= stat.value;
                    stat.duration--;
                    return true;
                } else if (stat.type === 'Buff' || stat.type === 'Debuff') {
                    if (stat.duration === 0) {
                        const attribute = ATTRIBUTE_PROPERTY_ALIASES[stat.attribute.toLowerCase()] ?? stat.attribute.toLowerCase();
                        const change = stat.type === 'Buff' ? -stat.value : stat.value;

                        (character as any)[attribute] += change;
                        (character as any)[attribute] = +(character as any)[attribute].toFixed(3);
                        return false;
                    }
                    stat.duration--;
                } else if (stat.type === 'Paralysis') {
                    if (stat.duration === 0) {
                        character.speed += stat.value;
                        character.speed = +character.speed.toFixed(3);
                        return false;
                    }
                    stat.duration--;
                } else if (stat.type === 'Shield') {
                    if (stat.duration === 0) {
                        character.damageReduction = Math.max(0, character.damageReduction - stat.value);
                        return false;
                    }
                    stat.duration--;
                } else if (stat.type === 'Time Bomb') {
                    if (stat.duration === 0) {
                        character.health -= stat.value;
                        return false;
                    }
                    stat.duration--;
                } else if (stat.type === 'Freeze' || stat.type === 'Sleep' || stat.type === 'Silence' || stat.type === 'Aegis' || stat.type === 'Double Attack') {
                    if (stat.duration === 0) return false;
                    stat.duration--;
                }
                return true;
            });

            if (character.health <= 0) continue;

            const isTeamA = teamA.hasMember(character);
            const allies = isTeamA ? charactersA : charactersB;
            const enemies = isTeamA ? charactersB : charactersA;

            const isFrozen = character.status.some((stat) => stat.type === 'Freeze');
            let isAsleep = character.status.some((stat) => stat.type === 'Sleep');
            if (isAsleep && Math.random() <= SLEEP_SELF_WAKE_CHANCE) {
                character.status = character.status.filter((stat) => stat.type !== 'Sleep');
                isAsleep = false;
            }
            const isParalyzed = character.status.some((stat) => stat.type === 'Paralysis') && Math.random() <= PARALYSIS_SKIP_CHANCE;

            if (isFrozen || isAsleep || isParalyzed) {
                const skipReason = isFrozen ? 'Freeze' : isAsleep ? 'Sleep' : 'Paralysis';

                const skipEvent: BattleTurnEvent = {
                    turn,
                    attackerSide: isTeamA ? 'A' : 'B',
                    attackerName: character.name,
                    targetName: character.name,
                    damage: 0,
                    actionType: 'skipped',
                    skillName: skipReason,
                    activeEffectSummary: [],
                    attackerPassive: null,
                    attackerPassiveEffectSummary: [],
                    targetPassive: null,
                    targetPassiveEffectSummary: [],
                    teamA: snapshotTeam(charactersA),
                    teamB: snapshotTeam(charactersB),
                };

                turns.push(skipEvent);
                await onTurn(skipEvent);
                continue;
            }

            character.lastPassiveTriggered = null;
            character.lastActiveEffectSummary = [];
            character.lastPassiveEffectSummary = [];

            switch (character.passiveSkill.trigger) {
                case 'Battle Start':
                    if (turn === 1) activatePassive(character, enemies, allies);
                    break;
                case 'Each Turn':
                    activatePassive(character, enemies, allies);
                    break;
                case 'Health -50%':
                    if (character.health <= 0.5 * character.maxHealth && !character.isPassiveSkillActive) {
                        activatePassive(character, enemies, allies);
                        character.isPassiveSkillActive = true;
                    }
                    break;
                case 'Health -25%':
                    if (character.health <= 0.25 * character.maxHealth && !character.isPassiveSkillActive) {
                        activatePassive(character, enemies, allies);
                        character.isPassiveSkillActive = true;
                    }
                    break;
            }

            const target = pickPrimaryTarget(enemies);
            if (!target) continue;

            await delay(TURN_DELAY_MS);
            character.attackCalculation(target, enemies, character, allies);
            const attackerPassive = character.lastPassiveTriggered;
            const attackerPassiveEffectSummary = character.lastPassiveEffectSummary;
            const activeEffectSummary = character.lastActionType === 'active' ? character.lastActiveEffectSummary : [];

            target.lastPassiveTriggered = null;
            target.lastPassiveEffectSummary = [];
            if (
                target.health > 0
                && character.displayDamage > 0
                && target.passiveSkill.trigger === 'Damage Taken'
                && !target.isPassiveSkillActive
            ) {
                const targetAllies = isTeamA ? charactersB : charactersA;
                const targetEnemies = isTeamA ? charactersA : charactersB;
                activatePassive(target, targetEnemies, targetAllies);
                target.isPassiveSkillActive = true;
            }
            const targetPassive = target.lastPassiveTriggered;
            const targetPassiveEffectSummary = target.lastPassiveEffectSummary;

            const event: BattleTurnEvent = {
                turn,
                attackerSide: isTeamA ? 'A' : 'B',
                attackerName: character.name,
                targetName: target.name,
                damage: character.displayDamage,
                actionType: character.lastActionType,
                skillName: character.lastActionName,
                activeEffectSummary,
                attackerPassive,
                attackerPassiveEffectSummary,
                targetPassive,
                targetPassiveEffectSummary,
                teamA: snapshotTeam(charactersA),
                teamB: snapshotTeam(charactersB),
            };

            turns.push(event);
            await onTurn(event);
        }
    }

    const result: BattleResult = teamB.isDefeated() && !teamA.isDefeated() ? 'A'
        : teamA.isDefeated() && !teamB.isDefeated() ? 'B'
            : 'draw';

    return { result, turns };
}
