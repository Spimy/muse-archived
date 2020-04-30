const discord = require("discord.js");

const config = require("./config.json");
const utils = require("./utils/util.js");
const mh = require("./utils/music_handler.js");

const client = new discord.Client();
const util = new utils.Utils(client, process.cwd());
const music_handler = new mh.MusicHandler(discord, util);
module.exports = { client, config, util, music_handler };

client.commands = new discord.Collection();
client.aliases = new discord.Collection();

util.loadModules("events");
util.loadModules("commands", true);


/*  Change to client.login(process.env.TOKEN)
    and set the TOKEN as an environment variable in .env  */
client.login(config.token);