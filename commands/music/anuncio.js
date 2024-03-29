// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { play, timeoutId } = require('./play');
const { joinVoiceChannel } = require('@discordjs/voice');
const queue = getQueueInstance();
const talkedRecently = new Set();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('anuncio')
		.setDescription('Dr. Robotnik tem um anuncio para fazer'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		const serverQueue = queue.get(interaction.guild.id);

		if (!voiceChannel) {
			await interaction.reply('Dr. Robotnik nao pode falar com voce, voce nao esta em um canal de voz :(');
		}

		const song = {
			url: 'https://www.youtube.com/watch?v=KWP8pQnGoBw&t=1s',
			title: 'Shadow o ouriço é um FDP',
		};
		if (!talkedRecently.has(interaction.member.id)) {
			if (!serverQueue) {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
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
					if (interaction.member.id != '411152912379805699') {
						talkedRecently.add(interaction.member.id);
						setTimeout(() => {
							talkedRecently.delete(interaction.member.id);
						}, 30000);
					}
					return interaction.reply('Dr. Robotnik tem algo importante para dizer');
				}
				catch (error) {
					console.error('Erro:', error);
					queue.delete(interaction.guild.id);
					return interaction.reply('Dr. Robotnik foi silenciado por Shadow o Ouriço, tente novamente');
				}
			}
			else {
				const index = Math.floor(Math.random() * (serverQueue.songs.length - 1 + 1)) + 1;
				serverQueue.songs.splice(index, 0, song);
				if (interaction.member.id != '411152912379805699') {
					talkedRecently.add(interaction.member.id);
					setTimeout(() => {
						talkedRecently.delete(interaction.member.id);
					}, 30000);
				}
				return interaction.reply('VOCÊ TEM 23 HORAS ANTES QUE OS PERDIGOTOS DE MIJO ATINJAM A TERRA');
			}
		}
		else {
			await interaction.reply('Espere um pouco antes de usar o comando de novo');
		}
	},
};