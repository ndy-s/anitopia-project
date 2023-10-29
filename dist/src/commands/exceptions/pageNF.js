"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageNF = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const pageNF = (interaction, totalPages, page, type = null) => {
    const pageNFEmbed = new discord_js_1.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔍 Page Not Found')
        .setFooter({
        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
        text: config_1.config.messages.footerText
    });
    if (type === 'empty') {
        pageNFEmbed.setDescription(`It seems you **don't have a character yet**. But hey, no worries! Every great adventure starts somewhere, right? You can use the ${config_1.config.commands.summonCommandTag} command to get your first character. Once you've done that, you'll be all set to use this command. Can't wait to see which character you'll get!`);
    }
    else if (type === 'nan') {
        pageNFEmbed.setDescription(`It looks like the page number you entered **isn't a number**. No problem, it happens sometimes! Could you please try again with a **whole number**? You have **${totalPages} ${page.command} page${totalPages > 1 ? 's' : ''}** of ${page.data}s to explore. Happy browsing!`);
    }
    else if (type === 'decimal') {
        pageNFEmbed.setDescription(`The page number you entered **is a decimal**. For this, we need a **whole number**. Could you please try again? Remember, you have **${totalPages} ${page.command} page${totalPages > 1 ? 's' : ''}** of ${page.data}s to check out. Happy browsing!`);
    }
    else {
        pageNFEmbed.setDescription(`The page number you entered is **out of range**. Don't worry, it's easy to lose track! Please try again. Just a heads up, there are **${totalPages} ${page.command} page${totalPages > 1 ? 's' : ''}** of ${page.data}s in total. Happy browsing!`);
    }
    interaction.reply({
        embeds: [pageNFEmbed],
        ephemeral: true,
    });
};
exports.pageNF = pageNF;
