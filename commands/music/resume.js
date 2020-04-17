const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    // If music is not playing (paused) then resume the music
    if (!queue.playing) {
        queue.playing = true;
        queue.connection.dispatcher.resume();
        return message.channel.send("▶️ Music has now been resumed");
    }

    return message.reply("⚠️ Music is already playing!")

}

module.exports.help = {
    name: "resume",
    aliases: []
}