const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    // If music is playing then pause the music
    if (queue.playing) {
        queue.playing = false;
        queue.connection.dispatcher.pause();
        return message.channel.send("⏸️ Music has now been paused");
    }

    return message.reply("⚠️ Music is already paused!")

}

module.exports.help = {
    name: "pause",
    aliases: [],
    category: "Music",
    usage: "",
    description: "Busy and don't want to miss a music? Pause it! I'll wait till you come back!"
}