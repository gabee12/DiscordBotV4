const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { audioPlayer, play } = require('./play');
const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Pula a musica atual')
		.addNumberOption(option =>
			option
				.setName('num')
				.setDescription('Pula essa quantia de musicas')),
	async execute(interaction) {
		const serverQueue = queue.get(interaction.guild.id);
		const num = interaction.options.getNumber('num');

		if (serverQueue.songs.length < 1) {
			return interaction.reply('Nao há mais musicas na fila');
		}

		if (!num) {
			try {
				audioPlayer.pause();
				serverQueue.songs.shift();
				play(interaction.guild, serverQueue.songs[0]);
				return interaction.reply('Musica pulada ');
			}
			catch (error) {
				console.error('Erro:', error);
			}
		}
		else if (num > serverQueue.songs.length) {
			await interaction.reply('O numero é maior que a fila atual!');
		}
		else {
			try {
				audioPlayer.pause();
				serverQueue.songs.splice(0, num);
				play(interaction.guild, serverQueue.songs[0]);
				return interaction.reply(`${num} músicas puladas com sucesso`);
			}
			catch (error) {
				console.error('Erro:', error);
			}
		}

	},
};