"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
class Team {
    members;
    constructor(members) {
        this.members = members;
    }
    hasMember(character) {
        return this.members.includes(character);
    }
    isDefeated() {
        return this.members.every(member => member.health <= 0);
    }
}
exports.Team = Team;
