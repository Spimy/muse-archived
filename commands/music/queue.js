const discord = require("discord.js");
const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

	let queue = music_handler.getGuildQueue(message.guild.id);
	if (!queue) return message.reply("⚠️ There is currently no music playing!");

	let embed = new discord.MessageEmbed()
		.setColor('RANDOM')
		.setThumbnail(queue.videos[0]["thumbnail"])
		.setDescription(`**-=- Music Queue -=-**\n${queue.videos.map(video => 
			`**-** ${video["title"]}`).join('\n')}\n\n🎵 **Currently Playing:** ${queue.videos[0]["title"]}`);

	message.channel.send(embed);

}

module.exports.help = {
	name: "queue",
	aliases: ["q", "list"]
}