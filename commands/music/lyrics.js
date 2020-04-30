const discord = require("discord.js");
const { config, music_handler } = require("../../index");

const axios = require("axios");
const cheerio = require("cheerio");
const getArtistTitle = require("get-artist-title");


const scrapeLyrics = path => {
    return axios.get(path)
        .then(response => {
            let $ = cheerio.load(response.data);
            return [$(".header_with_cover_art-primary_info-title").text().trim(), $(".lyrics").text().trim()];
        })
        .catch(err => {
            console.warn(err);
        });
};

const searchLyrics = url => {
    return Promise.resolve(axios.get(url, {"Authorization": `Bearer ${config.geniusToken}`})
        .then(response => checkSpotify(response.data.response.hits))
        .then(path => [path, scrapeLyrics(path)])
        .catch(console.error)
    );
};

const checkSpotify = hits => {
    return hits[0].result.primary_artist.name === "Spotify" ? hits[1].result.url : hits[0].result.url;
};

const createQuery = (arg, queue) => {
    if (arg === "np") {
        const query = [ artist, title ] = getArtistTitle(queue.videos[0].title, {
            defaultArtist: " "
        });
        return query.join(" ")
    } else return arg;
};

module.exports.execute = async (client, message, args) => {
    
    const queue = music_handler.getGuildQueue(message.guild.id);

    if (!args[0]) return client.commands.get("help").execute(client, message, ["lyrics"])
    if (args[0] == "np" && !queue) return message.reply("⚠️ There are currently no music playing!")

    const baseURL = `https://api.genius.com/search?access_token=${config.geniusToken}`;
    const query = createQuery(args.join(" "), queue);

    searchLyrics(`${baseURL}&q=${encodeURIComponent(query)}`)
        .then(async songData => {

            const lyricsUrl = songData[0];
            let [title, lyrics] = await songData[1];
            
            if (lyrics.length > 2048) {
                lyrics = lyrics.slice(0, 2045) + "...";
            }

            const embed = new discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle(`Lyrics for: ${title}`)
                .setURL(lyricsUrl)
                .setDescription(lyrics)
                .setFooter(`Requested by ${message.author.tag}`)
                .setTimestamp()

            if (args[0] == "np") embed.setThumbnail(queue.videos[0].thumbnail)
            return message.channel.send(embed);
        })
        .catch(err => {
            message.channel.send(`📋 No lyrics found for: **${query}**`);
            console.warn(err);
        });
};

module.exports.help = {
    name: "lyrics",
    aliases: [],
    category: "Music",
    description: "Want to sing along with a song playing? Find the lyrics of that song! If `np` option cannot find\
                lyrics then try to manually type in the title of the song!",
    usage: "<np | search query>"
};