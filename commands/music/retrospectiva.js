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
					{ name: 'Artistas', value: 'artistas' },
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
					{ name: 'Apenas ano', value: 'a' },
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
		let mes = interaction.options.getString('mes') ?? db.getMonthName();
		if (mes == 'a') {
			mes = '';
		}
		const ano = interaction.options.getNumber('ano') ?? date.getFullYear();
		let time;
		let artistas;
		let mesNum;

		if (ano > date.getFullYear) {
			return interaction.editReply('O ano inserido é maior que o ano atual');
		}

		switch (mes) {
		case 'Jan':
			mesNum = 1;
			break;
		case 'Fev':
			mesNum = 2;
			break;
		case 'Mar':
			mesNum = 3;
			break;
		case 'Abr':
			mesNum = 4;
			break;
		case 'Mai':
			mesNum = 5;
			break;
		case 'Jun':
			mesNum = 6;
			break;
		case 'Jul':
			mesNum = 7;
			break;
		case 'Ago':
			mesNum = 8;
			break;
		case 'Set':
			mesNum = 9;
			break;
		case 'Out':
			mesNum = 10;
			break;
		case 'Nov':
			mesNum = 11;
			break;
		case 'Dez':
			mesNum = 12;
			break;
		default:
			break;
		}

		if (ano == date.getFullYear() && mesNum == (date.getMonth() + 1) && date.getDate() != lastDay(date.getFullYear, date.getMonth)) {
			return interaction.editReply('O mes atual ainda nao acabou');
		}

		if (ano == date.getFullYear() && mesNum > (date.getMonth + 1)) {
			return interaction.editReply('Impossivel acessar dados futuros');
		}

		switch (command) {
		case 'tempo':
			time = await db.getTotalTime(mes, String(ano)) / 60;
			time = Math.round(time);
			await interaction.editReply(`\`\`\`js\n${time} Minutos Tocados no total\n\`\`\``);
			break;
		case 'artistas':
			artistas = await db.getArtistsSorted(mes, String(ano));
			await interaction.editReply(`\`\`\`js\nTop 5 artistas:\n1. ${artistas[0].artistName}\t${artistas[0].count} Músicas\t${Math.round(artistas[0].timePlayed / 60)} Minutos\n2. ${artistas[1].artistName}\t${artistas[1].count} Músicas\t${Math.round(artistas[1].timePlayed / 60)} Minutos\n3. ${artistas[2].artistName}\t${artistas[2].count} Músicas\t${Math.round(artistas[2].timePlayed / 60)} Minutos\n4. ${artistas[3].artistName}\t${artistas[3].count} Músicas\t${Math.round(artistas[3].timePlayed / 60)} Minutos\n5. ${artistas[4].artistName}\t${artistas[4].count} Músicas\t${Math.round(artistas[4].timePlayed / 60)} Minutos\`\`\``);
			break;
		default:
			await interaction.editReply('Ocorreu um erro');
		}
	},
};

function lastDay(year, month) {
	return new Date(year, month + 1, 0);
}