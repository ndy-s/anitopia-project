import { CollectedInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";

export const characterNF = (
    interaction: CommandInteraction | CollectedInteraction, 
    type: string | null = null
) => {
    const characterNFEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 Character Not Found')
        .setFooter({
            text: config.messages.footerText
        });

    if (type === 'spaces') {
        characterNFEmbed.setDescription(`It seems like there might be **spaces** in your character ID. Could you please remove any spaces and try again? We appreciate your patience!`);
    } else if (type === 'symbols') {
        characterNFEmbed.setDescription(`Hmm, your character ID seems to contain **symbols**. Remember, only alphanumeric characters are allowed in character IDs. Could you please check your input and try again? Thanks for understanding!`);
    } else if (type === 'notOwned') {
        characterNFEmbed.setTitle('🚫 Unauthorized Character Access')
        characterNFEmbed.setDescription(`It seems like you **don't own** the character with the given ID. Please make sure you **own the character** and try again.`);
    } else {
        characterNFEmbed.setDescription(`The character ID might be **incorrect**. Please make sure you have a character with the given ID and try again.`);
    } 

    interaction.reply({
        embeds: [characterNFEmbed],
        ephemeral: true,
    });
}