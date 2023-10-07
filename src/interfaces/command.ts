import { ApplicationCommandOptionData, Client, Interaction, PermissionsString } from "discord.js";

export interface CommandObject {
    name: string;
    description: string;
    cooldown: number;
    options: (ApplicationCommandOptionData | [])[];
    deleted: boolean;

    devOnly: boolean;
    testOnly: boolean;
    botPermissions: PermissionsString[] | [];
    permissionsRequired: PermissionsString[] | [];
    
    callback: (client: Client, interaction: Interaction) => void;
};