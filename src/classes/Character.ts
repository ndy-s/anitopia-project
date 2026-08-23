import { IEffect, IRarityEffect, ISkillModel } from "../interfaces";
import { mapRarity } from "../utils";

enum Element {
    PYRO = 'Pyro',
    AQUA = 'Aqua',
    VOLT = 'Volt',
    TERRA = 'Terra',
    AERO = 'Aero',
    LUMEN = 'Lumen',
    SHADE = 'Shade',
    NEUTRALIS = 'Neutralis'
}

const CRITICAL_HIT_MULTIPLIER = 2;
const ELEMENTAL_STRENGTH_MULTIPLIER = 1.5;
const ELEMENTAL_WEAKNESS_MULTIPLIER = 0.75;
const ACCURACY_THRESHOLD = 0.9;
const DODGE_THRESHOLD = 0.02;
const CRIT_RATE_THRESHOLD = 0.05;

// Class identity hooks (see design-docs/GAME-DESIGN-PLAN.md §3 and
// design-docs/GAME-MECHANICS-GUIDE.md §7 for the reasoning behind each).
const HUNTER_CRIT_RATE_BONUS = 0.10; // Hunter: 5% -> 15% baseline crit
const MAGE_ELEMENTAL_STRENGTH_MULTIPLIER = 1.75; // Mage: bigger elemental upside...
const MAGE_ELEMENTAL_WEAKNESS_MULTIPLIER = 0.6; // ...and bigger elemental downside
const WARRIOR_LIFESTEAL_RATIO = 0.10; // Warrior: sustains off damage dealt
const SUPPORT_EFFECT_AMPLIFY = 1.2; // Support: Heal/Buff/Shield effects hit 20% harder

// Status-effect engine constants (design-docs/GAME-MECHANICS-GUIDE.md §5 catalog). These are fixed
// game constants for the status archetype itself, not scaled per-skill like effect.value/chance.
export const PARALYSIS_SPEED_REDUCTION = 0.4; // Paralysis: flat -40% speed while active
export const PARALYSIS_SKIP_CHANCE = 0.25; // Paralysis: 25% chance to lose the turn entirely, each turn
export const SLEEP_SELF_WAKE_CHANCE = 0.75; // Sleep: 75% chance to wake up on your own each turn

// effect.attribute values that don't lowercase directly onto a real Character property name.
export const ATTRIBUTE_PROPERTY_ALIASES: Record<string, string> = { critrate: 'critRate' };
const mapAttributeToProperty = (attribute: string): string => {
    const lower = attribute.toLowerCase();
    return ATTRIBUTE_PROPERTY_ALIASES[lower] ?? lower;
};

interface ElementData {
    strength: Element | string;
    weakness: Element | string;
}

export class Character {
    maxHealth: number;
    displayDamage: number = 0;
    displayHealth: number;
    lastActionType: 'attack' | 'active' = 'attack';
    lastActionName: string | null = null;
    lastPassiveTriggered: string | null = null;
    lastActiveEffectSummary: string[] = [];
    lastPassiveEffectSummary: string[] = [];
    damageReduction: number = 0;
    activeSkillCooldown: number;
    isPassiveSkillActive: boolean = false;
    accuracy: number = ACCURACY_THRESHOLD;
    dodge: number = DODGE_THRESHOLD;
    critRate: number = CRIT_RATE_THRESHOLD;
    elementsData: { [key: string]: ElementData } = {
        [Element.PYRO]: { strength: Element.AERO, weakness: Element.AQUA },
        [Element.AQUA]: { strength: Element.PYRO, weakness: Element.VOLT },
        [Element.VOLT]: { strength: Element.AQUA, weakness: Element.TERRA },
        [Element.TERRA]: { strength: Element.VOLT, weakness: Element.AERO },
        [Element.AERO]: { strength: Element.TERRA, weakness: Element.PYRO },
        [Element.LUMEN]: { strength: Element.SHADE, weakness: Element.SHADE },
        [Element.SHADE]: { strength: Element.LUMEN, weakness: Element.LUMEN },
        [Element.NEUTRALIS]: { strength: '', weakness: '' }
    };
    status: {
        type: string,
        attribute: string,
        value: number,
        duration: number,
    }[];

