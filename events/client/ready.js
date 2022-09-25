const { createTopicConnection } = require("http2byond");
const { getStatus } = require('../../functions/socket');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const day = require('dayjs');
const fs = require('fs');

module.exports = async (client) => {
  // New round counter code, checks every 10 seconds  
  // if round_duration is changed and decreased.
  console.log(client.user.tag, process.env.PREFIX);

  while (true) {
    console.log(day().format("HH:mm:ss") + ' checking new round!');
    let connection = createTopicConnection({ host: process.env.HOST, port: process.env.PORT });
    let lastStatus = await getStatus(connection);
  
    if (lastStatus && !lastStatus.error && lastStatus.data && lastStatus.data.round_id) {
      lastStatus = lastStatus.data;
      let lastLog = JSON.parse(fs.readFileSync('./round.json', 'utf-8'));

      if (lastLog.id < lastStatus.round_id) {
        lastLog['id'] = lastStatus.round_id;
        fs.writeFileSync('./round.json', JSON.stringify(lastLog, null, 2));
        
        const newRoundChannel = client.channels.cache.get(process.env.NEW_ROUND_CHANNEL);
        await newRoundChannel.send(`<@&${process.env.NEW_ROUND_ROLE}> New round started, round id: ${lastStatus.round_id}`);
      };
    };

    connection.destroy();
    console.log('wait 10sec');
    await delay(1000 * 10)
  };
};