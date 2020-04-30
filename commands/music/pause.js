const discord = require("discord.js");
const { util, music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    if (!message.member.voice.channel || message.member.voice.channel != queue.voiceChannel) {
        return message.reply("⚠️ You must be in the same voice channel as me to use this command!")
    }
    
    // If music is playing then pause the music
    if (queue.playing) {

        const currentVid = queue.videos[0];
        const vidLength = currentVid.lengthSeconds;

        const vidDurationCount = 33;
        const lengthBar = "━".repeat(vidDurationCount);
        const timeIndicator = "⚪";

        const timePosition = Math.floor(((queue.connection.dispatcher.streamTime / 1000) / vidLength) * vidDurationCount);
        const timeString = `${util.formatSeconds(queue.connection.dispatcher.streamTime / 1000)} / ${util.formatSeconds(vidLength)}`

        const embed = new discord.MessageEmbed()
            .setColor("RANDOM")
            .setTitle("Successfully Paused")
            .setDescription([
                `⏸️ [${currentVid.title}](${currentVid.url}) has been paused`,
                `\`\`\`${util.replaceStrChar(lengthBar, timePosition, timeIndicator)} ${timeString}\`\`\``
            ].join("\n"))
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp()

        queue.playing = false;
        queue.connection.dispatcher.pause();
        return message.channel.send(embed);
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