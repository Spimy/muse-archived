const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    if (!message.member.voice.channel || message.member.voice.channel != queue.voiceChannel) {
        return message.reply("⚠️ You must be in the same voice channel as me to use this command!")
    }

    if (args[0]) {

        // If index given is not a number then send a help embed
        if (isNaN(args[0])) return client.commands.get("help").execute(client, message, ["clear"]);

        // Floor it so that decimal points are not allowed and minus 1 to index an array's position
        const index = Math.floor(parseInt(args[0])) - 1;

        // Skip current song if index of 1 was given as value
        if (index == 0) return client.commands.get("skip").execute(client, message, args);

        const video = queue.videos[index];
        queue.videos.splice(parseInt(args[0])-1, 1);

        message.channel.send(`🗑️ **${video.title}** has been removed from the queue!`);

        return;

    }

    // Make sure the first song stays in the queue to avoid errors
    queue.videos = [queue.videos[0]];
    message.channel.send("🗑️ The queue has been cleared! Add more songs or the playback will end after the current song!");

}

module.exports.help = {
    name: "clear",
    aliases: ["clearqueue"],
    category: "Music",
    usage: "[index]",
    description: "Accidentally added a playlist or song? Clear the queue completely or remove a song at a specific index!\
            Clearing the first index would initiate a song skip. If you are an admin, it will skip. If not then it'll\
            require votes to skip!"
}