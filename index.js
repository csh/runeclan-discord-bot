import humanFormat from 'human-format';
import Discord from 'discord.js';

import scraper from './lib/runeclan_lookup';
import logger from './lib/logging';
import config from './config';

if (config.discord_token === null) {
  logger.error('Discord token has not been configured');
  process.exit(1);
}

const skill_groups = new Map([
  ['default', [2, 29]],
  ['Combat', ['attack', 'strength', 'defence', 'ranged', 'magic', 'constitution', 'summoning', 'prayer']],
  ['Gathering', ['mining', 'fishing', 'woodcutting', 'farming', 'hunter', 'divination']],
  ['Artisan', ['herblore', 'crafting', 'fletching', 'smithing', 'cooking', 'firemaking', 'runecrafting', 'construction']],
]);

const time_mappings = {
    'today': 'Today',
    'yesterday': 'Yesterday',
    'week': 'This Week',
    'month': 'This Month',
    'last_week': 'Last Week',
    'last_month': 'Last Month',
    'last_year': 'Last Year',
};

function format_rankings(rankings) {
    let message_lines = [];
    for (var i = 0; i < rankings.length; i++) {
        let ranking = rankings[i];
        let formattedExp = humanFormat(ranking.xp, {
            decimal: 1
        });
        message_lines.push(`${config.medals[i]} ${ranking.rsn} (${formattedExp})`);
    }
    return message_lines.join('\n');
}

async function scrape(msg) {
    const sc = new scraper();
    for (let [group_name, skills] of skill_groups) {
        let results;
        try {
            results = await sc.scrape(config.clan_name, skills, {
                duration: config.duration,
                record_count: config.medals.length,
            });
        } catch (e) {
            logger.error(`Something went wrong: ${e.stack}`)
            msg.reply(`Something went wrong: ${e}`);
            return;
        }

        let fields = [];
        for (let i = 0; i < results.length; i++) {
            let result = results[i];
            if (i > 0 && i + 1 < results.length && i % 3 == 0) {
              fields.push({
                inline: true,
                name: '\u200B',
                value: '\u200B',
              });
            }
            fields.push({
              inline: true,
              name: result.skill_name,
              value: format_rankings(result.rankings),
            });
        }

        if (fields.length > 0) {
          let padding = (Math.ceil((fields.length) / 3) * 3) - 1;
          console.log(`fields.length: ${fields.length}, padding: ${padding}`)
          for (let i = fields.length; i < padding; i++) {
            fields.push({
              inline: true,
              name: '\u200B',
              value: '\u200B',
            });
          }

          console.log(fields);
        }

        let title = [
            `${config.clan_name} Top Gains`,
        ];

        if (group_name !== 'default') {
            title.push(group_name);
        }

        title.push(time_mappings[config.duration]);
        msg.channel.send({
            embed: {
                author: {
                    name: title.join(' | '),
                    url: 'http://i.imgur.com/TkiKjWM.png'
                },
                description: 'Congratulations to the top gainers in each category!',
                fields: fields
            }
        });
    }
}

const client = new Discord.Client();

client.on('message', msg => {
    if (['!hiscores', '!hs', '!highscores'].includes(msg.content)) {
        logger.debug('Triggered highscores lookup');
        scrape(msg);
    }
});

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);

    let channel = client.channels.find('id', '400242024781053956');
    // channel.sendMessage('<@302433759024906241> is a noob (runeclan.bot.connect:15:2)'); // Electronics
});

client.login(config.discord_token);
