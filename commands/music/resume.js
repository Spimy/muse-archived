const discord = require("discord.js");
const { util, music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

    if (!message.member.voice.channel || message.member.voice.channel != queue.voiceChannel) {
        return message.reply("⚠️ You must be in the same voice channel as me to use this command!")
    }
    
    // If music is not playing (paused) then resume the music
    if (!queue.playing) {

        const currentVid = queue.videos[0];
        const vidLength = currentVid.lengthSeconds;

        const vidDurationCount = 33;
        const lengthBar = "━".repeat(vidDurationCount);
        const timeIndicator = "⚪";

        const timePosition = Math.floor(((queue.connection.dispatcher.streamTime / 1000) / vidLength) * vidDurationCount);
        const timeString = `${util.formatSeconds(queue.connection.dispatcher.streamTime / 1000)} / ${util.formatSeconds(vidLength)}`

        const embed = new discord.MessageEmbed()
            .setColor("RANDOM")
            .setTitle("Successfully Resumed")
            .setDescription([
                `▶️ [${currentVid.title}](${currentVid.url}) has been resumed`,
                `\`\`\`${util.replaceStrChar(lengthBar, timePosition, timeIndicator)} ${timeString}\`\`\``
            ].join("\n"))
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp()

        queue.playing = true;
        queue.connection.dispatcher.resume();
        message.channel.send(embed);
        return client.commands.get("nowplaying").execute(client, message, args);
    }

    return client.commands.get("help").execute(client, message, ["resume"]);

}

module.exports.help = {
    name: "resume",
    aliases: [],
    category: "Music",
    usage: "<YouTube Url / Search Query>",
    description: "You're back? Use this command to resume a paused music!\nOnly works if music playback is paused!"
}