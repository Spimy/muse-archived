const ytdl = require("ytdl-core-discord");

module.exports.MusicHandler = class MusicHandler {
	
	global_queue = new Map();

	handleVideo = async (video, message, voice_channel, playlist=false) => {

		let guild_queue = this.global_queue.get(message.guild.id);

		if (!guild_queue) {

			let queueConstruct = {
				textChannel: message.channel,
				voiceChannel: voice_channel,
				connection: null,
				videos: [],
				volume: 50,
				playing: true
			};

			this.global_queue.set(message.guild.id, queueConstruct);
			queueConstruct.videos.push(video);

			try {
				let connection = await voice_channel.join();
				queueConstruct.connection = connection;
				this.playVideo(message.guild, queueConstruct.videos[0])
			} catch (err) {
				this.global_queue.delete(message.guild.id);
			}

		} else {

			guild_queue.videos.push(video);
			if (playlist) return;
			return message.channel.send(`🎵 **${video["title"]}** has been added to queue.`);

		}

		return;

	}

	playVideo = async (guild, video) => {

		let guild_queue = this.global_queue.get(guild.id);

		if (!video) {
			guild_queue.voiceChannel.leave();
			this.global_queue.delete(guild.id);
			return guild_queue.textChannel.send(`🎵 Music playback has ended.`);
		}

		const dispatcher = guild_queue.connection.play(await ytdl(video["url"], 
			{ 
				quality: "lowest"
			}), {
			type: "opus", 
			bitrate: 150
		});

		dispatcher.on("finish", () => {
			guild_queue.videos.shift();
			setTimeout(() => {
				this.playVideo(guild, guild_queue.videos[0]);
			}, 250);
		});

		dispatcher.on("error", err => console.error(err));

		dispatcher.setVolumeLogarithmic(guild_queue.volume / 100);

		guild_queue.textChannel.send(`🎵 **${video["title"]}** is now being played`);

	}

	getVideoInfo = async (url, ytdl, message) => {

		return ytdl.getInfo(url, async (err, info) => {
	
			if (err) return;
	
			const videoDetails = info.player_response.videoDetails;
			const { videoId, title, thumbnail, lengthSeconds, author, channelId } = videoDetails;
			const thumbnail_array_length = thumbnail.thumbnails.length;
	
			let videoInfo = {
				url: `https://www.youtube.com/watch?v=${videoId}`,
				title: title,
				thumbnail: thumbnail.thumbnails[thumbnail_array_length-1].url,
				lengthSeconds: lengthSeconds,
				author: author,
				authorUrl: `https://www.youtube.com/channel/${channelId}`,
				requestedBy: message.member,
				votes: { users: [], num: 0 }
			}
			
			return videoInfo;
	
		});
	
	}

	getGuildQueue = (guildID) => {
		return this.global_queue.get(guildID);
	}

}
