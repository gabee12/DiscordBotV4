const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const queue = getQueueInstance();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Randomiza a fila'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		const serverQueue = queue.get(interaction.guild.id);

		if (!voiceChannel) {
			await interaction.reply('É preciso estar em um canal de voz');
		}

		if (!serverQueue || serverQueue.songs.length <= 1) {
			await interaction.reply('Nao há nenhuma fila atualmente ou a fila tem apenas uma música');
		}
		const toShuffle = serverQueue.songs.splice(1);
		const shuffled = await shuffle(toShuffle);

		console.log(shuffled);

		serverQueue.songs = serverQueue.songs.concat(shuffled);

		interaction.reply('A fila foi randomizada');
	},
};

async function shuffle(array) {
	console.log(array);
	for (let i = array.length - 1; i >= 1; i--) {
		const j = randomInt(0, i + 1);
		[array[j], array[i]] = [array[i], array[j]];
	}
	return array;
}

function randomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}