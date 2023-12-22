import { IEffect, IRarityEffect, ISkillModel } from "../interfaces";

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

    attackCalculation(enemy: Character, enemies: Character[], ally: Character, allies: Character[]) {
        if (this.activeSkillCooldown === 0) {
            switch (this.activeSkill.target) {
                case 'Single':
                    this.useActiveSkill([enemy], [ally]);
                    break;
                case 'Area':
                    this.useActiveSkill(enemies, allies);
                    break;
                default:
                    console.error(`Unsupported skill target: ${this.activeSkill.target}`);
                    break;
            }
        } else {
            const damage = this.calculatePhysicalDamage();
            this.inflictDamage(enemy, damage);
    
            if (this.activeSkillCooldown > 0) {
                this.activeSkillCooldown--;
            }
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

    private useActiveSkill(enemies: Character[], allies: Character[]) {
        this.activeSkillEffect.effects.forEach((effect: IEffect) => {
            if (Math.random() <= effect.chance && effect.target === 'Enemy') {
                switch (effect.type) {
                    case 'Damage':
                        enemies.forEach((enemy) => this.handleDamageEffect(effect, enemy));
                        console.log(``);
                        break;
                    case 'True Damage':
                        enemies.forEach((enemy) => this.handleTrueDamageEffect(effect, enemy));
                        console.log(``);
                        break;
                    case 'Debuff':
                        enemies.forEach((enemy) => this.handleDebuffEffect(effect, enemy));
                        console.log(``);
                        break;
                    default:
                        console.log(`Unhandled effect type: ${effect.type}`);
                }
            } else if (Math.random() <= effect.chance && effect.target === 'Ally') {
                switch (effect.type) {
                    case 'Heal':
                        allies.forEach((ally) => this.handleHealEffect(effect, ally));
                        break;
                    case 'Buff':
                        allies.forEach((ally) => this.handleBuffEffect(effect, ally));
                        console.log(``);
                        break;
                    default:
                        console.log(`Unhandled effect type: ${effect.type}`);
                }
            } else {
                console.log('CHANCE FOR ACTIVE SKILL FAILED!');
                console.log(``);
            }
        });
        this.activeSkillCooldown = this.activeSkill.cooldown ?? 0;
    }

    // Handle Active Skill Ally Effect Methods
    private handleHealEffect(effect: IEffect, ally: Character) {
        const heal = Math.ceil(effect.value * ally.health);

        ally.health += heal;
        this.displayHealth = ally.health;

        console.log(`Character ${this.name} using active skill (${this.activeSkill.name}), Ally ${ally.name} got heal by ${heal}!, HP: ${Math.max(ally.health, 0)}/${ally.maxHealth}`);
    };


    // TODO: Solve this "any" problem.
    private handleBuffEffect(effect: IEffect, ally: any) {
        const attribute = effect.attribute.toLowerCase();

        const additionValue = ally[attribute] * effect.value;
        ally[attribute] += additionValue;
        ally[attribute] = +ally[attribute].toFixed(3);

        ally.status.push({
            type: effect.type,
            attribute: attribute,
            value: additionValue,
            duration: effect.duration
        });
        
        console.log(`Character ${this.name} using active skill (${this.activeSkill.name}), Ally ${ally.name} got buff ${attribute} reduced by ${additionValue}!`);
    }


    // Handle Active Skill Enemy Effect Methods
    private handleDamageEffect(effect: IEffect, enemy: Character) {
        let damage = Math.ceil(effect.value * this.calculatePhysicalDamage());
    
        if (this.calculateDodge(enemy)) {
            if (this.calculateCrit()) {
                damage *= CRITICAL_HIT_MULTIPLIER;
                console.log(`Critical hit! Damage is increased to ${damage}`);
            }
    
            damage = this.applyElementalEffect(damage, enemy.element);
            this.displayDamage = damage;
            enemy.health -= damage;
    
            console.log(`Character ${this.name} using active skill (${this.activeSkill.name}), Target ${enemy.name} got damage ${damage}!, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
        } else {
            console.log("Attack missed, enemy dodged it!");
        }
    }
    
    private handleTrueDamageEffect(effect: IEffect, enemy: Character) {
        const damage = Math.ceil(effect.value * this.attack);
        this.displayDamage = damage;
        enemy.health -= damage;
    
        console.log(`Character ${this.name} using active skill (${this.activeSkill.name}), Target ${enemy.name} got damage ${damage}!, HP: ${Math.max(enemy.health, 0)}/${enemy.maxHealth}`);
    }

    // TODO: Solve this "any" problem.
    private handleDebuffEffect(effect: IEffect, enemy: any) {
        const attribute = effect.attribute.toLowerCase();

        const reductionValue = enemy[attribute] * effect.value;
        enemy[attribute] -= reductionValue;
        enemy[attribute] = +enemy[attribute].toFixed(3);
    
        enemy.status.push({
            type: effect.type,
            attribute: attribute,
            value: reductionValue,
            duration: effect.duration
        });
    
        console.log(`Character ${this.name} using active skill (${this.activeSkill.name}), Target ${enemy.name} got debuff ${attribute} reduced by ${reductionValue}!`);
    }
}