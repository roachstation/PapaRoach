const fs = require('fs');
const Users = new Map();

const Locking = new Map();
Locking.set('status', true);

exports.run = (client, message, args) => {
  if (args[0] == "unlock") {
    if (["225984607374278667", "285124795513700352", "362674872960417804"].includes(message.author.id)) {
      Locking.set('status', false);
      return message.reply("You broke the lock! Thank god.");
    };
  };

  if (Locking.get('status') == true && args[0] == "help") return message.channel.send('No help for you, bozo. FRIDGE IS LOCKED!!!!!');
  if (Locking.get('status') == true) return message.channel.send(`Our fridge is currently locked, please come later.`);
  
  let file = JSON.parse(fs.readFileSync('./fridge.json', 'utf-8'));
  
  if (!Users.get(message.author.id)) Users.set(message.author.id, { usage: 0, time: Date.now(), aware: 0 });
  
  let userData = Users.get(message.author.id);
  if (userData.usage > 3 && Date.now() - userData.time < 3000) {
    if (userData['aware'] == 0) message.channel.send(`You are are spamming, chill a bit :innocent:`).then((m) => setTimeout(() => m.delete(), 3000));
    
    userData['aware']++;
    return setTimeout(() => {
      Users.delete(message.author.id);
    }, 3000)
  };

  userData['usage']++;
  userData['time'] = Date.now();

  if (args[0] == "help") {
    return message.channel.send(`
?fridge add/put <item>: Puts an item to the fridge
?fridge get: Gets an item from the fridge
?fridge help: Check all commands
?fridge peek: Peek the fridge
?fridge eat: Eat an item from the fridge
?fridge lock: Lock the fridge for 1 hrs (%5 chance)
?fridge unlock: Forces to unlock fridge (only admin)
`)
  };

  if (args[0] == "add" || args[0] == "put") {
    if (!args[1]) return message.channel.send(`Usage: ?fridge add <link, text, etc>`);
    if (args[1].length > 140) return message.channel.send(`It is too big for a fridge...`);
    
    let element = args.splice(1).join(" ");
    if (file.find((obj) => obj == element)) return message.channel.send(`There is already ${element} in the fridge.`);

    file.push(element);
    fs.writeFileSync('./fridge.json', JSON.stringify(file));
    return message.channel.send(`You put ${element} into the fridge.`);
  };

  if (args[0] == "eat") {
    if (file.length < 1) return message.channel.send(`There is nothing in the fridge, add some to eat some!`);
    let item = file[Math.floor(Math.random()*file.length)];
    file = file.filter((el) => el != item);

    fs.writeFileSync('./fridge.json', JSON.stringify(file));
    return message.channel.send(`You eat the last ${item} from the fridge. Bon appetit!`);
  };

  if (args[0] == "get") {
    if (file.length < 1) return message.channel.send(`There is nothing in the fridge, add some to get some!`);
    let item = file[Math.floor(Math.random()*file.length)];

    return message.channel.send(`You check out the fridge, you see the last ${item}.`);
  }

  if (args[0] == "peek") {
    if (file.length < 1) return message.channel.send(`There is nothing in the fridge, add some to see some!`);
    let picks, text;

    if (file.length >= 10) picks = file.sort(() => Math.random() - Math.random()).slice(0, 10);
    if (file.length < 10) picks = file.sort(() => Math.random() - Math.random());

    text = `Bored, you open your fridge and stare it for a few minutes and you see: `
    picks.forEach((el) => text += `The last ${el}, `);
    text += "it doesn't feel as chilly as you expected";

    return message.channel.send(text);
  };

  if (args[0] == "lock") {
    if (Locking.get(message.author.id)) return message.channel.send(`Try again in 20 minutes. :weary:`);
    if (Locking.get('status') == true) return message.channel.send(`It is already locked, whats wrong with u?`);

    let chance = Math.floor(Math.random() * (100 - 1 + 1) + 1);
    if (chance < 5) {
      // Locked successfully.
      Locking.set('status', true);
      Locking.set(message.author.id, true);

      setTimeout(() => { Locking.set('status', false); Locking.delete(message.author.id) }, 1000 * 60 * 60);
      return message.channel.send(`You locked the fridge with a rubbish lock for 1 hours. Nice job, idiot.`);
    } else {
      // Unlucky.
      Locking.set(message.author.id, true);
      setTimeout(() => Locking.delete(message.author.id), 1000 * 60 * 20);

      return message.channel.send(`Nice try but your lock isnt strong at all.`);
    };
  };
};