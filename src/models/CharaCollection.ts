import { Schema, model } from "mongoose";

const characterSchema = new Schema({
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
const CharaCollectionModel = model('CharaCollection', characterSchema);
export default CharaCollectionModel;