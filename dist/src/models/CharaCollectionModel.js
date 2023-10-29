"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharaCollectionModel = void 0;
const mongoose_1 = require("mongoose");
const charaCollectionSchema = new mongoose_1.Schema({
    playerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    characterId: {
        type: String,
        required: true,
        unique: true
    },
    character: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Character',
        required: true
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
    },
    experience: {
        type: Number,
        default: 0,
        min: 0,
    },
    rarity: {
        type: Number,
        // 1: Legendary, 2: Epic, 3: Rare, 4: Uncommon, 5: Common
        enum: [1, 2, 3, 4, 5],
        default: 5,
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
}, { timestamps: true });
exports.CharaCollectionModel = (0, mongoose_1.model)('CharaCollection', charaCollectionSchema);
