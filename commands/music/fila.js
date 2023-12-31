// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');

const queue = getQueueInstance();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('fila')
		.setDescription('Mostra a fila de musicas atual'),
	async execute(interaction) {
		await interaction.deferReply();
		const serverQueue = queue.get(interaction.guild.id);
		if (!serverQueue || serverQueue.songs.length === 0) {
			return interaction.editReply('A fila esta vazia!');
		}

		let queueText = serverQueue.songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n');
		const chunks = [];
		while (queueText.length > 2000) {
			for (let i = 1999; i > 0; i--) {
				if (queueText.charAt(i) == '\n') {
					const newText = queueText.slice(0, i);
					const rest = queueText.slice(i + 1);
					chunks.push(newText);
					queueText = rest;
					break;
				}
			}
		}
		chunks.push(queueText);
		await interaction.editReply('Fila atual:\n');
		chunks.forEach(item => {
			interaction.channel.send(item);
		});
	},
};