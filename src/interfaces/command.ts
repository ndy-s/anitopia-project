import { ApplicationCommandOptionData, Client, Interaction, PermissionsString } from "discord.js";

export interface CommandObject {
    name: string;
    description: string;
    options: (ApplicationCommandOptionData | [])[];
    devOnly: boolean;
    testOnly: boolean;
    deleted: boolean;
    botPermissions: PermissionsString[] | [];
    permissionsRequired: PermissionsString[] | [];
    callback: (client: Client, interaction: Interaction) => void;
};