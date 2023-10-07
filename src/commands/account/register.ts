import { Client, CommandInteraction } from "discord.js";
import AccountModel from "../../models/Account";

import registrationNA from "../exceptions/registrationNA";
import generateRandomCode from "../../utils/generateRandomCode";

export default {
    callback: async (client: Client, interaction: CommandInteraction) => {

    },

    name: 'register',
    description: 'lol',
};