const { SlashCommandBuilder } = require('discord.js');
const { audioPlayer } = require('./play');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pausa a música atual'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz');
			return;
		}
		try {
			audioPlayer.pause();
			await interaction.reply('Música pausada');
		}
		catch (error) {
			console.error('Erro: ', error);
			await interaction.reply('Ocorreu um erro ao tentar parar!');
		}
	},
};