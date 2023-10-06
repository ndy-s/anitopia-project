import { ApplicationCommandOptionData, Client, Interaction } from "discord.js";

export interface CommandObject {
    name: string;
    description: string;
    options: (ApplicationCommandOptionData | [])[];
    devOnly: boolean;
    testOnly: boolean;
    deleted: boolean;
    callback: (client: Client, interaction: Interaction) => void;
};