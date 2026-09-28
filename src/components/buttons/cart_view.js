const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getProductById, addToCart, getCartSummary } = require('../../utils/store');

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

    if (Number(product.estoque) <= 0) {
      return interaction.reply({ content: '❌ Este produto está fora de estoque.', ephemeral: true });
    }

    const currentCart = getCartSummary(interaction.user.id);
    const currentQuantity = currentCart.items.find(item => item.productId === productId && item.category === category)?.quantidade || 0;
    const remaining = Number(product.estoque) - currentQuantity;

    if (remaining <= 0) {
      return interaction.reply({ content: '❌ Você já atingiu a quantidade disponível deste produto no carrinho.', ephemeral: true });
    }

    const result = addToCart(interaction.user.id, category, productId, 1);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
    }

    const summary = getCartSummary(interaction.user.id);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`cart_view:${interaction.user.id}`).setLabel('Ver carrinho').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`cart_checkout:${interaction.user.id}`).setLabel('Finalizar compra').setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      content: `✅ Produto adicionado ao carrinho:\n📦 ${product.nome}\n💰 R$ ${Number(product.preco).toFixed(2)}\n🧺 Total do carrinho: R$ ${Number(summary.total).toFixed(2)}`,
      components: [row],
      ephemeral: true
    });
  }
};