    constructor (
        public name: string,
        public health: number,
        public attack: number,
        public defense: number,
        public speed: number,
        public level: number,
        public rarity: number,
        public element: Element,
        public characterClass: string,
        public passiveSkillName: string,
        public passiveSkill: ISkillModel,
        public passiveSkillEffect: IRarityEffect,
        public activeSkillName: string,
        public activeSkill: ISkillModel,
        public activeSkillEffect: IRarityEffect
    ) {
        this.maxHealth = health;
        this.displayHealth = health;
        this.activeSkillCooldown = activeSkill.cooldown ?? 0;
        this.status = [];

        if (this.characterClass === 'Hunter') {
            this.critRate += HUNTER_CRIT_RATE_BONUS;
        }
    }

    private calculatePhysicalDamage(): number {
        const baseDamage = (2 * this.attack ** 2 + this.attack) / (this.attack + this.defense ** 0.85);
        const logMultiplier = Math.log(this.health) * (Math.random() * 1.2 - 0.1);
        return Math.max(0, Math.ceil(baseDamage + logMultiplier));
    }

    private applyElementalEffect(damage: number, targetElement: string): number {
        const strength = this.elementsData[this.element].strength;
        const weakness = this.elementsData[this.element].weakness;
        const isMage = this.characterClass === 'Mage';
        const strengthMultiplier = isMage ? MAGE_ELEMENTAL_STRENGTH_MULTIPLIER : ELEMENTAL_STRENGTH_MULTIPLIER;
        const weaknessMultiplier = isMage ? MAGE_ELEMENTAL_WEAKNESS_MULTIPLIER : ELEMENTAL_WEAKNESS_MULTIPLIER;

        if (strength === targetElement) {
            console.log(`Strong element! Initial Damage ${damage}`);
            return damage * strengthMultiplier;
        } else if (weakness === targetElement) {
            console.log(`Weak element! Initial Damage ${damage}`);
            return damage * weaknessMultiplier;
        } else {
            return damage;
        }
    }

    private applyLifesteal(damage: number) {
        if (this.characterClass !== 'Warrior' || damage <= 0) return;

        const healed = Math.ceil(damage * WARRIOR_LIFESTEAL_RATIO);
        this.health = Math.min(this.maxHealth, this.health + healed);
    }

    private wakeIfHit(target: Character, damage: number) {
        if (damage > 0) {
            target.status = target.status.filter((stat) => stat.type !== 'Sleep');
        }
    }

    private isAegisProtected(target: Character): boolean {
        return target.status.some((stat) => stat.type === 'Aegis');
    }

    hasStatus(type: string): boolean {
        return this.status.some((stat) => stat.type === type);
    }

    private calculateAccuracy(): boolean {
        return Math.random() <= this.accuracy;
    }

    private calculateDodge(enemy: Character): boolean {
        return Math.random() >= enemy.dodge;
    }

    private calculateCrit(): boolean {
        return Math.random() <= this.critRate;
    }

