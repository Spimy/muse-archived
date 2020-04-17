const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    let volumeEmoji; // Declare the variable to use the correct emoji so it doesn't have to be declared more than once

    if (!args[0]) {
        volumeEmoji = queue.volume > 50 ? "🔊" : (queue.volume <= 0 ? "🔈" : "🔉"); // Check audio loudness for correct emoji
        message.channel.send(`${volumeEmoji} Current Volume: **${queue.volume}/100**`); // Tell the user the current volume
        return; // Return so that the rest of the code does not run
    }

    // Make sure the inputs are numbers and, between 0 and 100 only
    if (isNaN(args[0])) return message.reply("⚠️ please input a volume between 0 and 100!");
    if (args[0] < 0 || args[0] > 100) return message.reply("⚠️ please input a volume between 0 and 100!");

    // Set the volume
    queue.volume = args[0];
    queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);

    volumeEmoji = queue.volume > 50 ? "🔊" : (queue.volume <= 0 ? "🔈" : "🔉"); // Check audio loudness for correct emoji
    message.channel.send(`${volumeEmoji} has now been set to **${queue.volume}/100**`); // Tell the user volume has changed

}

module.exports.help = {
    name: "volume",
    aliases: ["vol"]
}