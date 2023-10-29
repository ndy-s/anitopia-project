"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModel = void 0;
const mongoose_1 = require("mongoose");
const playerSchema = new mongoose_1.Schema({
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
    }
}, { timestamps: true });
exports.PlayerModel = (0, mongoose_1.model)('Player', playerSchema);
