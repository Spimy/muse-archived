const { config, util } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.reply("⚠️ You do not have the permissions to run this command! You require `ADMINISTRATOR` permissions");
        return;
    }

    if (!args[0]) return client.commands.get("help").execute(client, message, ["unload"]);
    const cmd = args[0].toLowerCase();
    const res = util.unloadCOmmand(cmd, false);

    switch (res) {
        case "Command Unloaded": {
            message.reply(`✅ Command \`${cmd}\` unloaded successfully!`);
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
    name: "unload",
    aliases: ["unloadcmd"],
    category: "Admin",
    usage: "<command>",
    description: "Perhaps you no longer need this command? You can unload the command so it can no longer be used!"
}