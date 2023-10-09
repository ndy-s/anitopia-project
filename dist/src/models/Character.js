"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const characterSchema = new mongoose_1.Schema({
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
const CharacterModel = (0, mongoose_1.model)('Character', characterSchema);
exports.default = CharacterModel;
