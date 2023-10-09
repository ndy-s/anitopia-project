import { Schema, model } from "mongoose";

const characterSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    element: {
        type: String,
        required: true,
    },
    rarity: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    status: {
        health: {
            type: Number,
        },
        attack: {
            type: Number,
        },
        defense: {
            type: Number,
        },
        speed: {
            type: Number,
        },
    },


}, { timestamps: true });

const CharacterModel = model('Character', characterSchema);
export default CharacterModel;