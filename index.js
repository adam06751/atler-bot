const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages
  ]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

let participants = [];
let eventMessageId = null;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  cron.schedule('30 * * * *', async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    participants = [];

    const msg = await channel.send(
      '🎯 **Informal Event Open!**\nReact with ✅ to join\n⏳ First 10 only'
    );

    eventMessageId = msg.id;
    await msg.react('✅');
  });

  cron.schedule('40 * * * *', async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!participants.length) return;

    channel.send(
      `✅ **Participants (${participants.length}/10)**\n` +
      participants.map((u, i) => `${i + 1}. <@${u}>`).join('\n')
    );
  });
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id !== eventMessageId) return;

  if (participants.length < 10 && !participants.includes(user.id)) {
    participants.push(user.id);
  } else {
    reaction.users.remove(user.id);
  }
});

client.login(TOKEN);
