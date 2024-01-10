// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const ytsr = require('ytsr');
const { getQueueInstance } = require('./queueManager');
const ytpl = require('ytpl');
const fs = require('fs');
const agent = ytdl.createAgent(JSON.parse(fs.readFileSync('./cookies.json')));
const database = require('./../../database.js');
const YTMusic = require('ytmusic-api').default;
let timeoutId;

const audioPlayer = createAudioPlayer();
const queue = getQueueInstance();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Tocar musica do youtube')
		.addStringOption(option =>
			option
				.setName('pesquisa')
				.setDescription('Nome da música ou link do YouTube')
				.setRequired(true)),
	async execute(interaction) {
		// const ytmusic = await new YTMusic().initialize();
		await interaction.deferReply();
		const query = interaction.options.getString('pesquisa');
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.editReply('É preciso estar em um canal de voz');
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
				// playlist.items.forEach(async item => {
				// 	try {
				// 		const DBInfo = await ytmusic.searchSongs(item.title);
				// 		database.registerArtist(DBInfo[0].artists[0].name, DBInfo[0].duration);
				// 		database.registerSong(DBInfo[0].name, DBInfo[0].duration);
				// 	}
				// 	catch (error) {
				// 		console.error('DB ERROR: ', error);
				// 	}
				// });
			}
			else if (ytdl.validateURL(query)) {
				const videoInfo = await ytdl.getInfo(query, { agent });
				song = {
					url: query,
					title: videoInfo.videoDetails.title,
				};
			}
			else {
				const searchResults = await ytsr(query, { limit: 1 });
				if (!searchResults || searchResults.items.length === 0) {
					await interaction.editReply('Nenhum resultado encontrado para essa pesquisa');
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
			await interaction.editReply('Ocorreu um erro ao processar o pedido');
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
				await interaction.editReply('Ocorreu um erro, tente novamente');
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
				if (serverQueue.songs.length > 1) {
					await interaction.editReply('Playlist adicionada a fila');
				}
				else {
					await interaction.editReply(`${song.title} adicionado a fila`);
				}
			}
			catch (error) {
				console.error('Erro:', error);
				queue.delete(interaction.guild.id);
				return interaction.editReply('Ocorreu um erro ao tentar se juntar ao canal de voz');
			}
		}
		else {
			try {
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = undefined;
					console.error('Timeout stopped!');
				}
				if (songArr.length > 1) {
					serverQueue.songs.concat(songArr);
					songArr = [];
					return interaction.editReply('Playlist adicionada a fila');
				}
				else {
					serverQueue.songs.push(song);
					return interaction.editReply(`${song.title} adicionado a fila`);
				}
			}
			catch (error) {
				console.error('Erro:', error);
				await interaction.editReply('Ocorreu um erro, tente novamente');
			}
		}
	},
	audioPlayer,
	play,
};

async function play(guild, song) {
	const ytmusic = await new YTMusic().initialize();
	const serverQueue = queue.get(guild.id);
	if (!song) {
		queue.delete(guild.id);
		return;
	}

	try {
		serverQueue.connection.subscribe(audioPlayer);
		const stream = await ytdl(song.url, {
			agent: agent,
			highWaterMark: 1 << 62,
			liveBuffer: 1 << 62,
		});

		const resource = createAudioResource(stream, { inputType: StreamType.Opus });

		if (serverQueue.songs.length <= 0) {
			timeoutId = setTimeout(() => {
				const connection = getVoiceConnection(guild.id);
				connection.destroy();
				queue.delete(guild.id);
				console.error('Timeout Set!');
			}, 30000);
		}

		resource.playStream.on('end', async () => {
			try {
				const DBInfo = await ytmusic.searchSongs(song.title);
				database.registerArtist(DBInfo[0].artists[0].name, DBInfo[0].duration);
				database.registerSong(DBInfo[0].name, DBInfo[0].duration);
			}
			catch (error) {
				console.error('DB ERROR: ', error);
			}
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