// Copyright (C) 2023 Gabriel Echeverria - Full notice in bot.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'info',
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Retorna algumas infos sobre o usuario marcado ou que enviou o comando')
		.addUserOption(option =>
			option
				.setName('usuario')
				.setDescription('Retorna as infos desse usuário. Pode ser deixado em branco se o alvo é quem enviou o comando')),
	async execute(interaction) {
		const usuario = interaction.options.getUser('usuario') ?? interaction.user;
		const memberObj = interaction.options.getMember('usuario') ?? interaction.member;
		await interaction.reply(`Esse comando foi enviado pelo usuario ${interaction.user.username}\nO Usuário solicitado se chama: ${usuario.username}\nEle se juntou ao servidor em: ${memberObj.joinedAt}`);
	},
};