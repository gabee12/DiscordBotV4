// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { SlashCommandBuilder } = require('discord.js');
const { audioPlayer } = require('./play');
const { getQueueInstance } = require('./queueManager');
const { play } = require('./play');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('node:fs');

const queue = getQueueInstance();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Continua a música atual ou recupera a ultima fila do bot'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		let serverQueue = queue.get(interaction.guild.id);

		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz');
			return;
		}

		if (!serverQueue) {
			await interaction.deferReply();
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
				const fila = fs.readFileSync('./fila.json');
				serverQueue.songs = serverQueue.songs.concat(await JSON.parse(fila));
			}
			catch (error) {
				console.error(error);
				return interaction.editReply('Ocorreu um erro');
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
				return interaction.editReply('Fila restaurada com sucesso');
			}
			catch (error) {
				console.error(error);
				await interaction.editReply('Ocorreu um erro');
			}
		}
		else {
			try {
				audioPlayer.unpause();
				await interaction.reply('Música resumida');
			}
			catch (error) {
				console.error('Erro: ', error);
				await interaction.reply('Ocorreu um erro ao tentar resumir a música!');
			}
		}
	},
};