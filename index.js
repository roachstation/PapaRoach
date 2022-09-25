require('dotenv').config();
const { Client } = require('discord.js');
const glob = require('glob');

const client = new Client({ intents: [ "Guilds", "GuildMembers", "GuildMessages", "MessageContent", "GuildPresences" ] });

client.commands = new Map();
glob('commands/**/*.js', (err, files) => {
  files.forEach((f) => {
    const command = require('./' + f),
      commandName = f.split("/")[f.split("/").length - 1].split(".")[0];

    console.log("command: %s", commandName);
    client.commands.set(commandName, command);
  });
});

glob('events/**/*.js', (err, files) => {
  files.forEach((f) => {
    const event = require('./' + f),
      eventName = f.split("/")[f.split("/").length - 1].split(".")[0];

    console.log("event: %s", eventName);
    client.on(eventName, event.bind(null, client));
  });
});

client.login(process.env.TOKEN);
