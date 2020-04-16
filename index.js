const discord = require("discord.js");

const config = require("./config.json");
const utils = require("./utils/util.js");
const music_handler = require("./utils/music_handler.js");

const client = new discord.Client();
const util = new utils.Utils(client);
module.exports = { client, config, util };

client.commands = new discord.Collection();
client.aliases = new discord.Collection();

util.loadModules(process.cwd() + "\\events\\");
util.loadModules(process.cwd() + "\\commands\\", true);


client.login(config.token);