const discord = require("discord.js");
const { config } = require("../../index.js");

module.exports.execute = async (client, message, args) => {

    const helpCommand = client.commands.get("help").help;
    const embed = new discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(client.user.avatarURL(client.user))
        .setFooter(`Requested by ${message.author.tag}`)
        .setTimestamp();
                    
    switch (args.length) {

        case 1: {
            const command = client.commands.get(args[0]);
            if (!command) return message.reply("⚠️ Specified command does not exist!");

            const commandInfo = command.help;
            const aliasesPresent = commandInfo.aliases.length > 0;
            
            embed.setTitle(`${commandInfo.name.toUpperCase()} COMMAND`)
            embed.setDescription(`${commandInfo.description}\n\n\
            Usage: \`${config.prefix}${commandInfo.name} ${commandInfo.usage}\`\n\
            Aliases: ${aliasesPresent ? commandInfo.aliases.map(alias => `\`${alias}\``).join(", ") : "\`None\`"}`);
            
            message.channel.send(embed);
            break;
        }

        default: {

            const commands = Array.from(client.commands.values());
            const categories = [];

            embed.setTitle("-= COMMAND LIST =-")
            embed.setDescription(`**Prefix:** \`${config.prefix}\`\n<> : Required | [] : Optional\
            \nUse \`${config.prefix}${helpCommand.name} ${helpCommand.usage}\` to view command help with more detail.`)
        
            commands.forEach(command => {
                if (!categories.includes(command.help.category)) categories.push(command.help.category);
            });
        
            let categorisedCommands = [];
        
            categories.forEach(category => {
                commands.forEach(command => {
                    if (command.help.category == category) categorisedCommands.push(command.help.name);
                });
                embed.addField(category, `${categorisedCommands.map(cmd => `\`${cmd}\``).join(", ")}`);
                categorisedCommands = [];
            });
        
            message.channel.send(embed);
            break;
        }

    }

    
}

module.exports.help = {
    name: "help",
    aliases: [],
    category: "Miscellaneous",
    usage: "[command]",
    description: "Need some help with commands because they are too complicated? Look no further! I am here to your aid!"
}