import { Schema, model } from 'mongoose';
import { ICooldownModel } from '../interfaces';

const cooldownSchema = new Schema({
    commandName: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    endsAt: {
        type: Date,
        required: true,
    }
});

export const CooldownModel = model<ICooldownModel>('Cooldown', cooldownSchema);