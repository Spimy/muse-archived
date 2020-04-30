const discord = require("discord.js");
const { util, music_handler } = require("../../index.js");


module.exports.execute = async (client, message, args) => {

    let queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played
    if (!queue.connection) return message.reply("⚠️ Video has not started playing as audio yet!");

    if (!message.member.voice.channel || message.member.voice.channel != queue.voiceChannel) {
        return message.reply("⚠️ You must be in the same voice channel as me to use this command!")
    }

    // Get the information of the current video
    const currentVideo = queue.videos[0];
    const vidLength = currentVideo.lengthSeconds;
    const vidTitle = currentVideo.title;
    const vidUrl = currentVideo.url;
    const vidLoop = currentVideo.loop;
    const vidAuthor = currentVideo.author;
    const vidAuthorUrl = currentVideo.authorUrl;
    const vidRequester = currentVideo.requestedBy;

    const vidDurationCount = 33;
    const lengthBar = "━".repeat(vidDurationCount);
    const timeIndicator = "⚪";

    // Get time information to edit on to the embed's timeline and whether there's a video in the queue
    let timePosition = Math.floor(((queue.connection.dispatcher.streamTime / 1000) / vidLength) * vidDurationCount);
    let timeString = `${util.formatSeconds(queue.connection.dispatcher.streamTime / 1000)} / ${util.formatSeconds(vidLength)}`
    let timeRemaining = util.formatSeconds(vidLength - (queue.connection.dispatcher.streamTime / 1000));
    let vidNext = queue.videos.length > 1 ? `[${queue.videos[1].title}](${queue.videos[1].url})` : "None";

    // Set the duration bar on the embed
    let description = `[${vidTitle}](${vidUrl})\n`;
    description += `\`\`\`${util.replaceStrChar(lengthBar, timePosition, timeIndicator)} ${timeString}\`\`\``;

    // Initial embed
    const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Now Playing:")
        .setThumbnail(currentVideo.thumbnail)
        .setDescription(description)
        .addFields(
            { name: "Duration:", value: util.formatSeconds(vidLength), inline:true },
            { name: "Remaining Time:", value: timeRemaining, inline: true },
            { name: "Looping:", value: vidLoop, inline: true},
            { name: "Requested By:", value: vidRequester.user.tag, inline: true },
            { name: "Uploaded By:", value: `[${vidAuthor}](${vidAuthorUrl})`, inline: true },
            { name: "Up Next:", value: vidNext, inline: true }
        )
        .setFooter(`Requested by ${message.author.tag}`)
        .setTimestamp();

    const msg = await message.channel.send(embed);

    const interval = setInterval(() => {

        try {

            // Get new queue to check if there's an update in the queue
            queue = music_handler.getGuildQueue(message.guild.id);

            // Get new time information to edit on to the embed's timeline and whether there's a new video in the queue
            timeString = `${util.formatSeconds(queue.connection.dispatcher.streamTime / 1000)} / ${util.formatSeconds(vidLength)}`
            timePosition = Math.floor(((queue.connection.dispatcher.streamTime / 1000) / vidLength) * vidDurationCount);
            timeRemaining = util.formatSeconds(vidLength - (queue.connection.dispatcher.streamTime / 1000));
            vidNext = queue.videos.length > 1 ? `[${queue.videos[1].title}](${queue.videos[1].url})` : "None";

            // Set the duration bar on the embed
            description = `[${vidTitle}](${vidUrl})\n`;
            description += `\`\`\`${util.replaceStrChar(lengthBar, timePosition, timeIndicator)} ${timeString}\`\`\``;
            
            embed.setDescription(description);
            embed.spliceFields(1, 1, { name: "Remaining Time:", value: timeRemaining, inline: true });
            embed.spliceFields(2, 1, { name: "Looping:", value: queue.videos[0].loop, inline: true });
            embed.spliceFields(5, 1, { name: "Up Next:", value: vidNext, inline: true });
            msg.edit(embed);

        } catch {

            // If there is an error then hide by deleting the message :P
            msg.delete();
            return clearInterval(interval);

        }

    }, 5000);

    // Check if the song has ended and set the embed to say the song has ended
    queue.connection.dispatcher.on("finish", () => {
        description = `[${vidTitle}](${vidUrl})\n`;
        description += `\`\`\`${util.replaceStrChar(lengthBar, vidDurationCount-1, timeIndicator)} Ended\`\`\``;

        embed.setTitle("Was Playing:");
        embed.setDescription(description);
        embed.spliceFields(1, 1, { name: "Remaining Time:", value: "Ended", inline: true });
        msg.edit(embed);

        return clearInterval(interval);
    });


}

module.exports.help = {
    name: "nowplaying",
    aliases: ["np", "now_playing", "current", "currentlyplaying", "currently_playing"],
    category: "Music",
    usage: "",
    description: "View the currently playing song with a fancy duration bar"
}
