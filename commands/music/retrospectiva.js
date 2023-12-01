const { SlashCommandBuilder } = require('discord.js');
const db = require('./../../database.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('retrospectiva')
		.setDescription('mostra a retrospectiva do bot em um determinado mes ou ano')
		.addNumberOption(option =>
			option
				.setName('numero')
				.setDescription('Mes ou ano da restrospectiva')
				.setRequired(true)),
	async execute(interaction) {
		const num = interaction.options.getNumber('numero');
		let totalTime;
		db.getTotalTime(num).then(async (total) => {
			totalTime = Math.round(total / 60);
			await interaction.reply(`\`\`\`js\n${totalTime} Minutos Tocados no total\n\`\`\``);
		}).catch((err) => {
			console.error(err.message);
		});
	},
};