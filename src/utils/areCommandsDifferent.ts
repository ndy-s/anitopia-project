import { ApplicationCommand, ApplicationCommandOptionChoiceData, ApplicationCommandOptionData, GuildResolvable } from "discord.js";
import { CommandObject } from "../interfaces";

export default (existingCommand: ApplicationCommand<{ guild: GuildResolvable }>, localCommand: CommandObject) => {
    const areChoicesDifferent = (existingChoices: ApplicationCommandOptionChoiceData[], localChoices: ApplicationCommandOptionChoiceData[]) => {
        for (const localChoice of localChoices) {
            const existingChoice = existingChoices?.find(
                (choice) => choice.name === localChoice.name
            );

            if (!existingChoice) {
                return true;
            }

            if (localChoice.value !== existingChoice.value) {
                return true;
            }
        }
        return false;
    };

    const areOptionsDifferent = (existingOptions: any[], localOptions: any[]) => {
        for (const localOption of localOptions) {
            if (Array.isArray(localOption)) {
                console.log("Encountered an empty array for localOption.");
            } else {
                const existingOption = existingOptions?.find(
                    (option) => option.name === localOption.name
                );

                if (!existingOption) {
                    return true;
                }

                if (
                    localOption.description !== existingOption.description ||
                    localOption.type !== existingOption.type ||
                    (localOption.required || false) !== existingOption.required ||
                    (localOption.choices?.length || 0) !== (existingOption.choices?.length || 0) ||
                    areChoicesDifferent(localOption.choices || [], existingOption.choices || []))
                {
                    return true;
                }
            }
        }
        return false;
    };

    if (
        existingCommand.description !== localCommand.description ||
        (existingCommand.options as ApplicationCommandOptionData[])?.length !== (localCommand.options?.length || 0) ||
        areOptionsDifferent(existingCommand.options as ApplicationCommandOptionData[], localCommand.options || []))
    {
        return true;
    }
    return false;
};