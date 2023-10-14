import { Character } from "./Character";

export class Team {
    members: Character[];

    constructor(members: Character[]) {
        this.members = members;
    }

    hasMember (character: Character) {
        return this.members.includes(character);
    }

    isDefeated () {
        return this.members.every(member => member.health <= 0);
    }
}