import { Document, ObjectId } from "mongoose";
import { ICharaCollectionModel } from "./ICharaCollectionModel";

interface IBalance {
    aniCoin: number;
    aniCrystal: number;
}

interface IExperience {
    exp: number;
    level: number;
}

interface IDailyStreak {
    streak: number;
    lastDaily: Date;
}

interface IScroll {
    count: number;
    guaranteed?: number;
    lastClaim?: Date;
}

interface IScrolls {
    novice: IScroll;
    elite: IScroll;
    series: IScroll;
}

export interface ILineup {
    position: 'frontMiddle' | 'frontLeft' | 'frontRight' | 'backLeft' | 'backRight' | 'backMiddle';
    character: ObjectId | ICharaCollectionModel;
}

export interface ITeams {
    name: string;
    size: 3 | 5;
    lineup: ILineup[];
}

interface IActiveteams {
    teamOfThree: string | null;
    teamOfFive: string | null;
}

export interface IPlayerModel extends Document {
    userId: string;
    guildId: string;
    playerId: string;
    bio?: string;
    balance: IBalance;
    experience: IExperience;
    dailyStreak: IDailyStreak;
    scrolls: IScrolls;
    teams: ITeams[];
    activeTeams: IActiveteams;
    createdAt: Date;
    updatedAt: Date;
}