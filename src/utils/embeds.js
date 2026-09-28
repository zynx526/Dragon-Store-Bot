const { EmbedBuilder } = require('discord.js');
const { HEX_COLORS } = require('./colors');

function createMainEmbed() {
  return new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setFooter({ text: '🐉 Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });
}

function createProductEmbed(product, category) {
  const emoji = category === 'contas' ? '📦' : '🍎';
  return createMainEmbed()
    .addFields(
      { name: `${emoji} ${product.nome}`, value: '** **', inline: false },
      { name: '💰 Preço', value: `R$ ${product.preco.toFixed(2)}`, inline: true },
      { name: '📊 Estoque', value: `${product.estoque} un.`, inline: true },
      { name: '🏷️ Categoria', value: category.charAt(0).toUpperCase() + category.slice(1), inline: true },
      { name: '📝 Descrição', value: product.descricao || 'Sem descrição', inline: false }
    );
}

function createOrderEmbed(order) {
  const statusEmoji = {
    'pendente': '⏳',
    'aguardando_pagamento': '💳',
    'comprovante_enviado': '📸',
    'pagamento_aprovado': '✅',
    'pagamento_recusado': '❌',
    'entregue': '📦',
    'cancelado': '🚫'
  };

  const embed = createMainEmbed()
    .setTitle(`${statusEmoji[order.status] || '❓'} Pedido #${order.id}`)
    .addFields(
      { name: '🛍️ Produto', value: order.produtoNome || 'Desconhecido', inline: true },
      { name: '📊 Quantidade', value: String(order.quantidade), inline: true },
      { name: '💰 Total', value: `R$ ${order.total.toFixed(2)}`, inline: true },
      { name: '⏰ Data', value: new Date(order.data).toLocaleString('pt-BR'), inline: false },
      { name: '📌 Status', value: order.status.toUpperCase().replace(/_/g, ' '), inline: false }
    );

  return embed;
}

module.exports = { createMainEmbed, createProductEmbed, createOrderEmbed };
