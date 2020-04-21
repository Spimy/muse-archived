const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played
    
    const currentVideoVotes = queue.videos[0].votes; // Get the current video votes info

    if (!message.member.hasPermission("ADMINISTRATOR")) {

        // Tell the user he has already voted and return
        if (currentVideoVotes.users.includes(message.member)) return message.reply("⚠️ You have already voted!");

        currentVideoVotes.num += 1; // If the user is not an admin, add 1 to vote skip
        currentVideoVotes.users.push(message.member); // Add the user to the array meaning he already voted

        message.channel.send(`🎵 ${message.author}, you have voted to skip! **${currentVideoVotes.num}/3** votes`);

        if (queue.videos[0].loop) queue.videos[0].loop = false; // If video loops, turn it off

        // Resume the dispatcher if the song is paused to skip a song even when paused
        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
        }

        if (currentVideoVotes.num >= 3) return queue.connection.dispatcher.end(); // 3 votes so skip the current video

    } else {
        // Skip the video without vote because of admin permission
        if (queue.videos[0].loop) queue.videos[0].loop = false; // If video loops, turn it off

        // Resume the dispatcher if the song is paused to skip a song even when paused
        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
        }
        
        return queue.connection.dispatcher.end();
    }
}

module.exports.help = {
    name: "skip",
    aliases: [],
    category: "Music",
    usage: "",
    description: "Don't like the current music? Skip it! No-one enjoys horrible musics!"
}