const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const ytsr = require('ytsr');
const { getQueueInstance } = require('./queueManager');
const ytpl = require('ytpl');

const audioPlayer = createAudioPlayer();
const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Tocar musica do youtube')
		.addStringOption(option =>
			option
				.setName('pesquisa')
				.setDescription('Nome da música ou link do YouTube')
				.setRequired(true)),
	async execute(interaction) {
		const query = interaction.options.getString('pesquisa');
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz');
			return;
		}

		let song;
		let songArr = [];
		try {
			if (ytpl.validateID(query)) {
				const playlist = await ytpl(query);
				playlist.items.forEach(item => {
					song = {
						url: item.shortUrl,
						title: item.title,
					};
					songArr.push(song);
				});
			}
			else if (ytdl.validateURL(query)) {
				const videoInfo = await ytdl.getInfo(query);
				song = {
					url: query,
					title: videoInfo.videoDetails.title,
				};
			}
			else {
				const searchResults = await ytsr(query, { limit: 1 });
				if (!searchResults || searchResults.items.length === 0) {
					await interaction.reply('Nenhum resultado encontrado para essa pesquisa');
					return;
				}

				const videoInfo = searchResults.items[0];
				song = {
					url: videoInfo.url,
					title: videoInfo.title,
				};
			}
		}
		catch (error) {
			console.error('Erro: ', error);
			await interaction.reply('Ocorreu um erro ao processar o pedido');
			return;
		}

		let serverQueue = queue.get(interaction.guild.id);
		if (!serverQueue) {
			const queueConstruct = {
				textChannel: interaction.channel,
				voiceChannel,
				connection: null,
				songs: [],
				playing: false,
			};

			queue.set(interaction.guild.id, queueConstruct);
			serverQueue = queue.get(interaction.guild.id);
			try {
				if (songArr.length > 0) {
					serverQueue.songs = serverQueue.songs.concat(songArr);
					songArr = [];
				}
				else {
					serverQueue.songs.push(song);
				}
			}
			catch (error) {
				console.error('Erro:', error);
				await interaction.reply('Ocorreu um erro, tente novamente');
			}

			try {
				const connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: voiceChannel.guild.id,
					adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				});

				serverQueue.connection = connection;
				serverQueue.playing = true;
				await play(interaction.guild, serverQueue.songs[0]);
				if (serverQueue.songs.length > 0) {
					await interaction.reply('Playlist adicionada a fila');
				}
				else {
					await interaction.reply(`${song.title} adicionado a fila`);
				}
			}
			catch (error) {
				console.error('Erro:', error);
				queue.delete(interaction.guild.id);
				return interaction.reply('Ocorreu um erro ao tentar se juntar ao canal de voz');
			}
		}
		else {
			try {
				if (songArr.length > 0) {
					serverQueue.songs.concat(songArr);
					songArr = [];
					return interaction.reply('Playlist adicionada a fila');
				}
				else {
					serverQueue.songs.push(song);
					return interaction.reply(`${song.title} adicionado a fila`);
				}
			}
			catch (error) {
				console.error('Erro:', error);
				await interaction.reply('Ocorreu um erro, tente novamente');
			}
		}
	},
	audioPlayer,
	play,
};

async function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
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