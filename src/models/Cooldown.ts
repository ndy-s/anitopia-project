import { Schema, model } from 'mongoose';

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

const CooldownModel = model('Cooldown', cooldownSchema);
export default CooldownModel;