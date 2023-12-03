const { SlashCommandBuilder } = require('discord.js');
const { getQueueInstance } = require('./queueManager');
const { play } = require('./play');
const { joinVoiceChannel } = require('@discordjs/voice');
const queue = getQueueInstance();
const talkedRecently = new Set();

module.exports = {
	category: 'music',
	data: new SlashCommandBuilder()
		.setName('john')
		.setDescription('"You\'re fucking gay, as in homosexual" - John Marston'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		const serverQueue = queue.get(interaction.guild.id);

		if (!voiceChannel) {
			await interaction.reply('Voce nao esta em um canal de voz');
		}

		const song = {
			url: 'https://www.youtube.com/watch?v=8PJDr1_HhFI',
			title: 'John Marston calls you gay, as in homosexual.',
		};
		if (!talkedRecently.has(interaction.member.id)) {
			if (!serverQueue) {
				const queueConstruct = {
					textChannel: interaction.channel,
					voiceChannel,
					connection: null,
					songs: [],
					playing: false,
				};

				queue.set(interaction.guild.id, queueConstruct);
				queueConstruct.songs.push(song);

				try {
					const connection = joinVoiceChannel({
						channelId: voiceChannel.id,
						guildId: voiceChannel.guild.id,
						adapterCreator: voiceChannel.guild.voiceAdapterCreator,
					});

					queueConstruct.connection = connection;
					queueConstruct.playing = true;
					await play(interaction.guild, queueConstruct.songs[0]);
					if (interaction.member.id != '411152912379805699') {
						talkedRecently.add(interaction.member.id);
						setTimeout(() => {
							talkedRecently.delete(interaction.member.id);
						}, 30000);
					}
					return interaction.reply('John Marston is coming');
				}
				catch (error) {
					console.error('Erro:', error);
					queue.delete(interaction.guild.id);
					return interaction.reply('John! Where are you John?');
				}
			}
			else {
				const index = Math.floor(Math.random() * (serverQueue.songs.length - 1 + 1)) + 1;
				serverQueue.songs.splice(index, 0, song);
				if (interaction.member.id != '411152912379805699') {
					talkedRecently.add(interaction.member.id);
					setTimeout(() => {
						talkedRecently.delete(interaction.member.id);
					}, 30000);
				}
				return interaction.reply('John Marston is coming.');
			}
		}
		else {
			await interaction.reply('John está ocupado, espere um pouco.');
		}
	},
};