    private inflictDamage(enemy: Character, damage: number) {
        if (this.calculateAccuracy() && this.calculateDodge(enemy)) {
            if (this.calculateCrit()) {
                damage *= CRITICAL_HIT_MULTIPLIER;
                console.log(`Critical hit! Damage is increased to ${damage}`);
            }

            damage = this.applyElementalEffect(damage, enemy.element);
            damage = Math.ceil(damage * (1 - enemy.damageReduction));
            this.displayDamage = damage;
            enemy.health -= damage;
            this.applyLifesteal(damage);
            this.wakeIfHit(enemy, damage);

            console.log(`Target ${enemy.name} got damage ${damage}, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
            console.log(``);
        } else {
            this.displayDamage = 0;
            console.log(`Attack missed or was dodged!`);
            console.log(``);
        }
    }

    attackCalculation(enemy: Character, enemies: Character[], ally: Character, allies: Character[]) {
        this.displayDamage = 0;

        const isSilenced = this.hasStatus('Silence');

        if (this.activeSkillCooldown === 0 && !isSilenced) {
            this.lastActionType = 'active';
            this.lastActionName = this.activeSkillName;
            this.activateSkill(enemy, enemies, ally, allies, 'active');

            if ((this.passiveSkill.trigger ?? '').toString() === 'Attack') {
                this.activeSkillEffect.effects.forEach((effect) => {
                    if (effect.type === 'Damage' || effect.type === 'True Damage') {
                        this.activateSkill(enemy, enemies, ally, allies, 'passive');
                    }
                });
            }
        } else {
            this.lastActionType = 'attack';
            this.lastActionName = null;

            const damage = this.calculatePhysicalDamage();
            this.inflictDamage(enemy, damage);

            if (this.hasStatus('Double Attack')) {
                const firstHitDamage = this.displayDamage;
                const secondDamage = this.calculatePhysicalDamage();
                this.inflictDamage(enemy, secondDamage);
                this.displayDamage += firstHitDamage;
            }

            if ((this.passiveSkill.trigger ?? '').toString() === 'Attack') {
                this.activateSkill(enemy, enemies, ally, allies, 'passive');
            }

            if (this.activeSkillCooldown > 0) {
                this.activeSkillCooldown--;
            }
        }
    }

    activateSkill(enemy: Character, enemies: Character[], ally: Character, allies: Character[], skillType: 'active' | 'passive') {
        console.log(`${this.name} ${skillType === 'active' ? 'Active Skill ' + this.activeSkillName : 'Passive Skill ' + this.passiveSkillName } Activated!`);

        if (skillType === 'passive') {
            this.lastPassiveTriggered = this.passiveSkillName;
        }

        const { target } = skillType === 'active' ? this.activeSkill : this.passiveSkill;

        // "Highest Health"/"Lowest Health"/"Random" must only ever consider living entities — enemies
        // and allies here are the full team roster including already-dead members, and without this
        // filter "Lowest Health" always picks a dead ally (their health sits at/below 0, always lower
        // than any living member's), so a Support's Healing Touch/Guardian's Blessing would resurrect
        // a fallen teammate instead of healing the lowest-HP living one. Falls back to the unfiltered
        // list only if literally everyone in it is dead, so `.reduce()`/indexing never runs on empty.
        const aliveOrAll = (entities: Character[]) => {
            const alive = entities.filter((entity) => entity.health > 0);
            return alive.length > 0 ? alive : entities;
        };

        switch (target) {
            case 'Single':
                this.useSkill([enemy], [ally], skillType);
                break;
            case 'Area':
                this.useSkill(enemies, allies, skillType);
                break;
            case 'Highest Health':
                const getHighestHealth = (entities: Character[]) => aliveOrAll(entities).reduce((maxEntity, currentEntity) =>
                    (currentEntity.health > maxEntity.health) ? currentEntity : maxEntity
                );

                const highestHealthEnemy = getHighestHealth(enemies);
                const highestHealthAlly = getHighestHealth(allies);

                this.useSkill([highestHealthEnemy], [highestHealthAlly], skillType);
                break;
            case 'Lowest Health':
                const getLowestHealth = (entities: Character[]) => aliveOrAll(entities).reduce((minEntity, currentEntity) =>
                    (currentEntity.health < minEntity.health) ? currentEntity : minEntity
                );

                const lowestHealthEnemy = getLowestHealth(enemies);
                const lowestHealthAlly = getLowestHealth(allies);

                this.useSkill([lowestHealthEnemy], [lowestHealthAlly], skillType);
                break;
            case 'Random':
                const getRandomEntity = (entities: Character[]) => {
                    const pool = aliveOrAll(entities);
                    return pool[Math.floor(Math.random() * pool.length)];
                };

                const randomEnemy = getRandomEntity(enemies);
                const randomAlly = getRandomEntity(allies);

                this.useSkill([randomEnemy], [randomAlly], skillType);
                break;
            default:
                console.error(`Unsupported passive skill target: ${target}`);
                break;
        }
    }

    useSkill(enemies: Character[], allies: Character[], skillType: 'active' | 'passive') {
        const effects = skillType === 'active' ? this.activeSkillEffect.effects : this.passiveSkillEffect.effects;

        if (skillType === 'active') {
            this.lastActiveEffectSummary = [];
        } else {
            this.lastPassiveEffectSummary = [];
        }

        effects.forEach((effect: IEffect) => {
            if (Math.random() <= effect.chance) {
                const isTargetEnemy = effect.target === 'Enemy';
                const applicableTargets = isTargetEnemy ? enemies : allies;
    
                switch (effect.type) {
                    // Enemy
                    case 'Bleed':
                        applicableTargets.forEach((target) => this.handleBleedEffect(effect, target, skillType));
                        break;
                    case 'Poison':
                        applicableTargets.forEach((target) => this.handlePoisonEffect(effect, target, skillType));
                        break;
                    case 'Burn':
                        applicableTargets.forEach((target) => this.handleBurnEffect(effect, target, skillType));
                        break;
                    case 'Paralysis':
                        applicableTargets.forEach((target) => this.handleParalysisEffect(effect, target, skillType));
                        break;
                    case 'Freeze':
                        applicableTargets.forEach((target) => this.handleFreezeEffect(effect, target, skillType));
                        break;
                    case 'Sleep':
                        applicableTargets.forEach((target) => this.handleSleepEffect(effect, target, skillType));
                        break;
                    case 'Silence':
                        applicableTargets.forEach((target) => this.handleSilenceEffect(effect, target, skillType));
                        break;
                    case 'Time Bomb':
                        applicableTargets.forEach((target) => this.handleTimeBombEffect(effect, target, skillType));
                        break;
                    case 'Damage':
                        applicableTargets.forEach((target) => this.handleDamageEffect(effect, target, skillType));
                        break;
                    case 'True Damage':
                        applicableTargets.forEach((target) => this.handleTrueDamageEffect(effect, target, skillType));
                        break;
                    case 'Debuff':
                        applicableTargets.forEach((target) => this.handleDebuffEffect(effect, target, skillType));
                        break;

                    // Ally
                    case 'Heal':
                        applicableTargets.forEach((target) => this.handleHealEffect(effect, target, skillType));
                        break;
                    case 'Buff':
                        applicableTargets.forEach((target) => this.handleBuffEffect(effect, target, skillType));
                        break;
                    case 'Shield':
                        applicableTargets.forEach((target) => this.handleShieldEffect(effect, target, skillType));
                        break;
                    case 'Aegis':
                        applicableTargets.forEach((target) => this.handleAegisEffect(effect, target, skillType));
                        break;
                    case 'Double Attack':
                        applicableTargets.forEach((target) => this.handleDoubleAttackEffect(effect, target, skillType));
                        break;
                    default:
                        console.log(`Unhandled effect type: ${effect.type}`);
                }
            } else {
                console.log(`Chance for ${skillType} Skill Failed!`);
            }
        });
    
        if (skillType === 'active') {
            this.activeSkillCooldown = this.activeSkill.cooldown ?? 0;
        }

        console.log('');
    }

    private recordEffectSummary(skillType: 'active' | 'passive', text: string) {
        if (skillType === 'active') {
            this.lastActiveEffectSummary.push(text);
        } else {
            this.lastPassiveEffectSummary.push(text);
        }
    }

    // Handle Skill Ally Effect Methods
    private handleHealEffect(effect: IEffect, ally: Character, skillType: 'active' | 'passive') {
        const classMultiplier = this.characterClass === 'Support' ? SUPPORT_EFFECT_AMPLIFY : 1;
        const heal = Math.ceil(effect.value * classMultiplier * ally.maxHealth);

        ally.health = Math.min(ally.maxHealth, ally.health + heal);
        this.displayHealth = ally.health;

        this.recordEffectSummary(skillType, `+${heal} HP to ${ally.name}`);
        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Ally ${ally.name} got heal by ${heal}!, HP: ${Math.max(ally.health, 0)}/${ally.maxHealth}`);
    };

    // TODO: Solve this "any" problem.
    private handleBuffEffect(effect: IEffect, ally: any, skillType: 'active' | 'passive') {
        const attribute = mapAttributeToProperty(effect.attribute);
        const classMultiplier = this.characterClass === 'Support' ? SUPPORT_EFFECT_AMPLIFY : 1;

        const additionValue = ally[attribute] * effect.value * classMultiplier;
        ally[attribute] += additionValue;
        ally[attribute] = +ally[attribute].toFixed(3);

        if (effect.duration > 0) {
            ally.status.push({
                type: effect.type,
                attribute: attribute,
                value: additionValue,
                duration: effect.duration
            });
        }

        const durationText = effect.duration > 0 ? ` for ${effect.duration} turns` : '';
        this.recordEffectSummary(skillType, `+${(effect.value * classMultiplier * 100).toFixed(0)}% ${attribute} to ${ally.name}${durationText}`);
        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Ally ${ally.name} got buff ${attribute} increased by ${additionValue}!`);
    }

    private handleShieldEffect(effect: IEffect, ally: Character, skillType: 'active' | 'passive') {
        const classMultiplier = this.characterClass === 'Support' ? SUPPORT_EFFECT_AMPLIFY : 1;
        const shieldValue = effect.value * classMultiplier;

        ally.damageReduction = Math.min(0.9, ally.damageReduction + shieldValue);

        if (effect.duration > 0) {
            ally.status.push({
                type: 'Shield',
                attribute: 'damageReduction',
                value: shieldValue,
                duration: effect.duration
            });
        }

        const durationText = effect.duration > 0 ? ` for ${effect.duration} turns` : '';
        this.recordEffectSummary(skillType, `${ally.name} gains ${(shieldValue * 100).toFixed(0)}% damage reduction${durationText}`);
        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Ally ${ally.name} gained a shield reducing damage taken by ${(shieldValue * 100).toFixed(0)}%!`);
    }

