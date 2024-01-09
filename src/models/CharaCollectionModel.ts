import { Model, Schema, model } from "mongoose";
import { ICharaCollectionModel } from "../../discord-bot/src/interfaces";

const charaCollectionSchema = new Schema({
    playerId: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    characterId: {
        type: String,
        required: true,
        unique: true
    },
    character: {
        type: Schema.Types.ObjectId,
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

export const CharaCollectionModel = model<ICharaCollectionModel>('CharaCollection', charaCollectionSchema);