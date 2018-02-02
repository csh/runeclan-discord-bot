runeclan-discord-bot
====================

A nifty bot that scrapes Runeclan for highscore data and then renders it as a fancy list. Emojis sold separately. :cold_sweat:

This bot uses [cheerio](https://github.com/cheeriojs/cheerio) for jQuery-like HTML parsing to make my life easier.

Code is by no means suitable for a production environment.

## Setup

1. Clone the master branch of the repository
2. Edit the config.js file
    1. Set `discord_token` to the token you're given here [discord-apps][here]
    2. Set `clan_name` to your clan name, the bot automatically replaces whitespace characters
    3. Set `duration` to one of:
        - `today`
        - `yesterday`
        - `week`
        - `last_week`
        - `month`
        - `last_month`
        - `year`
        - `last_year`
        - `double_xp_weekend`
3. Run the bot using `yarn run start` or `npm run start`

[here]: https://discordapp.com/developers/applications/me
