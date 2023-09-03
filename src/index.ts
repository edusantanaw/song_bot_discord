import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import client from "./config/client";
import dotenv from "./config/dotenv";

dotenv();

const commands = ["!init", "!stop", "!pause", "!unpause", "!play url", "!stop"];

const ACCESS_TOKEN = process.env.BOT_TOKEN;
const audioPlayer = createAudioPlayer();

client.on("ready", () => {
  console.log("Discord bot init!");
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content === "!init") {
    msg.channel.send("o bot está on my little friend");
  }
  if (msg.content.startsWith("!stop")) {
    audioPlayer.stop();
    return;
  }
  if (msg.content.startsWith("!unpause")) {
    audioPlayer.unpause();
    return;
  }
  if (msg.content.startsWith("!pause")) {
    audioPlayer.pause();
    return;
  }

  if (msg.content.startsWith("!commands")) {
    for (const item of commands) {
      msg.channel.send(item);
    }
    return;
  }

  if (msg.content.startsWith("!play")) {
    const voiceChannel = msg?.member?.voice.channel;
    if (!voiceChannel) {
      msg.reply("Você precisa estar em um canal de voz para eu tocar música.");
      return;
    }
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const args = msg.content.split(" ");
    const url = args[1];
    if (!url) {
      msg.reply("Você precisa fornecer uma URL válida da música do YouTube.");
      return;
    }
    const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    const resource = createAudioResource(stream);
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);
    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    msg.channel.send(`Tocando agora: ${url}`);
  }
});

client.login(ACCESS_TOKEN);
