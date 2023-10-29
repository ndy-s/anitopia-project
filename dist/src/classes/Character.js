"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
class Character {
    name;
    health;
    attack;
    defense;
    speed;
    level;
    rarity;
    element;
    skillCooldown;
    maxHealth;
    displayDamage = 0;
    displayHealth;
    accuracy = 90;
    dodge = 2;
    critRate = 5;
    elementsData = {
        'Pyro': { 'strength': 'Aero', 'weakness': 'Aqua' },
        'Aqua': { 'strength': 'Pyro', 'weakness': 'Volt' },
        'Volt': { 'strength': 'Aqua', 'weakness': 'Terra' },
        'Terra': { 'strength': 'Volt', 'weakness': 'Aero' },
        'Aero': { 'strength': 'Terra', 'weakness': 'Pyro' },
        'Lumen': { 'strength': 'Shade', 'weakness': 'Shade' },
        'Shade': { 'strength': 'Lumen', 'weakness': 'Lumen' },
        'Neutralis': { 'strength': '', 'weakness': '' }
    };
    constructor(name, health, attack, defense, speed, level, rarity, element, skillCooldown) {
        this.name = name;
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.level = level;
        this.rarity = rarity;
        this.element = element;
        this.skillCooldown = skillCooldown;
        this.maxHealth = health;
        this.displayHealth = health;
    }
    calculateAccuracy() {
        const hitChance = Math.random() * 100;
        return hitChance < this.accuracy;
    }
    calculateDodge(target) {
        const dodgeChance = Math.random() * 100;
        return dodgeChance >= target.dodge;
    }
    calculateCrit() {
        const critChance = Math.random() * 100;
        return critChance < this.critRate;
    }
    applyElementalEffect(damage, targetElement) {
        if (this.elementsData[this.element]['strength'] === targetElement) {
            console.log(`Strong element! Initial Damage ${damage}`);
            return damage * 1.5;
        }
        else if (this.elementsData[this.element]['weakness'] === targetElement) {
            console.log(`Weak element! Initial Damage ${damage}`);
            return damage * 0.75;
        }
        else {
            return damage;
        }
    }
    useActiveSkill(target) {
        console.log(`Character ${this.name} using active skill!`);
        let damage = 500;
        damage = this.applyElementalEffect(damage, target.element);
        if (this.calculateAccuracy() && this.calculateDodge(target)) {
            if (this.calculateCrit()) {
                damage *= 2;
                console.log(`Critical hit! Damage is increased to ${damage}`);
            }
            this.displayDamage = damage;
            target.health -= damage;
            console.log(`Target ${target.name} got damage ${damage}, HP: ${target.health}/${target.maxHealth}`);
            console.log(``);
        }
        else {
            console.log(`Attack missed!`);
        }
        this.skillCooldown = 3;
    }
    attackCalculation(target) {
        if (this.skillCooldown === 0) {
            this.useActiveSkill(target);
        }
        else {
            let damage = Math.max(0, Math.ceil(((2 * this.attack ** 2 + this.attack) / (this.attack + this.defense ** 0.85)) + Math.log(this.health) * (Math.random() * 1.2 - 0.1)));
            damage = this.applyElementalEffect(damage, target.element);
            if (this.calculateAccuracy() && this.calculateDodge(target)) {
                if (this.calculateCrit()) {
                    damage *= 2;
                    console.log(`Critical hit! Damage is increased to ${damage}`);
                }
                this.displayDamage = damage;
                target.health -= damage;
                console.log(`Target ${target.name} got damage ${damage}, HP: ${target.health}/${target.maxHealth}`);
                console.log(``);
            }
            else {
                console.log(`Attack missed!`);
            }
            if (this.skillCooldown > 0) {
                this.skillCooldown--;
            }
        }
    }
}
exports.Character = Character;
