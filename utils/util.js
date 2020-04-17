const fs = require("fs");
const path = require("path");
module.exports.Utils = class Utils {

	constructor(client) {
		this.client = client;
	}

	_findNested = (dir, pattern) => {

		let results = [];

		fs.readdirSync(dir).forEach(inner_dir => {

			inner_dir = path.resolve(dir, inner_dir);
			const stat = fs.statSync(inner_dir);

			if (stat.isDirectory()) {
				results = results.concat(this._findNested(inner_dir, pattern));
			}

			if (stat.isFile() && inner_dir.endsWith(pattern)) {
				results.push(inner_dir);
			}

		});	
		
		return results;

	}

	loadModules = (dir, command=false) => {

		const files = this._findNested(dir, ".js");

		const jsFiles = files.filter(file => file.split(".").pop() == "js");

		if (!command) {

			if (jsFiles.length <= 0) return console.log(`There are no files to load.`);

			console.log(`Loading ${jsFiles.length} file${jsFiles.length <= 1 ? "" : "s"}...`);
			jsFiles.forEach(file => {
				require(file);
			});

		} else {

			if (jsFiles.length <= 0) return console.log("There are no commands to load.");

			console.log(`Loading ${jsFiles.length} command file${jsFiles.length <= 1 ? "" : "s"}...`);
			jsFiles.forEach(file => {
				const cmd = require(file);
				this.client.commands.set(cmd.help.name, cmd);

				cmd.help.aliases.forEach(alias => {
					this.client.aliases.set(alias, cmd.help.name);
				});

			});
		}

	}

	getVideoInfo = async (url, ytdl, message) => {

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
				requestedBy: message.member,
				votes: { users: [], num: 0 }
			}
			
			return videoInfo;
	
		});
	
	}

}
