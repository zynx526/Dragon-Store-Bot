const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { removeFromCart, getCartSummary } = require('../../utils/store');

module.exports = {
  id: 'cart_remove',
  async execute(interaction) {
    const [_, category, productId] = interaction.customId.split(':');
    const result = removeFromCart(interaction.user.id, category, productId);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
    }

    const summary = getCartSummary(interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(0x00FFFF)
      .setTitle('🛒 Carrinho atualizado')
      .setDescription(summary.items.length ? 'Itens restantes:' : 'Seu carrinho está vazio.');

    if (summary.items.length) {
      summary.items.forEach(item => {
        embed.addFields({
          name: `${item.nome} (${item.quantidade}x)`,
          value: `💰 Unitário: R$ ${Number(item.precoUnitario).toFixed(2)}\nSubtotal: R$ ${Number(item.subtotal).toFixed(2)}`,
          inline: false
        });
      });
      embed.addFields({ name: '💵 Total', value: `R$ ${Number(summary.total).toFixed(2)}`, inline: false });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`cart_view:${interaction.user.id}`).setLabel('Ver carrinho').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`cart_checkout:${interaction.user.id}`).setLabel('Finalizar compra').setStyle(ButtonStyle.Success)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};

path="src/components/buttons/cart_remove.js"},
{