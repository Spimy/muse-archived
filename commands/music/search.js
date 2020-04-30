const discord = require("discord.js");
const { music_handler } = require("../../index.js");

const yts = require("yt-search");
const ytdl = require("ytdl-core-discord");
const ytlist = require('youtube-playlist');


module.exports.execute = async (client, message, args) => {

	const voice_channel = message.member.voice.channel;
	if (!voice_channel) return client.commands.get("help").execute(client, message, ["search"]);

	const url_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

	if (args.length <= 0) return client.commands.get("help").execute(client, message, ["search"]);

	const perms = voice_channel.permissionsFor(message.client.user);
	if (!perms.has("CONNECT")) return message.reply("⚠️ I do not have permissions to connect to voice channels!");
	if (!perms.has("SPEAK")) return message.reply("⚠️ I do not have permissions to speak in voice channels!");

	// If the video is a URL then process it using the play command instead of copying the whole play command
	if (url_regex.test(args[0].toLowerCase())) {
		return client.commands.get("play").execute(client, message, args, true);
	}

	yts(args.join(" "), async (err, result) => {

		if (err) {
			message.reply("⚠️ An error has occurred! Please message my owner about this!");
			console.error(`An error has occurred: ${err}`);
			return;
		}

		const videos = result.videos.slice(0, 10);

		const embed = new discord.MessageEmbed()
			.setColor("RANDOM")
			.setTitle("-= Music Search =-")
			.setThumbnail(client.user.avatarURL)
			.setDescription(`${videos.map((video, index) => 
				`**${index+1} -** ${video.title}`).join('\n')}\n\n🎵 Select a music from above between **1** and **10** within **10 seconds**`);

		const msg = await message.channel.send(embed);

		message.channel.awaitMessages(m => m.content > 0 && m.content < 11, {
				max: 1,
				time: 10000,
				errors: ["time"]
		}).then(async response => {

			const videoIndex = parseInt(response.first().content) - 1;
			const videoInfo = await music_handler.getVideoInfo(videos[videoIndex].url, ytdl, message);
			music_handler.handleVideo(videoInfo, message, voice_channel, ytdl);

			msg.delete();
			response.first().delete();

		}).catch((err) => {
			if (err) undefined;
			msg.delete();
			return message.reply("⚠ You have exceeded the 10 seconds selection time!");
		});

		return;

	});


}

module.exports.help = {
	name: "search",
	aliases: [],
	category: "Music",
    usage: "<YouTube Url / Search Query>",
    description: "Same as play command but search query allows you to select which video you want."
}