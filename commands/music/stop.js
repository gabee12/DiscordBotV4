// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { audioPlayer } = require('./play');

const queue = getQueueInstance();


module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Para de tocar musica e apaga a fila atual'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz');
			return;
		}
		try {
			audioPlayer.stop();
			queue.delete(interaction.guild.id);
			await interaction.reply('Obrigado, sua contribuição para a sociedade não será esquecida!');
		}
		catch (error) {
			console.error('Erro: ', error);
			await interaction.reply('Ocorreu um erro ao tentar parar!');
		}
	},
};