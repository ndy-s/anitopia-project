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

interface ElementData {
    strength: Element | string;
    weakness: Element | string;
}

export class Character {
    maxHealth: number;
    displayDamage: number = 0;
    displayHealth: number;
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
        public passiveSkill: ISkillModel,
        public passiveSkillEffect: IRarityEffect,
        public activeSkill: ISkillModel,
        public activeSkillEffect: IRarityEffect
    ) {
        this.maxHealth = health;
        this.displayHealth = health;
        this.activeSkillCooldown = activeSkill.cooldown ?? 0;
        this.status = [];
    }

    private calculatePhysicalDamage(): number {
        const baseDamage = (2 * this.attack ** 2 + this.attack) / (this.attack + this.defense ** 0.85);
        const logMultiplier = Math.log(this.health) * (Math.random() * 1.2 - 0.1);
        return Math.max(0, Math.ceil(baseDamage + logMultiplier));
    }

    private applyElementalEffect(damage: number, targetElement: string): number {
        const strength = this.elementsData[this.element].strength;
        const weakness = this.elementsData[this.element].weakness;

        if (strength === targetElement) {
            console.log(`Strong element! Initial Damage ${damage}`);
            return damage * ELEMENTAL_STRENGTH_MULTIPLIER;
        } else if (weakness === targetElement) {
            console.log(`Weak element! Initial Damage ${damage}`);
            return damage * ELEMENTAL_WEAKNESS_MULTIPLIER;
        } else {
            return damage;
        }
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
            this.displayDamage = damage;
            enemy.health -= damage;

            console.log(`Target ${enemy.name} got damage ${damage}, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
            console.log(``);
        } else {
            console.log(`Attack missed or was dodged!`);
            console.log(``);
        }
    }

    attackCalculation(enemy: Character, enemies: Character[], ally: Character, allies: Character[]) {
        if (this.activeSkillCooldown === 0) {
            this.activateSkill(enemy, enemies, ally, allies, 'active');

            if ((this.passiveSkill.trigger ?? '').toString() === 'Attack') {
                this.activeSkillEffect.effects.forEach((effect) => {
                    if (effect.type === 'Damage' || effect.type === 'True Damage') {
                        this.activateSkill(enemy, enemies, ally, allies, 'passive');
                    }
                });
            }
        } else {
            const damage = this.calculatePhysicalDamage();
            this.inflictDamage(enemy, damage);

            if ((this.passiveSkill.trigger ?? '').toString() === 'Attack') {
                this.activateSkill(enemy, enemies, ally, allies, 'passive');
            }
    
            if (this.activeSkillCooldown > 0) {
                this.activeSkillCooldown--;
            }
        }
    }

    activateSkill(enemy: Character, enemies: Character[], ally: Character, allies: Character[], skillType: 'active' | 'passive') {
        console.log(`${this.name} ${skillType === 'active' ? 'Active Skill ' + this.activeSkill.name : 'Passive Skill ' + this.passiveSkill.name } Activated!`);

        const { target } = this.passiveSkill;
        
        switch (target) {
            case 'Single':
                this.useSkill([enemy], [ally], skillType);
                break;
            case 'Area':
                this.useSkill(enemies, allies, skillType);
                break;
            case 'Highest Health':
                const getHighestHealth = (entities: Character[]) => entities.reduce((maxEntity, currentEntity) =>
                    (currentEntity.health > maxEntity.health) ? currentEntity : maxEntity
                );
        
                const highestHealthEnemy = getHighestHealth(enemies);
                const highestHealthAlly = getHighestHealth(allies);
        
                this.useSkill([highestHealthEnemy], [highestHealthAlly], skillType);
                break;
            case 'Lowest Health':
                const getLowestHealth = (entities: Character[]) => entities.reduce((minEntity, currentEntity) =>
                    (currentEntity.health < minEntity.health) ? currentEntity : minEntity
                );

                const lowestHealthEnemy = getLowestHealth(enemies);
                const lowestHealthAlly = getLowestHealth(allies);

                this.useSkill([lowestHealthEnemy], [lowestHealthAlly], skillType);
                break;
            case 'Random':
                const getRandomEntity = (entities: Character[]) => entities[Math.floor(Math.random() * entities.length)];
        
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

        effects.forEach((effect: IEffect) => {
            if (Math.random() <= effect.chance) {
                const isTargetEnemy = effect.target === 'Enemy';
                const applicableTargets = isTargetEnemy ? enemies : allies;
    
                switch (effect.type) {
                    // Enemy
                    case 'Bleed':
                        applicableTargets.forEach((target) => this.handleBleedEffect(effect, target, skillType));
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

    // Handle Skill Ally Effect Methods
    private handleHealEffect(effect: IEffect, ally: Character, skillType: 'active' | 'passive') {
        const heal = Math.ceil(effect.value * ally.health);

        ally.health += heal;
        this.displayHealth = ally.health;

        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkill.name : this.passiveSkill.name}), Ally ${ally.name} got heal by ${heal}!, HP: ${Math.max(ally.health, 0)}/${ally.maxHealth}`);
    };

    // TODO: Solve this "any" problem.
    private handleBuffEffect(effect: IEffect, ally: any, skillType: 'active' | 'passive') {
        const attribute = effect.attribute.toLowerCase();

        const additionValue = ally[attribute] * effect.value;
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
        
        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkill.name : this.passiveSkill.name}), Ally ${ally.name} got buff ${attribute} increased by ${additionValue}!`);
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
            this.displayDamage = damage;
            enemy.health -= damage;
            
            console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkill.name : this.passiveSkill.name}), Enemy ${enemy.name} got damage ${damage}!, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
        } else {
            console.log("Attack missed, enemy dodged it!");
        }
    }
    
    private handleTrueDamageEffect(effect: IEffect, enemy: Character, skillType: 'active' | 'passive') {
        const damage = Math.ceil(effect.value * this.attack);
        this.displayDamage = damage;
        enemy.health -= damage;

        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkill.name : this.passiveSkill.name}), Enemy ${enemy.name} got true damage ${damage}!, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
    }

    // TODO: Solve this "any" problem.
    private handleDebuffEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        const attribute = effect.attribute.toLowerCase();

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

        console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkill.name : this.passiveSkill.name}), Enemy ${enemy.name} got debuff ${attribute} reduced by ${reductionValue}!`);
    }

    // TODO: Solve this "any" problem.
    private handleBleedEffect(effect: IEffect, enemy: any, skillType: 'active' | 'passive') {
        if (effect.duration > 0) {
            enemy.status.push({
                type: effect.type,
                attribute: effect.attribute,
                value: effect.value,
                duration: effect.duration
            });

            console.log(`Character ${this.name} using ${skillType} skill (${skillType === 'active' ? this.activeSkill.name : this.passiveSkill.name}), Enemy ${enemy.name} got debuff bleed status reduced by ${effect.value * 100}% of ${effect.attribute} for ${effect.duration} turns!`);
        }
    }
}