const { config, util } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.reply("⚠️ You do not have the permissions to run this command! You require `ADMINISTRATOR` permissions");
        return;
    }

    if (!args[0]) return client.commands.get("help").execute(client, message, ["reload"]);
    const cmd = args[0].toLowerCase();
    const res = util.reloadCommand(cmd);

    switch (res) {
        case "Command Loaded": {
            message.reply(`✅ Command \`${cmd}\` reloaded successfully!`);
            break;
        }
        case "Command Not Loaded": {
            message.reply(`⚠️ Command \`${cmd}\` was never loaded! Use \`${config.prefix}load ${cmd}\` to load it!`);
            break;
        }
        case "Unknown Command": {
            message.reply("⚠️ The command provided does not exist!");
            break;
        }
        case "Error": {
            message.reply("⚠️ An unknown an error has occurred when reloding the command!");
            break;
        }
    }

}

module.exports.help = {
    name: "reload",
    aliases: ["rl"],
    category: "Admin",
    usage: "<command>",
    description: "Did you make changes to a command? Reload it without restarting the me!"
}