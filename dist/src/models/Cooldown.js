"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const CooldownModel = (0, mongoose_1.model)('Cooldown', cooldownSchema);
exports.default = CooldownModel;
