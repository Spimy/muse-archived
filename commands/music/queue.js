const discord = require("discord.js");
const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

	const queue = music_handler.getGuildQueue(message.guild.id);
	if (!queue) return message.reply("⚠️ There is currently no music playing!");

	const queue_trimmed = queue.videos.slice(0, 5); 

	const title = queue.videos.length > 1 ? `Upcoming - Next ${queue.videos.length}` : "Currently Playing"

	let embed = new discord.MessageEmbed()
		.setTitle(title)
		.setColor('RANDOM')
		.setThumbnail(queue.videos[0]["thumbnail"])
		.setDescription(`${queue.videos.length > 5 ? "**NOTICE**: This queue only shows the next 5 songs in the queue where there are more than 5 to reaching avoid embed character limit and not showing the embed at all!\n\n" : ""}${queue_trimmed.map((video, index) => 
			`**${index+1} - ** [${video["title"]}](${video["url"]})`).join('\n')}\n\n🎵 **Currently Playing:** [${queue_trimmed[0]["title"]}](${queue_trimmed[0]["url"]})`)
		.setFooter(`Requested by ${message.author.tag}`)
		.setTimestamp();

	message.channel.send(embed);

}

module.exports.help = {
	name: "queue",
	aliases: ["q", "list"]
}