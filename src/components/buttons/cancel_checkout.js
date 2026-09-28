const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { createOrderFromCart, getCartSummary } = require('../../utils/store');

module.exports = {
  id: 'confirm_checkout',
  async execute(interaction) {
    const summary = getCartSummary(interaction.user.id);
    if (!summary.items.length) {
      return interaction.reply({ content: '❌ Seu carrinho está vazio.', ephemeral: true });
    }

    const result = createOrderFromCart(interaction.user.id);
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
    }

    const order = result.order;
    const embed = new EmbedBuilder()
      .setColor(0x00FF9D)
      .setTitle('✅ Pedido criado com sucesso')
      .setDescription('Seu pedido foi registrado e está aguardando pagamento para aprovação.')
      .addFields(
        { name: '🆔 Pedido', value: order.id, inline: true },
        { name: '💰 Total', value: `R$ ${Number(order.total).toFixed(2)}`, inline: true },
        { name: '💸 Chave Pix', value: process.env.PIX_KEY || 'PIX não configurado', inline: false },
        { name: '📦 Produtos', value: order.produtos.map(item => `${item.nome} (${item.quantidade}x)`).join('\n') || 'Nenhum item', inline: false },
        { name: '🧾 Próximo passo', value: `Use /comprovante com o ID do pedido e o link do comprovante para enviar o pagamento.`, inline: false }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`cart_view:${interaction.user.id}`).setLabel('Ver carrinho').setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
