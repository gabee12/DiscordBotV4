const { SlashCommandBuilder } = require('discord.js');
const db = require('./../../database.js');
const date = new Date();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('retrospectiva')
		.setDescription('mostra a retrospectiva do bot em um determinado mes ou ano')
		.addStringOption(option =>
			option
				.setName('subcomando')
				.setDescription('O subcomando a ser executado')
				.setChoices(
					{ name: 'Tempo', value: 'tempo' },
				)
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('mes')
				.addChoices(
					{ name: 'Janeiro', value: 'Jan' },
					{ name: 'Fevereiro', value: 'Fev' },
					{ name: 'Março', value: 'Mar' },
					{ name: 'Abril', value: 'Abr' },
					{ name: 'Maio', value: 'Mai' },
					{ name: 'Junho', value: 'Jun' },
					{ name: 'Julho', value: 'Jul' },
					{ name: 'Agosto', value: 'Ago' },
					{ name: 'Setembro', value: 'Set' },
					{ name: 'Outubro', value: 'Out' },
					{ name: 'Novembro', value: 'Nov' },
					{ name: 'Dezembro', value: 'Dez' },
				)
				.setDescription('Mes da retrospectiva'))
		.addNumberOption(option =>
			option
				.setMinValue(2023)
				.setMaxValue(2050)
				.setName('ano')
				.setDescription('Ano da retrospectiva')),
	async execute(interaction) {
		await interaction.deferReply();

		const command = interaction.options.getString('subcomando');
		const mes = interaction.options.getString('mes') ?? db.getMonthName();
		const ano = interaction.options.getNumber('ano') ?? String(date.getFullYear());
		let time;

		switch (command) {
		case 'tempo':
			time = await db.getTotalTime(mes, ano) / 60;
			time = Math.round(time);
			await interaction.editReply(`\`\`\`js\n${time} Minutos Tocados no total\n\`\`\``);
			break;
		default:
			await interaction.editReply('Ocorreu um erro');
		}
	},
};