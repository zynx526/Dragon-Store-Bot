const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrdersByUser } = require('../../utils/store');

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minhas-compras')
    .setDescription('Visualizar o histórico das suas compras'),

  async execute(interaction) {
    const orders = getOrdersByUser(interaction.user.id).slice().reverse();
    const embed = new EmbedBuilder()
      .setColor(0x4CC9F0)
      .setTitle('🛒 Minhas compras')
      .setDescription('Histórico dos seus pedidos recentes.');

    if (!orders.length) {
      embed.addFields({ name: '📭 Sem compras', value: 'Você ainda não realizou nenhuma compra.', inline: false });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    orders.slice(0, 5).forEach(order => {
      const items = (order.produtos || []).map(item => `${item.nome} (${item.quantidade}x)`).join(', ') || 'Nenhum item';
      embed.addFields({
        name: `${order.id} • ${formatStatus(order.status)}`,
        value: `💰 R$ ${Number(order.total || 0).toFixed(2)}\n📦 ${items}`,
        inline: false
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
