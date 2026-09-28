const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');
const ConfigManager = require('../utils/configManager');

function buildHeader(title) {
  return new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle(`🐉 Dragon Store • ${title}`)
    .setDescription('Loja oficial de contas e frutas de Blox Fruits')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });
}

function formatProduct(product) {
  return {
    name: `🍎 ${product.nome}`,
    value: `💰 R$ ${Number(product.preco).toFixed(2)}\n📊 Estoque: ${product.estoque}\n📝 ${product.descricao || 'Sem descrição'}`,
    inline: false
  };
}

async function renderPanel(category, interactionOrChannel) {
  const products = ConfigManager.loadProducts();
  const current = products[category] || [];

  const embed = buildHeader('Frutas Disponíveis');

  if (!current.length) {
    embed.addFields({ name: '⚠️ Estoque vazio', value: 'Nenhuma fruta disponível no momento.', inline: false });
    return { embeds: [embed], components: [] };
  }

  const rows = [];
  for (let i = 0; i < current.length; i += 3) {
    const chunk = current.slice(i, i + 3);
    const row = new ActionRowBuilder();
    chunk.forEach(product => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_product:${category}:${product.id}`)
          .setLabel(product.nome)
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🍎')
      );
    });
    rows.push(row);
  }

  current.forEach(product => {
    embed.addFields(formatProduct(product));
  });

  return { embeds: [embed], components: rows };
}

module.exports = {
  buildFrutasPanel: renderPanel,
  renderPanel
};

path="src/panels/frutasPanel.js"},
{