    // Handle Skill Enemy Effect Methods
    private handleDamageEffect(effect: IEffect, enemy: Character, skillType: 'active' | 'passive') {
        let damage = Math.ceil(effect.value * this.calculatePhysicalDamage());
    
        if (this.calculateDodge(enemy)) {
            if (this.calculateCrit()) {
                damage *= CRITICAL_HIT_MULTIPLIER;
                console.log(`Critical hit! Damage is increased to ${damage}`);
            }
    
            damage = this.applyElementalEffect(damage, enemy.element);
            damage = Math.ceil(damage * (1 - enemy.damageReduction));
            this.displayDamage = damage;
            enemy.health -= damage;
            this.applyLifesteal(damage);
            this.wakeIfHit(enemy, damage);

            console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Enemy ${enemy.name} got damage ${damage}!, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
        } else {
            console.log("Attack missed, enemy dodged it!");
        }
    }

    private handleTrueDamageEffect(effect: IEffect, enemy: Character, skillType: 'active' | 'passive') {
        const damage = Math.ceil(effect.value * this.attack);
        this.displayDamage = damage;
        enemy.health -= damage;
        this.applyLifesteal(damage);
        this.wakeIfHit(enemy, damage);

        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Enemy ${enemy.name} got true damage ${damage}!, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
    }

