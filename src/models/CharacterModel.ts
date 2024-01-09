import { Schema, model } from "mongoose";
import { ICharacterModel } from "../../discord-bot/src/interfaces";

const skillReferenceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    descriptions: {
        type: Map,
        of: String
    },
    skill: {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: true

    }
}, { _id: false });

const characterSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    series: {
        type: String,
        required: true,
    },
    element: {
        type: String,
        required: true,
        enum: ['Pyro', 'Aqua', 'Volt', 'Terra', 'Aero', 'Lumen', 'Shade', 'Neutralis']
    },
    class: {
        type: String,
        required: true,
        enum: ['Mage', 'Warrior', 'Tank', 'Hunter', 'Support']
    },
    attributes: {
        health: {
            type: Number,
            required: true,
        },
        attack: {
            type: Number,
            required: true,
        },
        defense: {
            type: Number,
            required: true,
        },
        speed: {
            type: Number,
            required: true,
        },
    },
    passiveSkill: skillReferenceSchema,
    activeSkill: skillReferenceSchema,
    quotes: String,
}, { timestamps: true });

export const CharacterModel = model<ICharacterModel>('Character', characterSchema);