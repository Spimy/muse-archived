const yts = require("yt-search");
const ytdl = require("ytdl-core-discord");
const ytlist = require('youtube-playlist');


getVideoInfo = (url, message) => {

	ytdl.getInfo(url, (err, info) => {

		if (err) return console.error(err);

		let thumbnail_array_length = info["player_response"]["videoDetails"]["thumbnail"]["thumbnails"].length;

		let videoInfo = {
			url: `https://www.youtube.com/watch?v=${info["player_response"]["videoDetails"]["videoId"]}`,
			title: info["player_response"]["videoDetails"]["title"],
			thumbnail: info["player_response"]["videoDetails"]["thumbnail"]["thumbnails"][thumbnail_array_length-1]["url"],
			lengthSeconds: info["player_response"]["videoDetails"]["lengthSeconds"],
			author: info["player_response"]["videoDetails"]["author"],
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

		videoInfo = getVideoInfo(args[0], message);

		return;

	}

	if (playlist_regex.test(args[0])) {

		ytlist(args[0], ["name", "url"]).then(result => {

			for (let i=0; i<result["data"]["playlist"].length; i++) {
				if (result["data"]["playlist"][i]["name"] == "[Deleted video]") continue;
				videoInfo = getVideoInfo(result["data"]["playlist"][i]["url"], message);
			}

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
		videoInfo = getVideoInfo(videos[0].url, message);

		return;

	});


}

module.exports.help = {
	name: "play",
	aliases: []
}