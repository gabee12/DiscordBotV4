const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { play } = require('./play');

const queue = getQueueInstance();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('retirar')
		.setDescription('Remove uma música da fila')
		.addNumberOption(option =>
			option
				.setName('num')
				.setDescription('Número da Música na fila')
				.setRequired(true)),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		const num = interaction.options.getNumber('num');
		const serverQueue = queue.get(interaction.guild.id);

		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz!');
			return;
		}

		if (!serverQueue) {
			await interaction.reply('Nao há nenhuma fila no momento');
			return;
		}

		if (num > serverQueue.songs.length) {
			await interaction.reply('O número inserido é maior que o tamanho da fila atual');
		}
		else if (num < 1) {
			await interaction.reply('O número inserido nao pode ser menor do que 1');
		}
		else {
			try {
				const x = serverQueue.songs.splice(num - 1, 1);
				await interaction.reply(`${x[0].title} removido com sucesso da fila!`);
				if (num == 1) {
					play(interaction.guild, serverQueue.songs[0]);
				}
			}
			catch (error) {
				console.error('Erro:', error);
			}
		}


	},
};