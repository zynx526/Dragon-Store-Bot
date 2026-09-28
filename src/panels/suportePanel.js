const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');
const { getAllOrders } = require('../utils/store');

function formatStatus(status) {
  const labels = {
    pendente_pagamento: '⏳ Pendente de pagamento',
    aguardando_aprovacao: '🕵️ Aguardando aprovação',
    aprovado: '✅ Aprovado',
    recusado: '❌ Recusado',
    entregue: '📦 Entregue'
  };

  return labels[status] || status;
}

function buildComprasPanel() {
  const orders = getAllOrders().slice().reverse().slice(0, 5);
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Compras')
    .setDescription('Painel completo de pedidos e pagamentos.')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  if (!orders.length) {
    embed.addFields({ name: '📭 Sem pedidos', value: 'Nenhum pedido registrado até o momento.', inline: false });
    return { embeds: [embed], components: [] };
  }

  orders.forEach(order => {
    const produtos = (order.produtos || []).map(item => `${item.nome} (${item.quantidade}x)`).join(', ') || 'Nenhum item';
    embed.addFields({
      name: `${order.id} • ${formatStatus(order.status)}`,
      value: `👤 ${order.usuario}\n💰 R$ ${Number(order.total || 0).toFixed(2)}\n📦 ${produtos}`,
      inline: false
    });
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('cart_view:panel').setLabel('Ver carrinho').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('cart_checkout:panel').setLabel('Finalizar compra').setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

module.exports = {
  buildComprasPanel,
  renderPanel: buildComprasPanel
};
