const discord = require("discord.js");

const config = require("./config.json");
const utils = require("./utils/util.js");
const mh = require("./utils/music_handler.js");

const client = new discord.Client();
const util = new utils.Utils(client);
const music_handler = new mh.MusicHandler();
module.exports = { client, config, util, music_handler };

client.commands = new discord.Collection();
client.aliases = new discord.Collection();

util.loadModules(process.cwd() + "\\events\\");
util.loadModules(process.cwd() + "\\commands\\", true);


client.login(config.token);