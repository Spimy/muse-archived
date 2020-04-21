const discord = require("discord.js");
const { music_handler } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

	const queue = music_handler.getGuildQueue(message.guild.id); // Get the queue for the guild the cmd was executed in
	if (!queue) return message.reply("⚠️ There is currently no music playing!"); // Tell the user no song is being played

	// Set the emojis for pagination
	const pageBack = "⏪";
	const pageForward = "⏩";

	const num_per_page = 5; // Number of songs to show in a page
	let queuedVideos = queue.videos.slice(); // Make a copy of the queue by value
	let pageContents = []; // This array will contain arrays with length of number of songs to show in a page
	
	// Separate songs into different arrays to get number of pages perfectly
	while (queuedVideos.length > 0) {
		pageContents.push(queuedVideos.splice(0, num_per_page))
	}

	let num_pages = pageContents.length; // The number of pages is the number of arrays in the pageContent arrays
	let currentPage = 0; // Page starts at 0 because array index starts at 0
	let currentListNum = ((currentPage + 1) * num_per_page) - num_per_page; // Calculate the last item's position in a page

	// Set the title of the embed
	let title = queue.videos.length > 1 ? `Upcoming - Next ${queue.videos.length}` : "Currently Playing";

	// A long mess of a description. I have no idea how to
	// make it look the same and improve the code at the same time
	let description = `Looping queue: ${queue.loop}\n\n${pageContents[currentPage].map((video, index) => 
		`**[${currentListNum+(index+1)}]:** [${video.title}](${video.url})`).join('\n')}\n\n`;
	description += `🎵 **Currently Playing:** [${queue.videos[0].title}](${queue.videos[0].url})`;

	// Initial embed
	const embed = new discord.MessageEmbed()
		.setTitle(title)
		.setColor('RANDOM')
		.setThumbnail(queue.videos[0].thumbnail)
		.setDescription(description)
		.setFooter(`Page ${currentPage+1} of ${num_pages} | Requested by ${message.author.tag}`)
		.setTimestamp();

	const msg = await message.channel.send(embed); // Send the embed

	if (num_pages <= 1) return; // If there's only 1 page, no need for reactor pagination

	// Add the appropriate reaction for pagination
	msg.react(pageBack);
	msg.react(pageForward);

	// Collect reactions for 1 min for specified emojis only
	const filter = (reaction) => reaction.emoji.name === pageBack || reaction.emoji.name === pageForward;
	const collector = msg.createReactionCollector(filter, { time: 60000 });

	// Detect reactions
	collector.on("collect", (reaction, user) => {

		if (user.bot) return;

		// To keep the list up to date with currently playing if the song shifted
		queuedVideos = queue.videos.slice();
		pageContents = [];
		
		// Set title again in case song was removed from queue
		title = queuedVideos.length > 1 ? `Upcoming - Next ${queuedVideos.length}` : "Currently Playing";

		// Separate songs into different arrays to get number of pages perfectly
		while (queuedVideos.length > 0) {
			pageContents.push(queuedVideos.splice(0, num_per_page))
		}

		num_pages = pageContents.length;

		switch (reaction.emoji.name) {
			case pageBack: {
				currentPage = currentPage == 0 ? pageContents.length - 1 : currentPage -= 1;
				break;
			}

			case pageForward: {
				currentPage = currentPage == pageContents.length - 1 ? 0 : currentPage += 1;
				break;
			}
		}

		reaction.users.remove(user);
		
		currentListNum = ((currentPage + 1) * num_per_page) - num_per_page;

		// Set the description again with the new contents
		description = `Looping queue: ${queue.loop}\n\n${pageContents[currentPage].map((video, index) => 
			`**[${currentListNum+(index+1)}]: ** [${video.title}](${video.url})`).join('\n')}\n\n`;
		description += `🎵 **Currently Playing:** [${queue.videos[0].title}](${queue.videos[0].url})`;

		embed.setTitle(title);
		embed.setDescription(description);
		embed.setFooter(`Page ${currentPage+1} of ${num_pages} | Requested by ${message.author.tag}`);

		msg.edit(embed);
		
	});

}

module.exports.help = {
	name: "queue",
	aliases: ["q", "list"],
	category: "Music",
    usage: "",
    description: "Excited about the next song? View a list of songs in the queue to be even more excited... or disappointed by someone's poor taste in music!"
}