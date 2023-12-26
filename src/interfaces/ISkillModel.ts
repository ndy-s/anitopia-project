export interface IEffect {
    type: string;
    attribute: string;
    value: number;
    chance: number;
    duration: number;
    target: 'Enemy' | 'Ally';
}

export interface IRarityEffect {
    effects: IEffect[];
    description: string;
}

export interface ISkillModel {
    name: string;
    type: 'Active' | 'Passive';
    cooldown?: number;
    trigger?: 'Battle Start' | 'Each Turn' | 'Health -50%' | 'Health -25%' | 'Damage Taken' | 'Attack' | 'Defeated' | null;
    target: 'Single' | 'Area' | 'Highest Health' | 'Lowest Health' | 'Random';
    rarityEffects: Map<string, IRarityEffect>;
    createdAt: Date;
    updatedAt: Date;
}
