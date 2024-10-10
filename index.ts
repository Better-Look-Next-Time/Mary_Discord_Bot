import { env } from "bun";
import { Mary, type MaryConfig } from "@mary/core";
import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";
import { trigerWords } from "./trigerWords";

const Bot = new Client({
  intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ]
})

Bot.on(Events.ClientReady, async () => {
  Bot.user?.setActivity({ name: 'SANABI', type: ActivityType.Playing })
  console.log('Bot Run')
})

const config :MaryConfig = {
  thoughtsArray: ['mixtral-8x7b-instruct', 'llama-3.1-8b-instruct'],
  chapter: 'gpt-4o-mini',
  creatorImagePrompt: 'llama-3.1-8b-instruct'
} 

Bot.on(Events.MessageCreate, async (message) => {
  if ( message.author.bot ) return;
  const  MessageContent = message.content.toLowerCase()
  const  mary = new Mary(config, MessageContent, message.channelId, message.author.username, message.author.id)
  if (trigerWords.some(word => MessageContent.includes(word))) {
    await message.channel.sendTyping()
    const typeing = setInterval(() => message.channel.sendTyping(), 5000)
    if(MessageContent.includes('нарисуй')) {
      const answer = await mary.ImageGenerator()
      await message.reply(answer)
    } else {
      const  answer = await mary.Request()
      await message.reply(answer)
    }
    clearInterval(typeing)
    console.log('Bot answer from message')
  }
  else if (message.reference && message.reference.messageId) {
    const orginalMessage = await message.channel.messages.fetch(message.reference.messageId)
    if (orginalMessage.author.id === Bot.user?.id) {
      await message.channel.sendTyping()
      const typeing = setInterval(() => message.channel.sendTyping(), 5000)
      if(MessageContent.includes('нарисуй')) {
        const answer = await mary.ImageGenerator()
        await message.reply(answer)
      } else {
        const  answer = await mary.Request()
        await message.reply(answer)
      }
      clearInterval(typeing)
    }
  }
})

Bot.login(env.DISCORD_TOKEN)
