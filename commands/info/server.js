const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Responde com infos sobre o servidor atual'),
	async execute(interaction) {
		await interaction.reply(`O nome do servidor é: ${interaction.guild.name}\nNúmero de membros: ${interaction.guild.memberCount}`);
	},
};