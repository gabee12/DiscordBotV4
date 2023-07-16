const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { getQueueInstance } = require('./queueManager');

const audioPlayer = createAudioPlayer();
const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Tocar musica do youtube')
		.addStringOption(option =>
			option
				.setName('link')
				.setDescription('URL do YouTube')
				.setRequired(true)),
	async execute(interaction) {
		const link = interaction.options.getString('link');
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz');
			return;
		}

		const videoInfo = await ytdl.getInfo(link);
		const serverQueue = queue.get(interaction.guild.id);
		const song = {
			url: link,
			title: videoInfo.videoDetails.title,
		};

		if (!serverQueue) {
			const queueConstruct = {
				textChannel: interaction.channel,
				voiceChannel,
				connection: null,
				songs: [],
				playing: false,
			};

			queue.set(interaction.guild.id, queueConstruct);
			queueConstruct.songs.push(song);

			try {
				const connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: voiceChannel.guild.id,
					adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				});

				queueConstruct.connection = connection;
				queueConstruct.playing = true;
				await play(interaction.guild, queueConstruct.songs[0]);
				return interaction.reply(`${song.title} adicionado a fila`);
			}
			catch (error) {
				console.error('Erro:', error);
				queue.delete(interaction.guild.id);
				return interaction.reply('Ocorreu um erro ao tentar se juntar ao canal de voz');
			}
		}
		else {
			serverQueue.songs.push(song);
			return interaction.reply(`${song.title} adicionado a fila`);
		}
	},
	audioPlayer,
	play,
};

async function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.playing = false;
		queue.delete(guild.id);
		return;
	}

	try {
		serverQueue.connection.subscribe(audioPlayer);
		const stream = await ytdl(song.url, {
			filter: 'audioonly',
			fmt: 'mp3',
			highWaterMark: 1 << 62,
			liveBuffer: 1 << 62,
			dlChunkSize: 0,
			bitrate: 128,
			quality: 'lowestaudio',
		});

		const resource = createAudioResource(stream, { inputType: StreamType.Opus });

		resource.playStream.on('end', () => {
			setTimeout(() => {
				serverQueue.songs.shift();
				play(guild, serverQueue.songs[0]);
			}, 200);
		});

		resource.playStream.on('error', (error) => {
			console.error('Audio Stream Error:', error);
			serverQueue.textChannel.send('Erro ao tocar esse áudio. Pulando...');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		});

		audioPlayer.on(AudioPlayerStatus.Paused, () => {
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		});

		audioPlayer.play(resource);
		serverQueue.textChannel.send(`Tocando: ${song.title} (${song.url})`);
	}
	catch (error) {
		console.error('Erro:', error);
		serverQueue.playing = false;
		queue.delete(guild.id);
		return;
	}
}

