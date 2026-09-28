const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');
const { getProducts } = require('../utils/store');

function buildHeader(title) {
  return new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle(`🐉 Dragon Store • ${title}`)
    .setDescription('Catálogo premium de contas e itens exclusivos.')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });
}

function formatProduct(product) {
  return {
    name: `📦 ${product.nome}`,
    value: `💰 R$ ${Number(product.preco).toFixed(2)}\n📊 Estoque: ${product.estoque}\n📝 ${product.descricao || 'Sem descrição'}`,
    inline: false
  };
}

function buildContasPanel() {
  const products = getProducts().contas || [];
  const embed = buildHeader('Contas Disponíveis');

  if (!products.length) {
    embed.addFields({ name: '⚠️ Estoque vazio', value: 'Nenhuma conta disponível no momento.', inline: false });
    return { embeds: [embed], components: [] };
  }

  const rows = [];
  for (let i = 0; i < products.length; i += 3) {
    const chunk = products.slice(i, i + 3);
    const row = new ActionRowBuilder();
    chunk.forEach(product => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_product:contas:${product.id}`)
          .setLabel(product.nome)
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📦')
      );
    });
    rows.push(row);
  }

  products.forEach(product => embed.addFields(formatProduct(product)));
  return { embeds: [embed], components: rows };
}

module.exports = {
  buildContasPanel,
  renderPanel: buildContasPanel
};
