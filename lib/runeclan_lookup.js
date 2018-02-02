import logger from './logging';
import cheerio from 'cheerio';
import request from 'request';
import Promise from 'promise';

class RuneclanHighscoreScraper {
  static get SKILLS_BY_ID() {
    return new Map([
      [ 2, 'Overall' ],
      [ 3, 'Attack' ],
      [ 4, 'Defence' ],
      [ 5, 'Strength' ],
      [ 6, 'Constitution' ],
      [ 7, 'Ranged' ],
      [ 8, 'Prayer' ],
      [ 9, 'Magic' ],
      [ 10, 'Cooking' ],
      [ 11, 'Woodcutting' ],
      [ 12, 'Fletching' ],
      [ 13, 'Fishing' ],
      [ 14, 'Firemaking' ],
      [ 15, 'Crafting' ],
      [ 16, 'Smithing' ],
      [ 17, 'Mining' ],
      [ 18, 'Herblore' ],
      [ 19, 'Agility' ],
      [ 20, 'Thieving' ],
      [ 21, 'Slayer' ],
      [ 22, 'Farming' ],
      [ 23, 'Runecrafting' ],
      [ 24, 'Hunter' ],
      [ 25, 'Construction' ],
      [ 26, 'Summoning' ],
      [ 27, 'Dungeoneering' ],
      [ 28, 'Divination' ],
      [ 29, 'Invention' ]
    ]);
  }

  static get SKILLS_BY_NAME() {
    let skills_by_name = new Map();
    for (let [key, value] of RuneclanHighscoreScraper.SKILLS_BY_ID) {
      skills_by_name.set(value, key);
      skills_by_name.set(value.toUpperCase(), key);
      skills_by_name.set(value.toLowerCase(), key);
    }
    return skills_by_name;
  }

  scrape(clan_name, skills, options = { duration: 'week', record_count: 10 }) {
    logger.debug(`Scraping data for ${skills.length} skills for "${clan_name}"`);

    if (clan_name === null || clan_name.length < 1) {
      throw new Error('clan_name should not be null or empty');
    }

    if (!options.record_count || options.record_count < 1) {
      throw new Error('options.record_count defined incorrectly');
    }

    clan_name = clan_name.replace(/\s/g, '_');

    let promises = skills.map(skill_id => {
      if (typeof skill_id === 'string') {
        logger.debug(`Translated '${skill_id}' into ${RuneclanHighscoreScraper.SKILLS_BY_NAME.get(skill_id)}`);
        skill_id = RuneclanHighscoreScraper.SKILLS_BY_NAME.get(skill_id);
      }

      return new Promise((resolve, reject) => {
        request.post({
          url: `http://www.runeclan.com/clan/${clan_name}/xp-tracker?skill=${skill_id}`,
          form: {
            criteria_set1: options.duration,
            criteria_set2: options.duration,
            criteria_set3: options.duration,
          }
        }, function(error, res, body) {
          if (error !== null) {
            logger.error(`Something went wrong: ${error.stack}`)
            reject(error);
            return;
          }

          const $ = cheerio.load(body);

          let rankings = $('div.clan_trk_wrap table.regular tr')
                          .filter((i, el) => $(el).children().length > 0 && !$(el).hasClass('clan_totals'))
                          .map((i, el) => {
                            let xp = $(el).children('.clan_xpgain_trk').first().text();
                            xp = parseFloat(xp.replace(/,/g, ''))

                            return {
                              rank: $(el).children('.clan_num_rank').first().text(),
                              rsn: $(el).children('.clan_rsn2').first().text(),
                              xp: xp,
                            };
                          })
                          .get()
                          .slice(1);

          resolve({
            skill_id: skill_id,
            skill_name: RuneclanHighscoreScraper.SKILLS_BY_ID.get(skill_id),
            rankings: rankings.slice(0, options.record_count),
          })
        });
      });
    });
    return Promise.all(promises);
  }
}

export default RuneclanHighscoreScraper;
