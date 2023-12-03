const { SlashCommandBuilder } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
	category: 'owner',
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Comando restrito para desenvolvimento')
		.addStringOption(option =>
			option
				.setName('string')
				.setDescription('String para eval')
				.setRequired(true)),
	async execute(interaction) {
		if (interaction.user.id != ownerId) {
			await interaction.reply('Apenas Devs podem usar esse comando');
			return;
		}

		const string = interaction.options.getString('string');

		try {
			const evaled = eval(string);
			const cleaned = await clean(interaction.client, evaled);
			await interaction.reply(`\`\`\`js\n${cleaned}\n\`\`\``);
		}
		catch (error) {
			await interaction.reply(`\`ERROR\` \`\`\`x1\n${error}\n\`\`\``);

		}
	},
};


async function clean(client, text) {
	if (text && text.constructor.name == 'Promise') {
		text = await text;
	}

	if (typeof text !== 'string') {
		text = require('util').inspect(text, { depth: 1 });
	}

	text = text
		.replace(/`/g, '`' + String.fromCharCode(8203))
		.replace(/@/g, '@' + String.fromCharCode(8203))
		.replaceAll(client.token, '[CENSURADO (Token privado)]');

	return text;
}