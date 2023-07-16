const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { audioPlayer } = require('./play');
const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Pula a musica atual'),
	async execute(interaction) {
		const serverQueue = queue.get(interaction.guild.id);

		if (serverQueue.songs.length < 1) {
			return interaction.reply('Nao há mais musicas na fila');
		}

		try {
			audioPlayer.pause();
			return interaction.reply('Musica pulada ');
		}
		catch (error) {
			console.error('Erro:', error);
		}

	},
};