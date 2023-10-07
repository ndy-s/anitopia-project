"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cooldown_1 = require("../../models/Cooldown");
exports.default = () => {
    setInterval(async () => {
        try {
            const cooldowns = await Cooldown_1.default.find().select('endsAt');
            for (const cooldown of cooldowns) {
                if (Date.now() < cooldown.endsAt.getTime())
                    return;
                await Cooldown_1.default.deleteOne({ _id: cooldown._id });
            }
        }
        catch (error) {
            console.log(`Error clearing cooldowns: ${error}`);
        }
    }, 3.6e6);
};
