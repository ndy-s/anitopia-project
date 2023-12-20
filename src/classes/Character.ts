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
    strength: Element;
    weakness: Element;
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
        [Element.NEUTRALIS]: { strength: Element.NEUTRALIS, weakness: Element.NEUTRALIS }
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
        public activeSkill: ISkillModel,
        public skillEffect: IRarityEffect
    ) {
        this.maxHealth = health;
        this.displayHealth = health;
        this.activeSkillCooldown = activeSkill.cooldown ?? 0;
        this.status = [];
    }

    attackCalculation(target: Character) {
        if (this.activeSkillCooldown === 0) {
            this.useActiveSkill(target);
        } else {
            const damage = this.calculatePhysicalDamage();
            this.inflictDamage(target, damage);
    
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

    private calculateDodge(target: Character): boolean {
        return Math.random() >= target.dodge;
    }

    private calculateCrit(): boolean {
        return Math.random() <= this.critRate;
    }

    private inflictDamage(target: Character, damage: number) {
        if (this.calculateAccuracy() && this.calculateDodge(target)) {
            if (this.calculateCrit()) {
                damage *= CRITICAL_HIT_MULTIPLIER;
                console.log(`Critical hit! Damage is increased to ${damage}`);
            }

            damage = this.applyElementalEffect(damage, target.element);
            this.displayDamage = damage;
            target.health -= damage;

            console.log(`Target ${target.name} got damage ${damage}, HP: ${Math.max(target.health, 0)}/${target.maxHealth}`);
            console.log(``);
        } else {
            console.log(`Attack missed or was dodged!`);
            console.log(``);
        }
    }

    private useActiveSkill(target: Character) {
        this.skillEffect.effects.forEach((effect: IEffect) => {
            if (Math.random() <= effect.chance && effect.target === 'Enemy') {
                switch (effect.type) {
                    case 'Damage':
                        this.handleDamageEffect(effect, target);
                        break;
                    case 'True Damage':
                        this.handleTrueDamageEffect(effect, target);
                        break;
                    case 'Debuff':
                        this.handleDebuffEffect(effect, target);
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

    // Handle Active Skill Effect Methods
    private handleDamageEffect(effect: IEffect, target: Character) {
        let damage = Math.ceil(effect.value * this.calculatePhysicalDamage());
    
        if (this.calculateDodge(target)) {
            if (this.calculateCrit()) {
                damage *= CRITICAL_HIT_MULTIPLIER;
                console.log(`Critical hit! Damage is increased to ${damage}`);
            }
    
            damage = this.applyElementalEffect(damage, target.element);
            this.displayDamage = damage;
            target.health -= damage;
    
            console.log(`Character ${this.name} using active skill deals ${damage} (${this.activeSkill.name})!, HP: ${Math.max(target.health, 0)}/${target.maxHealth}`);
            console.log(``);
        } else {
            console.log("Attack missed, enemy dodged it!");
            console.log(``);
        }
    }
    
    private handleTrueDamageEffect(effect: IEffect, target: Character) {
        const damage = Math.ceil(effect.value * this.attack);
        this.displayDamage = damage;
        target.health -= damage;
    
        console.log(`Character ${this.name} using active skill deals ${damage} (${this.activeSkill.name})!, HP: ${Math.max(target.health, 0)}/${target.maxHealth}`);
        console.log(``);
    }

    // TODO: Solve this "any" problem.
    private handleDebuffEffect(effect: IEffect, target: any) {
        const attribute = effect.attribute.toLowerCase();

        const reductionValue = target[attribute] * effect.value;
        target[attribute] -= reductionValue;
        target[attribute] = +target[attribute].toFixed(3);
    
        target.status.push({
            type: effect.type,
            attribute: attribute,
            value: reductionValue,
            duration: effect.duration,
        });
    
        console.log(`Debuff applied: ${attribute} reduced by ${reductionValue}`);
        console.log(``);
    }
}