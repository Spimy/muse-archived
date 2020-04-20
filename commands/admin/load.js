const { util } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.reply("⚠️ You do not have the permissions to run this command! You require `ADMINISTRATOR` permissions");
        return;
    }

    if (!args[0]) return client.commands.get("help").execute(client, message, ["load"]);
    const cmd = args[0].toLowerCase();
    const res = util.loadCommand(cmd, false);

    switch (res) {
        case "Command Loaded": {
            message.reply(`✅ Command \`${cmd}\` unloaded successfully!`);
            break;
        }
        case "Command Already Loaded": {
            message.reply(`⚠️ Command \`${cmd}\` had already been loaded!`);
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
    name: "load",
    aliases: ["loadcmd"],
    category: "Admin",
    usage: "<command>",
    description: "You just added a command but music is playing? Load it with me so you don't have to abruptly stop the music!"
}