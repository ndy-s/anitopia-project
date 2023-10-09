"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const skillSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['passive', 'active'],
        required: true,
    },
    effects: {
        damage: {
            ammount: {
                type: Number,
            },
            turns: {
                type: Number,
            },
        },
        heal: {
            ammount: {
                type: Number,
            },
            turns: {
                type: Number,
            }
        }
    }
}, { timestamps: true });
const SkillModel = (0, mongoose_1.model)('Skill', skillSchema);
exports.default = SkillModel;
