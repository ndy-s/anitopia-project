const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    stamina: {
        type: Number,
        require: 0,
    },
    coin: {
        type: Number,
        default: 0,
    },
    aniCoin: {
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
});

module.exports = model('User', userSchema);