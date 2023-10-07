import { Schema, model } from 'mongoose';

const accountSchema = new Schema({
    accountId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 32,
    },
    token: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: 'This user has not provided a bio yet.',
        maxLength: 100
    },
    goldenCoins: {
        type: Number,
        default: 0,
    },
    stellarCrystals: {
        type: Number,
        default: 0,
    },
    exp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    dailyStreak: {
        type: Number,
        default: 0,
    },
    lastDaily: {
        type: Date,
        default: new Date(0),
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const AccountModel = model('Account', accountSchema);
export default AccountModel;