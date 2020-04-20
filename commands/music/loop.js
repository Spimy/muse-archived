const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    // Make sure the syntax of the command is correct, if not then send help message
    if (args.length < 2) return client.commands.get("help").execute(client, message, ["loop"]);
    if (!["song", "queue"].includes(args[0])) return client.commands.get("help").execute(client, message, ["loop"]);
    if (!["true", "false"].includes(args[1])) return client.commands.get("help").execute(client, message, ["loop"]);

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    const boolean = args[1] === "true";

    switch (args[0]) {
        case "song": {
            if (boolean == queue.videos[0].loop) return message.reply(`⚠️ Song loop is already set to ${args[1]}`);
            queue.videos[0].loop = boolean; 
            break;
        }
        case "queue": {
            if (boolean == queue.loop) return message.reply(`⚠️ Queue loop is already set to ${args[1]}`);
            queue.loop = boolean;
            break;
        }
    }

    message.channel.send(`🔃 The current \`${args[0]}\` loop has been set to \`${args[1]}\``);
}

module.exports.help = {
    name: "loop",
    aliases: [],
    category: "Music",
    usage: "<song / queue> <true / false>",
    description: "Like a song? Loop it till you are tired of it! Or maybe you want the whole queue to loop?"
}