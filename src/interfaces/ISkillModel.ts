export interface IEffect {
    type: string;
    attribute: string;
    value: number;
    chance: number;
    duration: number;
    target: string;
}

export interface IRarityEffect {
    effects: IEffect[];
    description: string;
}

export interface ISkillModel {
    name: string;
    type: 'Active' | 'Passive';
    cooldown?: number;
    trigger?: 'Battle Start' | 'Each Turn' | 'Health -50%' | 'Damage Taken' | 'Attack' | null;
    target: 'Single' | 'Area';
    rarityEffects: Map<string, IRarityEffect>;
    createdAt: Date;
    updatedAt: Date;
}
