const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');

const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mover')
		.setDescription('Move uma música na fila')
		.addNumberOption(option =>
			option
				.setName('num1')
				.setDescription('Número da musica que vai ser movida')
				.setRequired(true))
		.addNumberOption(option =>
			option
				.setName('num2')
				.setDescription('Novo lugar na fila')
				.setRequired(true)),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		const num1 = interaction.options.getNumber('num1');
		const num2 = interaction.options.getNumber('num2');
		const serverQueue = queue.get(interaction.guild.id);

		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz!');
			return;
		}

		if (!serverQueue || serverQueue.songs.length <= 1) {
			await interaction.reply('Nao há nenhuma fila no momento ou a fila é muito curta para ser editada');
			return;
		}

		if (num1 <= 0 || num2 <= 0) {
			await interaction.reply('Os números inserido precisam ser maiores do que 0');
			return;
		}

		if (num1 == 1 || num2 == 1) {
			await interaction.reply('Mover uma música para o comeco da fila ou mover a primeira música da filla nao é possível');
			return;
		}

		if (num1 == num2) {
			await interaction.reply('Lugar da música inalterado. Os números inseridos sao iguais');
			return;
		}

		if (num1 > serverQueue.songs.length) {
			interaction.reply('O primeiro número inserido é maior que o tamanho da fila atual');
			return;
		}

		try {
			if (num2 > serverQueue.songs.length) {
				const movedSong = serverQueue.songs.splice(num1 - 1, 1);
				serverQueue.songs.concat(movedSong);
				await interaction.reply('Movido com sucesso');
				return;
			}
			else {
				const movedSong = serverQueue.songs.splice(num1 - 1, 1);
				console.log(movedSong);
				const rest = serverQueue.songs.splice(num2 - 1, serverQueue.songs.length);
				serverQueue.songs = serverQueue.songs.concat(movedSong).concat(rest);
				await interaction.reply('Movido com sucesso');
				return;
			}
		}
		catch (error) {
			console.error('Erro:', error);
			await interaction.reply('Nao foi possível mover a música');
			return;
		}
	},
};