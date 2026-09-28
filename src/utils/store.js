const { EmbedBuilder } = require('discord.js');
const { HEX_COLORS } = require('./colors');

function createMainEmbed(title, description = null) {
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle(title || '🐉 Dragon Store')
    .setFooter({ text: 'Dragon Store • Loja oficial', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  if (description) embed.setDescription(description);
  return embed;
}

function createSuccessEmbed(title, description) {
  return createMainEmbed(title, description).setColor(HEX_COLORS.SUCCESS);
}

function createErrorEmbed(title, description) {
  return createMainEmbed(title, description).setColor(HEX_COLORS.ERROR);
}

function createInfoEmbed(title, description) {
  return createMainEmbed(title, description).setColor(HEX_COLORS.INFO);
}

function createProductEmbed(product, category) {
  const emoji = category === 'contas' ? '📦' : '🍎';
  return createMainEmbed(`${emoji} ${product.nome}`)
    .setColor(HEX_COLORS.SECONDARY)
    .addFields(
      { name: '💰 Preço', value: `R$ ${Number(product.preco).toFixed(2)}`, inline: true },
      { name: '📊 Estoque', value: `${Number(product.estoque)} un.`, inline: true },
      { name: '🏷️ Categoria', value: category === 'contas' ? 'Contas' : 'Frutas', inline: true },
      { name: '📝 Descrição', value: product.descricao || 'Sem descrição', inline: false }
    );
}

function createOrderEmbed(order) {
  const statusEmoji = {
    pendente_pagamento: '⏳',
    aguardando_aprovacao: '🕵️',
    aprovado: '✅',
    recusado: '❌',
    entregue: '📦'
  };

  const embed = createMainEmbed(`${statusEmoji[order.status] || '🧾'} Pedido ${order.id}`, `Status: ${order.status}`)
    .setColor(order.status === 'aprovado' ? HEX_COLORS.SUCCESS : order.status === 'recusado' ? HEX_COLORS.ERROR : HEX_COLORS.PRIMARY)
    .addFields(
      { name: '👤 Usuário', value: order.usuario || 'N/A', inline: true },
      { name: '💵 Total', value: `R$ ${Number(order.total || 0).toFixed(2)}`, inline: true },
      { name: '📅 Data', value: new Date(order.data).toLocaleString('pt-BR'), inline: true },
      { name: '📦 Produtos', value: (order.produtos || []).map(item => `${item.nome} (${item.quantidade}x)`).join('\n') || 'Nenhum item', inline: false }
    );

  if (order.comprovante) {
    embed.addFields({ name: '🧾 Comprovante', value: `[Abrir comprovante](${order.comprovante})`, inline: false });
  }

  return embed;
}

module.exports = { createMainEmbed, createSuccessEmbed, createErrorEmbed, createInfoEmbed, createProductEmbed, createOrderEmbed };
