import { Schema, model } from "mongoose";

const skillSchema = new Schema({
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

const SkillModel = model('Skill', skillSchema);
export default SkillModel;