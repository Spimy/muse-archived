const { music_handler } = require("../../index.js");

const yts = require("yt-search");
const ytdl = require("ytdl-core-discord");
const ytlist = require('youtube-playlist');

module.exports.execute = async (client, message, args, fromSearch=false) => {

	const voice_channel = message.member.voice.channel;
	if (!voice_channel) return client.commands.get("help").execute(client, message, ["play"]);

	const url_regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	const video_regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
	const playlist_regex = /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/;

	if (args.length <= 0) return client.commands.get("help").execute(client, message, ["play"]);

	const perms = voice_channel.permissionsFor(message.client.user);
	if (!perms.has("CONNECT")) return message.reply("⚠️ I do not have permissions to connect to voice channels!");
	if (!perms.has("SPEAK")) return message.reply("⚠️ I do not have permissions to speak in voice channels!");

	let videoInfo;

	if (url_regex.test(args[0].toLowerCase())) {

		if (video_regex.test(args[0].toLowerCase())) {
			videoInfo = await music_handler.getVideoInfo(args[0], ytdl, message);
			music_handler.handleVideo(videoInfo, message, voice_channel, ytdl);
			return;
		}
	
		if (playlist_regex.test(args[0].toLowerCase())) {
	
			ytlist(args[0], ["name", "url"]).then(async result => {
				
				// Declared the variable here so that the loop does create multiple instances of the same variable
				// Basically use less memory
				let queue;

				const msg = await message.channel.send("🔄 Processing playlist...");
				const playlistInfo = result.data.playlist;
	
				for (let i=0; i<playlistInfo.length; i++) {

					// Load the queue to check for update in the queue
					queue = music_handler.getGuildQueue(message.guild.id);
					
					if (playlistInfo[i].name == "[Deleted video]") continue;
					
					try {
						videoInfo = await music_handler.getVideoInfo(playlistInfo[i].url, ytdl, message);
						if (videoInfo == undefined) continue;

						// Check if there's a queue first to avoid errors (for first video being processed)
						// If the stop command has been executed then stop adding videos to the queue by doing nothing
						if (queue && queue.stopped) return;

						music_handler.handleVideo(videoInfo, message, voice_channel, ytdl, true);
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

		// Is a URL but not a YouTube URL
		const commandName = fromSearch ? ["search"] : ["play"];
		return client.commands.get("help").execute(client, message, commandName);

	} else {

		yts(args.join(" "), async (err, result) => {
	
			if (err) {
				message.reply("⚠️ An error has occurred! Please message my owner about this!");
				console.error(`An error has occurred: ${err}`);
				return;
			}
	
			const videos = result.videos;
			videoInfo = await music_handler.getVideoInfo(videos[0].url, ytdl, message);
			music_handler.handleVideo(videoInfo, message, voice_channel, ytdl);
	
			return;
	
		});

	}



}

module.exports.help = {
	name: "play",
	aliases: [],
	category: "Music",
    usage: "<YouTube Url / Search Query>",
    description: "Bored? How about playing some music from youtube! Be sure to be in a voice channel before running this command!"
}