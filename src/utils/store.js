const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createMainEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loja')
    .setDescription('Abre a loja por categoria'),

  async execute(interaction) {
    const embed = createMainEmbed()
      .setTitle('🐉 Dragon Store')
      .setDescription('Escolha a categoria da loja')
      .addFields(
        { name: '📦 Contas', value: 'Produtos premium de contas', inline: true },
        { name: '🍎 Frutas', value: 'Frutas de Blox Fruits', inline: true }
      );

    const menu = new StringSelectMenuBuilder()
      .setCustomId('store_category')
      .setPlaceholder('Selecione uma categoria')
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('Contas').setValue('contas').setEmoji('📦'),
        new StringSelectMenuOptionBuilder().setLabel('Frutas').setValue('frutas').setEmoji('🍎')
      );

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
  }
};
