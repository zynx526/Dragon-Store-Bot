const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');
const ConfigManager = require('../utils/configManager');

function buildComprasPanel() {
  const orders = ConfigManager.loadOrders();
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Compras')
    .setDescription('🛒 Carrinhos e pedidos do usuário')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  if (!orders.length) {
    embed.addFields({ name: '📭 Nenhum pedido', value: 'Ainda não há pedidos registrados.', inline: false });
    return { embeds: [embed], components: [] };
  }

  const recent = orders.slice(-5).reverse();
  recent.forEach(order => {
    embed.addFields({
      name: `🧾 Pedido #${order.id}`,
      value: `👤 Usuário: <@${order.userId}>\n📦 Produto: ${order.produtoNome}\n📊 Quantidade: ${order.quantidade}\n💰 Total: R$ ${Number(order.total).toFixed(2)}\n📌 Status: ${order.status}`,
      inline: false
    });
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('view_orders').setLabel('Ver pedidos').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('cancel_pending').setLabel('Cancelar pendente').setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

module.exports = { buildComprasPanel };
