import { Schema, model } from 'mongoose';

const playerSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: 'This user has not provided a bio yet.',
        maxLength: 100
    },
    balance: {
        goldenCoins: {
            type: Number,
            default: 0,
        },
        stellarCrystals: {
            type: Number,
            default: 0,
        },
    },
    experience: {
        exp: {
            type: Number,
            default: 0,
            min: 0,
        },
        level: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    dailyStreak: {
        streak: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastDaily: {
            type: Date,
            default: new Date(0),
        },
    },
    characters: [{
        characterToken: {
            type: String,
            requierd: true
        },
        character: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
            required: true
        },
        level: {
            type: Number,
            default: 0,
            min: 0,
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
        },
        rarity: {
            type: String,
            enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
            default: 'Common',
        },
        attributes: {
            health: {
                type: Number,
                default: 0,
                min: 0,
            },
            attack: {
                type: Number,
                default: 0,
                min: 0,
            },
            defense: {
                type: Number,
                default: 0,
                min: 0,
            },
            speed: {
                type: Number,
                default: 0,
                min: 0,
            },
        }
    }],
}, { timestamps: true });

const PlayerModel = model('Player', playerSchema);
export default PlayerModel;