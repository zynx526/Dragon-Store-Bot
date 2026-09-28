const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/roleCheck');
const { getProducts, getProductByName, updateProduct } = require('../../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('estoque')
    .setDescription('Gerenciar estoque da loja')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand.setName('adicionar')
        .setDescription('Adicionar quantidade em estoque')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
        .addStringOption(option => option.setName('nome').setDescription('Nome do produto').setRequired(true))
        .addIntegerOption(option => option.setName('quantidade').setDescription('Quantidade a adicionar').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('remover')
        .setDescription('Remover quantidade em estoque')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
        .addStringOption(option => option.setName('nome').setDescription('Nome do produto').setRequired(true))
        .addIntegerOption(option => option.setName('quantidade').setDescription('Quantidade a remover').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('ver')
        .setDescription('Ver estoque da categoria')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
    ),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const category = interaction.options.getString('categoria');

    if (subcommand === 'ver') {
      const embed = new EmbedBuilder().setColor(0x00FFFF).setTitle(`📦 Estoque • ${category === 'contas' ? 'Contas' : 'Frutas'}`);
      const products = getProducts()[category] || [];
      if (!products.length) {
        embed.setDescription('Nenhum item cadastrado.');
      } else {
        products.forEach(product => {
          embed.addFields({
            name: product.nome,
            value: `🎫 Estoque: ${product.estoque}`,
            inline: true
          });
        });
      }
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const nome = interaction.options.getString('nome');
    const product = getProductByName(category, nome);
    if (!product) {
      return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });
    }

    const quantidade = Number(interaction.options.getInteger('quantidade'));
    if (subcommand === 'adicionar') {
      const result = updateProduct(category, product.id, { estoque: Number(product.estoque) + quantidade });
      return interaction.reply({ content: result.success ? `✅ Estoque aumentado para ${product.nome}.` : '❌ Falha ao atualizar estoque.', ephemeral: true });
    }

    const newValue = Number(product.estoque) - quantidade;
    if (newValue < 0) {
      return interaction.reply({ content: '❌ Quantidade removida maior que o estoque atual.', ephemeral: true });
    }

    const result = updateProduct(category, product.id, { estoque: newValue });
    return interaction.reply({ content: result.success ? `✅ Estoque reduzido para ${product.nome}.` : '❌ Falha ao atualizar estoque.', ephemeral: true });
  }
};
