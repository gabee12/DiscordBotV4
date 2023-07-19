const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { play } = require('./play');
const ytpl = require('ytpl');
const { joinVoiceChannel } = require('@discordjs/voice');
const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playlist')
		.setDescription('Adiciona uma playlist a fila')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('Link da playlist')
				.setRequired(true)),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		let serverQueue = queue.get(interaction.guild.id);
		const url = interaction.options.getString('url');

		if (!voiceChannel) {
			await interaction.reply('Nao tem mensagem pra voce, voce nao esta em um canal de voz :(');
		}

		if (!ytpl.validateID(url)) {
			await interaction.reply('Link inválido!');
			return;
		}

		let song;
		const songArr = [];
		const playlist = await ytpl(url);

		playlist.items.forEach(item => {
			song = {
				url: item.shortUrl,
				title: item.title,
			};
			songArr.push(song);
		});
		console.log(JSON.stringify(songArr));

		if (!serverQueue) {
			const queueConstruct = {
				textChannel: interaction.channel,
				voiceChannel,
				connection: null,
				songs: [],
				playing: false,
			};

			queue.set(interaction.guild.id, queueConstruct);
			queueConstruct.songs.push(songArr[0]);

			try {
				const connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: voiceChannel.guild.id,
					adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				});

				queueConstruct.connection = connection;
				queueConstruct.playing = true;
				await play(interaction.guild, queueConstruct.songs[0]);
				serverQueue = queue.get(interaction.guild.id);
				songArr.splice(0, 1);
				songArr.forEach(item => {
					serverQueue.songs.push(item);
				});
				return interaction.reply('Playlist adicionada a fila!');
			}
			catch (error) {
				console.error('Erro:', error);
				queue.delete(interaction.guild.id);
				return interaction.reply('Ocorreu um erro ao tentar se juntar ao canal de voz');
			}
		}
		else {
			serverQueue = queue.get(interaction.guild.id);
			try {
				songArr.forEach(item => {
					serverQueue.songs.push(item);
				});
				await interaction.followUp('Playlist adicionada a fila!');
			}
			catch (error) {
				console.error('Erro:', error);
				queue.delete(interaction.guild.id);
				await interaction.reply('Ocorreu um erro ao tentar adicionar a playlist');
			}
		}
	},
};