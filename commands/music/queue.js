const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');

const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fila')
		.setDescription('Mostra a fila de musicas atual'),
	async execute(interaction) {
		const serverQueue = queue.get(interaction.guild.id);
		if (!serverQueue || serverQueue.songs.length === 0) {
			return interaction.reply('A fila esta vazia!');
		}

		const queueText = serverQueue.songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n');
		interaction.reply(`Fila atual:\n${queueText}`);
	},
};