    // TODO: Solve this "any" problem.
    private handleDebuffEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }

        const attribute = mapAttributeToProperty(effect.attribute);

        const reductionValue = enemy[attribute] * effect.value;
        enemy[attribute] -= reductionValue;
        enemy[attribute] = +enemy[attribute].toFixed(3);
    
        if (effect.duration > 0) {
            enemy.status.push({
                type: effect.type,
                attribute: attribute,
                value: reductionValue,
                duration: effect.duration
            });
        }

        const durationText = effect.duration > 0 ? ` for ${effect.duration} turns` : '';
        this.recordEffectSummary(skillType, `-${(effect.value * 100).toFixed(0)}% ${attribute} on ${enemy.name}${durationText}`);
        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Enemy ${enemy.name} got debuff ${attribute} reduced by ${reductionValue}!`);
    }

    // TODO: Solve this "any" problem.
    private handleBleedEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) {
            console.warn(`Bleed effect on ${skillType === 'active' ? this.activeSkillName : this.passiveSkillName} has duration <= 0 and will never apply. A bleed effect requires duration > 0 to tick.`);
            return;
        }

        enemy.status.push({
            type: effect.type,
            attribute: effect.attribute,
            value: effect.value,
            duration: effect.duration
        });

        this.recordEffectSummary(skillType, `${enemy.name} bleeds for ${(effect.value * 100).toFixed(0)}% max HP over ${effect.duration} turns`);
        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkillName : this.passiveSkillName}), Enemy ${enemy.name} got debuff bleed status reduced by ${effect.value * 100}% of ${effect.attribute} for ${effect.duration} turns!`);
    }

    // TODO: Solve this "any" problem.
    private handlePoisonEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) {
            console.warn(`Poison effect on ${skillType === 'active' ? this.activeSkillName : this.passiveSkillName} has duration <= 0 and will never apply.`);
            return;
        }

        enemy.status.push({
            type: 'Poison',
            attribute: effect.attribute,
            value: effect.value,
            duration: effect.duration
        });

        this.recordEffectSummary(skillType, `${enemy.name} is poisoned for ${(effect.value * 100).toFixed(0)}% max HP over ${effect.duration} turns`);
        console.log(`${this.name} poisons ${enemy.name}!`);
    }

    // Burn ticks off the damage of the hit that applied it (this.displayDamage), not a % of max
    // health like Bleed/Poison — the effect that inflicts Burn must run its Damage/True Damage effect
    // first in the same skill's effects array so displayDamage is populated when this handler runs.
    private handleBurnEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) {
            console.warn(`Burn effect on ${skillType === 'active' ? this.activeSkillName : this.passiveSkillName} has duration <= 0 and will never apply.`);
            return;
        }

        const tickDamage = Math.max(1, Math.ceil(effect.value * this.displayDamage));

        enemy.status.push({
            type: 'Burn',
            attribute: 'trueDamage',
            value: tickDamage,
            duration: effect.duration
        });

        this.recordEffectSummary(skillType, `${enemy.name} is set ablaze, taking ${tickDamage} damage over ${effect.duration} turns`);
        console.log(`${this.name} burns ${enemy.name} for ${tickDamage}/turn over ${effect.duration} turns!`);
    }

    private handleParalysisEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) return;

        const reductionValue = enemy.speed * PARALYSIS_SPEED_REDUCTION;
        enemy.speed -= reductionValue;
        enemy.speed = +enemy.speed.toFixed(3);

        enemy.status.push({
            type: 'Paralysis',
            attribute: 'speed',
            value: reductionValue,
            duration: effect.duration
        });

        this.recordEffectSummary(skillType, `${enemy.name} is paralyzed for ${effect.duration} turns (-${(PARALYSIS_SPEED_REDUCTION * 100).toFixed(0)}% speed, ${(PARALYSIS_SKIP_CHANCE * 100).toFixed(0)}% chance to lose their turn each turn)`);
        console.log(`${this.name} paralyzes ${enemy.name} for ${effect.duration} turns!`);
    }

    private handleFreezeEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) return;

        enemy.status.push({ type: 'Freeze', attribute: 'action', value: 0, duration: effect.duration });
        this.recordEffectSummary(skillType, `${enemy.name} is frozen solid for ${effect.duration} turns`);
        console.log(`${this.name} freezes ${enemy.name}!`);
    }

    private handleSleepEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) return;

        enemy.status.push({ type: 'Sleep', attribute: 'action', value: 0, duration: effect.duration });
        this.recordEffectSummary(skillType, `${enemy.name} falls asleep for up to ${effect.duration} turns (wakes instantly if hit)`);
        console.log(`${this.name} puts ${enemy.name} to sleep!`);
    }

    private handleSilenceEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }
        if (effect.duration <= 0) return;

        enemy.status.push({ type: 'Silence', attribute: 'activeSkill', value: 0, duration: effect.duration });
        this.recordEffectSummary(skillType, `${enemy.name} is silenced for ${effect.duration} turns (can't use their active skill)`);
        console.log(`${this.name} silences ${enemy.name}!`);
    }

    // Time Bomb detonates off the damage of the hit that applied it, same rule as Burn — author it
    // after a Damage/True Damage effect in the same skill's effects array.
    private handleTimeBombEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (this.isAegisProtected(enemy)) {
            this.recordEffectSummary(skillType, `${enemy.name} is protected by Aegis!`);
            return;
        }

        const pendingDamage = Math.max(1, Math.ceil(effect.value * this.displayDamage));

        enemy.status.push({ type: 'Time Bomb', attribute: 'trueDamage', value: pendingDamage, duration: effect.duration });
        this.recordEffectSummary(skillType, `A time bomb is planted on ${enemy.name}, detonating for ${pendingDamage} damage in ${effect.duration} turns`);
        console.log(`${this.name} plants a time bomb on ${enemy.name}!`);
    }

    private handleAegisEffect(effect: IEffect, ally: Character, skillType: 'active' | 'passive') {
        if (effect.duration <= 0) return;

        ally.status.push({ type: 'Aegis', attribute: 'debuffImmunity', value: 0, duration: effect.duration });
        this.recordEffectSummary(skillType, `${ally.name} is protected by Aegis for ${effect.duration} turns`);
        console.log(`${this.name} shields ${ally.name} with Aegis!`);
    }

    private handleDoubleAttackEffect(effect: IEffect, ally: Character, skillType: 'active' | 'passive') {
        if (effect.duration <= 0) return;

        ally.status.push({ type: 'Double Attack', attribute: 'extraAttack', value: 0, duration: effect.duration });
        this.recordEffectSummary(skillType, `${ally.name} gains a chance to strike twice for ${effect.duration} turns`);
        console.log(`${this.name} grants Double Attack to ${ally.name}!`);
    }
}