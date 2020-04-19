const discord = require("discord.js");
const { util, music_handler } = require("../../index.js");


ReplaceAt = (str, index, replacement) => {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

formatSeconds = (seconds) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8)
}

module.exports.execute = async (client, message, args) => {

    let queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
    if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played
    if (!queue.connection) return message.reply("⚠️ Video has not started playing as audio yet!");
    
    // Get the information of the current video
    const vidLength = queue.videos[0].lengthSeconds;
    const vidTitle = queue.videos[0].title;
    const vidUrl = queue.videos[0].url;
    const vidRequester = queue.videos[0].requestedBy;

    const vidDurationCount = 33;
    const lengthBar = "━".repeat(vidDurationCount);
    const timeIndicator = "⚪";

    // Get time information to edit on to the embed's timeline and whether there's a video in the queue
    let timePosition = Math.floor(((queue.connection.dispatcher.streamTime / 1000) / vidLength) * vidDurationCount);
    let timeString = `${formatSeconds(queue.connection.dispatcher.streamTime / 1000)} / ${formatSeconds(vidLength)}`
    let timeRemaining = formatSeconds(vidLength - (queue.connection.dispatcher.streamTime / 1000));
    let vidNext = queue.videos.length > 1 ? queue.videos[1].title : "None";

    // Set the duration bar of the embed
    let description = `[${vidTitle}](${vidUrl})\n`;
    description += `\`\`\`${ReplaceAt(lengthBar, timePosition, timeIndicator)} ${timeString}\`\`\``;

    const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Now Playing:")
        .setThumbnail(queue.videos[0].thumbnail)
        .setDescription(description)
        .addFields(
            { name: "Duration:", value: formatSeconds(vidLength), inline:true },
            { name: "Remaining Time:", value: timeRemaining, inline: true },
            { name: "Requested By:", value: vidRequester.user.tag, inline: true },
            { name: "Up Next:", value: vidNext, inline: true }
        )
        .setTimestamp();

    const msg = await message.channel.send(embed);

    const interval = setInterval(() => {

        try {

            // Get new queue to check if there's an update in the queue
            queue = music_handler.getGuildQueue(message.guild.id);

            // Get new time information to edit on to the embed's timeline and whether there's a new video in the queue
            timeString = `${formatSeconds(queue.connection.dispatcher.streamTime / 1000)} / ${formatSeconds(vidLength)}`
            timePosition = Math.floor(((queue.connection.dispatcher.streamTime / 1000) / vidLength) * vidDurationCount);
            timeRemaining = formatSeconds(vidLength - (queue.connection.dispatcher.streamTime / 1000));
            vidNext = queue.videos.length > 1 ? queue.videos[1].title : "None";

            // Set the duration bar of the embed
            description = `[${vidTitle}](${vidUrl})\n`;
            description += `\`\`\`${ReplaceAt(lengthBar, timePosition, timeIndicator)} ${timeString}\`\`\``;
            
            embed.setDescription(description);
            embed.spliceFields(1, 1, { name: "Remaining Time:", value: timeRemaining, inline: true });
            embed.spliceFields(3, 1, { name: "Up Next:", value: vidNext, inline: true });
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
        description += `\`\`\`${ReplaceAt(lengthBar, vidDurationCount-1, timeIndicator)} Ended\`\`\``;

        embed.setTitle("Was Playing:");
        embed.setDescription(description);
        embed.spliceFields(1, 1, { name: "Remaining Time:", value: "Ended", inline: true });
        msg.edit(embed);

        return clearInterval(interval);
    });


}

module.exports.help = {
    name: "nowplaying",
    aliases: ["np", "now_playing", "current", "currentlyplaying", "currently_playing"]
}
