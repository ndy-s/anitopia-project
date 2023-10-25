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

export interface IPlayerModel {
    userId: string;
    guildId: string;
    playerId: string;
    bio?: string;
    balance: IBalance;
    experience: IExperience;
    dailyStreak: IDailyStreak;
    scrolls: IScrolls;
    createdAt: Date;
    updatedAt: Date;
}