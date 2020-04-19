const { music_handler } = require("../../index.js");

const yts = require("yt-search");
const ytdl = require("ytdl-core-discord");
const ytlist = require('youtube-playlist');

module.exports.execute = async (client, message, args) => {

	const voice_channel = message.member.voice.channel;
	if (!voice_channel) return message.reply("⚠️ Join a voice channel!");

	const video_regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
	const playlist_regex = /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/;

	if (args.length <= 0) return message.reply("⚠️ Please input a YouTube URL or a search query!");

	const perms = voice_channel.permissionsFor(message.client.user);
	if (!perms.has("CONNECT")) return message.reply("⚠️ I do not have permissions to connect to voice channels!");
	if (!perms.has("SPEAK")) return message.reply("⚠️ I do not have permissions to speak in voice channels!");

	let videoInfo;

	if (video_regex.test(args[0])) {
		videoInfo = await music_handler.getVideoInfo(args[0], ytdl, message);
		music_handler.handleVideo(videoInfo, message, voice_channel);
		return;
	}

	if (playlist_regex.test(args[0])) {

		ytlist(args[0], ["name", "url"]).then(async result => {

			const msg = await message.channel.send("🔄 Processing playlist...");
			const playlistInfo = result.data.playlist;

			for (let i=0; i<playlistInfo.length; i++) {
				if (playlistInfo[i].name == "[Deleted video]") continue;

				try {
					videoInfo = await music_handler.getVideoInfo(playlistInfo[i].url, ytdl, message);
					if (videoInfo == undefined) continue;
					music_handler.handleVideo(videoInfo, message, voice_channel, true);
				} catch {
					continue;
				}
			}
			message.channel.send(`🎶 **Playlist** has been added to queue.`);
			msg.delete();
			// message.channel.send(`🎵 **${playlist.title}** has been added to queue.`);
	
		});

		return;

	}

	yts(args.join(" "), async (err, result) => {

		if (err) {
			message.reply("⚠️ An error has occurred! Please message my owner about this!");
			console.error(`An error has occurred: ${err}`);
			return;
		}

		const videos = result.videos;
		videoInfo = await music_handler.getVideoInfo(videos[0].url, ytdl, message);
		music_handler.handleVideo(videoInfo, message, voice_channel);

		return;

	});


}

module.exports.help = {
	name: "play",
	aliases: []
}