const { Client, Interaction, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const exceptionCommand = require('../../exception/command');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply({ 
                content: "You can only run this command inside a server.", 
                ephemeral: true,
            });
            return;
        }

        try {
            let user = await User.findOne({ userId: interaction.member.id, guildId: interaction.guild.id, });

            if (user) {
                const lastDailyDate = new Date(user.lastDaily);
                const currentDate = new Date();

                if (lastDailyDate.toDateString() === currentDate.toDateString()) {
                    interaction.reply(
                        "You have already collected your dailies today. Come back tommorow!"
                    );
                    return;
                }

                let dailyCoin = 1000;
                let bonusCoin = 0;
                const dailyAniCoin = 10;

                user.lastDaily = currentDate;
                user.coin += dailyCoin;
                user.aniCoin += dailyAniCoin;
                
                if (user.dailyStreak < 29) {
                    const weeklyStreak = Math.min(Math.ceil(user.dailyStreak / 7), 4);
                    for (let i = 1; i <= weeklyStreak; i++) {
                        let bonusCoinCalc = 500;
                        for (let j = 1; j < i; j++) {
                            bonusCoinCalc *= j;
                        }
                        bonusCoin += bonusCoinCalc;
                    }
                    if (weeklyStreak === 3) bonusCoin += 500; 
                } else {
                    bonusCoin += 5000;
                }
                
                user.coin += bonusCoin;
                const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
                const daysDifference = Math.floor((currentDate - lastDailyDate) / oneDay);
                user.dailyStreak = (daysDifference <= 1) ? user.dailyStreak + 1 : 1;
                await user.save();

                const emojiId = client.guilds.cache.get("1105456989108178984").emojis.cache.find((emoji) => emoji.name === "AniCoin").id;
                interaction.reply({ embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle("Daily Rewards")
                        .setDescription("+1000 Coins 🪙\n+10 AniCoins <:AniCoin:"+emojiId+">\nGet **more rewards** with ``/vote``")
                        .setFooter({ text: `Current streak: ${Math.max(user.dailyStreak - 1, 0)} | Bonus: ${bonusCoin} Coins` })
                ]});
            } else {
                exceptionCommand(interaction);
                return;
            }
        } catch (error) {
            console.log(`Error with /daily: ${error}`);
        }
    },
    name: 'daily',
    description: "Claim your daily rewards! Get 1000 Coins (500 + weeklystreak) and 10 AniCoins",
}
