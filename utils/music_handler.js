module.exports.MusicHandler = class MusicHandler {

	constructor(discord, util) {
		this.discord = discord;
		this.util = util;
		this.embed = new discord.MessageEmbed();
	}
	
	global_queue = new Map();

	handleVideo = async (video, message, voice_channel, ytdl, playlist=false) => {

		let guild_queue = this.global_queue.get(message.guild.id);

		if (!guild_queue) {

			let queueConstruct = {
				textChannel: message.channel,
				voiceChannel: voice_channel,
				connection: null,
				videos: [],
				volume: 50,
				playing: true,
				loop: false,
				stopped: false,
				userCountSkip: false
			};

			this.global_queue.set(message.guild.id, queueConstruct);
			queueConstruct.videos.push(video);

			voice_channel.join().then(connection => {
				queueConstruct.connection = connection;
				this.playVideo(message.guild, queueConstruct.videos[0], ytdl)
			}).catch(err => this.global_queue.delete(message.guild.id));


		} else {

			guild_queue.videos.push(video);
			if (playlist) return;

			const addedVideoIndex = guild_queue.videos.indexOf(video);
			this.embed
				.setColor("RANDOM")
				.setTitle("Added Video to Queue")
				.setDescription(`\`\`\`${video.title}\`\`\``)
				.setThumbnail(video.thumbnail)
				.addField("Position:", `${addedVideoIndex == 1 ? "Up Next" : addedVideoIndex+1}`, true)
				.addField("Requested By:", video.requestedBy.user.tag, true)
				.setTimestamp();

			message.channel.send(this.embed);
			return this.embed.spliceFields(0, this.embed.fields.length);

		}

		return;

	}

	playVideo = async (guild, video, ytdl) => {

		let guild_queue = this.global_queue.get(guild.id);

		if (!video) {
			guild_queue.voiceChannel.leave();
			this.global_queue.delete(guild.id);
			return guild_queue.textChannel.send(`🎵 Music playback has ended.`);
		}

		const dispatcher = guild_queue.connection.play(await ytdl(video.url, 
			{ 
				quality: "lowest"
			}).catch(err => console.error(err)), {
			type: "opus", 
			bitrate: 150
		});

		dispatcher.on("finish", () => {

			const currentVideo = guild_queue.videos[0];

			// If there is no current video means stop command was run or issues with playback occurred
			if (currentVideo) {
				if (guild_queue.videos.length > 0) {
					if (!currentVideo.loop && !guild_queue.loop) guild_queue.videos.shift();
					if (!currentVideo.loop && guild_queue.loop) guild_queue.videos.push(guild_queue.videos.shift());
				}
			}

			setTimeout(() => {
				this.playVideo(guild, guild_queue.videos[0], ytdl);
			}, 250);

		});

		dispatcher.on("error", err => console.error(err));

		dispatcher.setVolumeLogarithmic(guild_queue.volume / 100);

		this.embed
			.setColor("RANDOM")
			.setTitle("Now Playing:")
			.setDescription(`[${video.title}](${video.url})`)
			.setThumbnail(video.thumbnail)
			.addField("Duration:", `${this.util.formatSeconds(video.lengthSeconds)}`, true)
			.addField("Requested By:", video.requestedBy.user.tag, true)
			.setTimestamp();

		guild_queue.textChannel.send(this.embed);
		this.embed.spliceFields(0, this.embed.fields.length);

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
				votes: { users: [], num: 0 },
				loop: false
			}
			
			return videoInfo;
	
		});
	
	}

	getGuildQueue = (guildID) => {
		return this.global_queue.get(guildID);
	}

}
