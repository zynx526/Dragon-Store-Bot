const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../../utils/colors');
const { getProducts } = require('../../utils/store');

function buildComprasPanel() {
  const products = getProducts().frutas || [];
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Compras')
    .setDescription('🛒 Carrinho, pedidos e checkout.')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  if (!products.length) {
    embed.addFields({ name: '⚠️ Estoque vazio', value: 'Nenhuma fruta disponível no momento.', inline: false });
    return { embeds: [embed], components: [] };
  }

  products.forEach(product => {
    embed.addFields({
      name: `🍎 ${product.nome}`,
      value: `💰 R$ ${Number(product.preco).toFixed(2)}\n📊 Estoque: ${product.estoque}\n📝 ${product.descricao || 'Sem descrição'}`,
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

module.exports = { buildComprasPanel, buildFrutasPanel: buildComprasPanel };
