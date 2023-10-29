"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CooldownModel = void 0;
const mongoose_1 = require("mongoose");
const cooldownSchema = new mongoose_1.Schema({
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
exports.CooldownModel = (0, mongoose_1.model)('Cooldown', cooldownSchema);
