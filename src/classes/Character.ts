export class Character {
    maxHealth: number;
    displayDamage: number[] = [];
    displayHealth: number;

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

    useActiveSkill(target: Character) {
        console.log(`Character ${this.name} using active skill!`);
        const damage = 500;
        this.displayDamage.push(damage);
        target.health -= damage;

        console.log(`Target ${target.name} got damage ${damage}, HP: ${target.health}/${target.maxHealth}`);
        console.log(``);

        this.skillCooldown = 3;
    }

    attackCalculation (target: Character) {
        if (this.skillCooldown === 0) {
            this.useActiveSkill(target);
        } else {
            const damage = Math.max(0, Math.ceil(((2 * this.attack ** 2 + this.attack) / (this.attack + this.defense ** 0.85)) + Math.log(this.health) * (Math.random() * 1.2 - 0.1)));

            this.displayDamage.push(damage);
            target.health -= damage;
    
            console.log(`Target ${target.name} got damage ${damage}, HP: ${target.health}/${target.maxHealth}`);
            console.log(``)
    
            if (this.skillCooldown > 0) {
                this.skillCooldown--;
            }
        }
    }
}