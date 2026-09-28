const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');
const ConfigManager = require('../utils/configManager');

function buildFrutasPanel() {
  const products = ConfigManager.loadProducts().frutas || [];
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Frutas')
    .setDescription('🍎 Frutas disponíveis')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  if (!products.length) {
    embed.addFields({ name: '⚠️ Estoque vazio', value: 'Nenhuma fruta disponível no momento.', inline: false });
    return { embeds: [embed], components: [] };
  }

  products.forEach(product => {
    embed.addFields({
      name: `🍎 ${product.nome}`,
      value: `💰 R$ ${Number(product.preco).toFixed(2)}\n📊 Estoque: ${product.estoque}\n🏷️ Categoria: Frutas\n📝 ${product.descricao || 'Sem descrição'}`,
      inline: false
    });
  });

  const row = new ActionRowBuilder();
  products.forEach(product => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`buy_product:frutas:${product.id}`)
        .setLabel(`Comprar ${product.nome}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛒')
    );
  });

  return { embeds: [embed], components: [row] };
}

module.exports = { buildFrutasPanel };
