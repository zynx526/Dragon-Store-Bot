const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getCartSummary } = require('../../utils/store');

function buildRemoveRows(items) {
  const rows = [];
  for (let index = 0; index < items.length; index += 5) {
    const chunk = items.slice(index, index + 5);
    const row = new ActionRowBuilder();
    chunk.forEach(item => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`cart_remove:${item.category}:${item.productId}`)
          .setLabel(`Remover ${item.nome}`)
          .setStyle(ButtonStyle.Danger)
      );
    });
    rows.push(row);
  }
  return rows;
}

module.exports = {
  id: 'cart_view',
  async execute(interaction) {
    const summary = getCartSummary(interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(0x00FFFF)
      .setTitle('🛒 Carrinho do cliente')
      .setDescription(summary.items.length ? 'Itens do seu carrinho:' : 'Seu carrinho está vazio.');

    if (!summary.items.length) {
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    summary.items.forEach(item => {
      embed.addFields({
        name: `${item.nome} (${item.quantidade}x)`,
        value: `💰 Unitário: R$ ${Number(item.precoUnitario).toFixed(2)}\nSubtotal: R$ ${Number(item.subtotal).toFixed(2)}`,
        inline: false
      });
    });

    embed.addFields({ name: '💵 Total', value: `R$ ${Number(summary.total).toFixed(2)}`, inline: false });

    const rows = buildRemoveRows(summary.items);
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`cart_checkout:${interaction.user.id}`).setLabel('Finalizar compra').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cart_view:${interaction.user.id}`).setLabel('Atualizar').setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [...rows, actionRow], ephemeral: true });
  }
};
