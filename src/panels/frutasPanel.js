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

function formatProduct(product, category) {
  const emoji = category === 'contas' ? '📦' : '🍎';
  return {
    name: `${emoji} ${product.nome}`,
    value: `💰 R$ ${Number(product.preco).toFixed(2)}\n📊 Estoque: ${product.estoque}\n📝 ${product.descricao || 'Sem descrição'}`,
    inline: false
  };
}

async function renderPanel(category, interactionOrChannel) {
  const products = ConfigManager.loadProducts();
  const current = products[category] || [];

  const embed = buildHeader(category === 'contas' ? 'Contas Disponíveis' : 'Frutas Disponíveis');

  if (!current.length) {
    embed.addFields({ name: '⚠️ Estoque vazio', value: `Nenhum item encontrado na categoria ${category}.`, inline: false });
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
          .setEmoji(category === 'contas' ? '📦' : '🍎')
      );
    });
    rows.push(row);
  }

  current.forEach(product => {
    embed.addFields(formatProduct(product, category));
  });

  return { embeds: [embed], components: rows };
}

async function ensureChannelConfig(category, channelId) {
  ConfigManager.setChannelId(category, channelId);
}

async function sendOrUpdatePanel(category, channel, messageId) {
  const payload = await renderPanel(category, channel);

  if (messageId) {
    const existingMessage = await channel.messages.fetch(messageId).catch(() => null);
    if (existingMessage) {
      await existingMessage.edit(payload);
      return existingMessage.id;
    }
  }

  const sent = await channel.send(payload);
  const id = sent.id;
  ConfigManager.setPanelMessageId(category, id);
  return id;
}

module.exports = {
  buildContasPanel: renderPanel,
  renderPanel,
  sendOrUpdatePanel,
  ensureChannelConfig
};

path="src/panels/contasPanel.js"},
{