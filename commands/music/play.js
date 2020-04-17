const { music_handler } = require("../../index.js");

const yts = require("yt-search");
const ytdl = require("ytdl-core-discord");
const ytlist = require('youtube-playlist');


getVideoInfo = async (url, message) => {

	return ytdl.getInfo(url, async (err, info) => {

		if (err) return;

		const videoDetails = info.player_response.videoDetails;
		const { videoId, title, thumbnail, lengthSeconds, author } = videoDetails;
		const thumbnail_array_length = thumbnail.thumbnails.length;

		let videoInfo = {
			url: `https://www.youtube.com/watch?v=${videoId}`,
			title: title,
			thumbnail: thumbnail.thumbnails[thumbnail_array_length-1].url,
			lengthSeconds: lengthSeconds,
			author: author,
			requestedBy: message.member
		}
		
		return videoInfo;

	});

}


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
		
		videoInfo = await getVideoInfo(args[0], message);
		music_handler.handleVideo(videoInfo, message, voice_channel);
		return;

	}

	if (playlist_regex.test(args[0])) {

		ytlist(args[0], ["name", "url"]).then(async result => {

			message.channel.send("🔄 Processing playlist...");

			for (let i=0; i<result["data"]["playlist"].length; i++) {
				if (result["data"]["playlist"][i]["name"] == "[Deleted video]") continue;

				try {
					videoInfo = await getVideoInfo(result["data"]["playlist"][i]["url"], message);
					if (videoInfo == undefined) continue;
					music_handler.handleVideo(videoInfo, message, voice_channel, true);
				} catch {
					continue;
				}
			}
			message.channel.send(`🎶 **Playlist** has been added to queue.`);
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
		videoInfo = await getVideoInfo(videos[0].url, message);
		music_handler.handleVideo(videoInfo, message, voice_channel);

		return;

	});


}

module.exports.help = {
	name: "play",
	aliases: []
}