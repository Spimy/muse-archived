const { config, music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played
    
    if (!message.member.voice.channel || message.member.voice.channel != queue.voiceChannel) {
        return message.reply("⚠️ You must be in the same voice channel as me to use this command!")
    }

    const currentVideoVotes = queue.videos[0].votes; // Get the current video votes info

    if (!message.member.hasPermission("ADMINISTRATOR")) {

        // Tell the user he has already voted and return
        if (currentVideoVotes.users.includes(message.member)) return message.reply("⚠️ You have already voted!");

        currentVideoVotes.num += 1; // If the user is not an admin, add 1 to vote skip
        currentVideoVotes.users.push(message.member); // Add the user to the array meaning he already voted

        // Get the correct number of count to skip depending on the settings (minus 1 to exclude bot)
        const skipCount = !queue.userCountSkip ? 3 : queue.voiceChannel.members.size - 1;

        message.channel.send(`🎵 ${message.author}, you have voted to skip! **${currentVideoVotes.num}/${skipCount}** votes`);

        if (queue.videos[0].loop) queue.videos[0].loop = false; // If video loops, turn it off

        // Resume the dispatcher if the song is paused to skip a song even when paused
        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
        }

        // 3 votes so skip the current video
        if (currentVideoVotes.num >= skipCount) {
            message.reply(`⏩ **${queue.videos[0].title}** has been skipped!`);
            queue.connection.dispatcher.end();
            return;
        } 

    } else {

        // If there is an argument then it is a setting
        if (args[0]) {

            // If not boolean then send help message
            const boolean = args[0] == "true" ? true : (args[0] == "false" ? false : args[0]);
            if (typeof boolean != "boolean") return client.commands.get("help").execute(client, message, ["skip"]);

            // Set it so that the number of votes needed to skip music is the number of people in the vc
            queue.userCountSkip = boolean;
            message.reply(`⏩ Skip count will now be ${boolean ? "" : "not "}equivalent to the number of users in the voice channel!`);
            return;
        }

        // Skip the video without vote because of admin permission
        if (queue.videos[0].loop) queue.videos[0].loop = false; // If video loops, turn it off

        // Resume the dispatcher if the song is paused to skip a song even when paused
        if (!queue.playing) {
            queue.playing = true;
            queue.connection.dispatcher.resume();
        }
        
        message.reply(`⏩ **${queue.videos[0].title}** has been skipped by **${message.author.tag}**!`);
        queue.connection.dispatcher.end();
        return;
    }
}

module.exports.help = {
    name: "skip",
    aliases: [],
    category: "Music",
    usage: "[user count skip (true/false)]",
    description: "Don't like the current music? Skip it! No-one enjoys horrible musics!\n\
    Requires votes if user is not admin!\nNote: same user cannot vote more than once."
}