import { Model, Schema, model } from "mongoose";
import { ICharaCollectionModel } from "../interfaces";

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
}, { timestamps: true });

export const CharaCollectionModel = model<ICharaCollectionModel>('CharaCollection', charaCollectionSchema);