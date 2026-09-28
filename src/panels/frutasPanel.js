const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');
const ConfigManager = require('../utils/configManager');

function buildContasPanel() {
  const products = ConfigManager.loadProducts().contas || [];
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Contas')
    .setDescription('📦 Contas disponíveis')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  if (!products.length) {
    embed.addFields({ name: '⚠️ Estoque vazio', value: 'Nenhuma conta disponível no momento.', inline: false });
    return { embeds: [embed], components: [] };
  }

  products.forEach(product => {
    embed.addFields({
      name: `📦 ${product.nome}`,
      value: `💰 R$ ${Number(product.preco).toFixed(2)}\n📊 Estoque: ${product.estoque}\n🏷️ Categoria: Contas\n📝 ${product.descricao || 'Sem descrição'}`,
      inline: false
    });
  });

  const row = new ActionRowBuilder();
  products.forEach(product => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`buy_product:contas:${product.id}`)
        .setLabel(`Comprar ${product.nome}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛒')
    );
  });

  return { embeds: [embed], components: [row] };
}

module.exports = { buildContasPanel };
