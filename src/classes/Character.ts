export class Character {
    maxHealth: number;
    displayDamage: number = 0;
    displayHealth: number;
    accuracy: number = 90;
    dodge: number = 2;
    critRate: number = 5;
    elementsData: { [key: string]: { strength: string, weakness: string } } = {
        'Pyro': {'strength': 'Aero', 'weakness': 'Aqua'},
        'Aqua': {'strength': 'Pyro', 'weakness': 'Volt'},
        'Volt': {'strength': 'Aqua', 'weakness': 'Terra'},
        'Terra': {'strength': 'Volt', 'weakness': 'Aero'},
        'Aero': {'strength': 'Terra', 'weakness': 'Pyro'},
        'Lumen': {'strength': 'Shade', 'weakness': 'Shade'},
        'Shade': {'strength': 'Lumen', 'weakness': 'Lumen'},
        'Neutralis': {'strength': '', 'weakness': ''}
    };

    constructor (
        public name: string,
        public health: number,
        public attack: number,
        public defense: number,
        public speed: number,
        public level: number,
        public rarity: string,
        public element: string,
        public skillCooldown: number,
    ) {
        this.maxHealth = health;
        this.displayHealth = health;
    }

    calculateAccuracy(): boolean {
        const hitChance = Math.random() * 100;
        return hitChance < this.accuracy;
    }

    calculateDodge(target: Character): boolean {
        const dodgeChance = Math.random() * 100;
        return dodgeChance >= target.dodge;
    }

    calculateCrit(): boolean {
        const critChance = Math.random() * 100;
        return critChance < this.critRate;
    }

    applyElementalEffect(damage: number, targetElement: string): number {
        if (this.elementsData[this.element]['strength'] === targetElement) {
            console.log(`Strong element! Initial Damage ${damage}`);
            return damage * 1.5;
        } else if (this.elementsData[this.element]['weakness'] === targetElement) {
            console.log(`Weak element! Initial Damage ${damage}`);
            return damage * 0.75;
        } else {
            return damage;
        }
    }

    useActiveSkill(target: Character) {
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
        } else {
            console.log(`Attack missed!`);
        }

        this.skillCooldown = 3;
    }

    attackCalculation (target: Character) {
        if (this.skillCooldown === 0) {
            this.useActiveSkill(target);
        } else {
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
            } else {
                console.log(`Attack missed!`);
            }
    
            if (this.skillCooldown > 0) {
                this.skillCooldown--;
            }
        }
    }
}