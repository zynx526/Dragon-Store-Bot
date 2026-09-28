const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addToCart, getProductById } = require('../../utils/store');

module.exports = {
  id: 'buy_product',
  async execute(interaction) {
    const customId = interaction.customId;
    const parts = customId.split(':');
    const category = parts[1];
    const productId = parts[2];
    const product = getProductById(category, productId);

    if (!product) {
      return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });
    }

    const result = addToCart(interaction.user.id, category, productId, 1);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`cart_checkout:${category}:${productId}`).setLabel('Finalizar compra').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cart_cancel:${interaction.user.id}`).setLabel('Cancelar').setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      content: `✅ Produto adicionado ao carrinho:\n📦 ${product.nome}\n💰 R$ ${Number(product.preco).toFixed(2)}`,
      components: [row],
      ephemeral: true
    });
  }
};
