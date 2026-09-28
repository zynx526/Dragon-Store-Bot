const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');

function buildSuportePanel() {
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Suporte')
    .setDescription('🆘 Sistema de atendimento')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' });

  embed.addFields(
    { name: '🎫 Atendimento', value: 'Use o botão abaixo para abrir um ticket.', inline: false },
    { name: '📌 Informações', value: 'A equipe responderá em até 24h.', inline: false }
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('open_ticket').setLabel('Abrir atendimento').setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

module.exports = { buildSuportePanel };
