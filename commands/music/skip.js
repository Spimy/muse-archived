const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played
    
    const currentVideoVotes = queue.videos[0].votes; // Get the current video votes info

    if (!message.member.hasPermission("ADMINISTRATOR")) {

        // Tell the user he has already voted and return
        if (currentVideoVotes.users.includes(message.member)) return message.reply("⚠️ You have already voted!");

        currentVideoVotes.num += 1; // If the user is not an admin, add 1 to vote skip
        message.channel.send(`🎵 ${message.author}, you have voted to skip! **${currentVideoVotes.num}/3** votes`);
        currentVideoVotes.users.push(message.member);

        if (currentVideoVotes.num >= 3) return queue.connection.dispatcher.end();

    } else return queue.connection.dispatcher.end();

}

module.exports.help = {
    name: "skip",
    aliases: []
}