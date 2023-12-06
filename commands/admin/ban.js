// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	category: 'admin',
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Banir um membro')
		.addUserOption(option =>
			option
				.setName('alvo')
				.setDescription('Alvo do banimento')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('motivo')
				.setDescription('Motivo do banimento'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const target = interaction.options.getUser('alvo');
		const motivo = interaction.options.getString('motivo') ?? 'Motivo desconhecido';

		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirmar banimento')
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancelar banimento')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder().addComponents(confirm, cancel);

		const resposta = await interaction.reply({
			content: `Tem certeza de que quer banir ${target} por: ${motivo}`,
			components: [row],
		});

		const filtroColetor = i => i.user.id === interaction.user.id;

		try {
			const confirmado = await resposta.awaitMessageComponent({ filter: filtroColetor, time: 60000 });
			if (confirmado.customId === 'confirm') {
				await interaction.guild.members.ban(target);
				await confirmado.update({ content: `${target.username} foi banido por ${interaction.user.username}`, components: [] });
				await interaction.client.users.send(target, `Voce foi banido no servidor ${interaction.guild.name} pelo seeguinte motivo: ${motivo}`);
				return;
			}
			else if (confirmado.customId === 'cancel') {
				await confirmado.update({ content: 'Comando cancelado', components: [] });
				return;
			}
		}
		catch (error) {
			console.error('Erro:', error);
			await interaction.editReply({ content: 'Comando nao confirmado dentro de 1 minuto, cancelando', components: [] });
		}
	},
};