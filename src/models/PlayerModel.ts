import { Schema, model } from 'mongoose';
import { IPlayerModel } from '../interfaces';

const lineupSchema = new Schema({
    position: {
        type: String,
        enum: ['frontMiddle', 'frontLeft', 'frontRight', 'backLeft', 'backRight', 'backMiddle'],
        required: true,
    },
    character: {
        type: Schema.Types.ObjectId,
        ref: 'CharaCollection',
        default: null
    }
}, { _id: false });

const playerSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    guildId: {
        type: String,
        required: true,
    },
    playerId: {
        type: String,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        default: 'This user has not provided a bio yet.',
        maxLength: 100
    },
    balance: {
        aniCoin: {
            type: Number,
            default: 0,
        },
        aniCrystal: {
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
    scrolls: {
        novice: {
            count: { 
                type: Number, 
                default: 0 
            },
            guaranteed: { 
                type: Number, 
                default: 0 
            },
            lastClaim: { 
                type: Date, 
                default: new Date(0),
            }
        },
        elite: {
            count: { 
                type: Number, 
                default: 0 
            },
            guaranteed: { 
                type: Number, 
                default: 100 
            }
        },
        series: {
            count: { 
                type: Number, 
                default: 0 
            }
        }
    },
    teams: [{
        name: {
            type: String,
            required: true,
            unique: true,
            maxLength: 15
        },
        size: {
            type: Number,
            enum: [3, 5],
            required: true
        },
        lineup: {
            type: [lineupSchema],
            required: true
        }
    }],
    activeTeams: {
        teamOfThree: {
            type: String,
            default: null
        },
        teamOfFive: {
            type: String,
            default: null
        }
    }
}, { timestamps: true });

export const PlayerModel = model<IPlayerModel>('Player', playerSchema);