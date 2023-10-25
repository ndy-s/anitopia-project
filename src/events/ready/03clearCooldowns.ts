import { CooldownModel } from "../../models";

export default () => {
    setInterval(async () => {
        try {
            const cooldowns = await CooldownModel.find().select('endsAt');

            for (const cooldown of cooldowns) {
                if (Date.now() < cooldown.endsAt.getTime()) return;

                await CooldownModel.deleteOne({ _id: cooldown._id });
            }
        } catch (error) {
            console.log(`Error clearing cooldowns: ${error}`);
        }
    }, 3.6e6);
};