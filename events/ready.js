const { client, config }  = require("../index.js");

client.on("ready", () => {

	console.log(`I, ${client.user.tag}, am at your service. Run ${config.prefix}help to view a list of commands.`);

	client.user.setActivity("commands", { type: "LISTENING"}).catch(console.error);

});