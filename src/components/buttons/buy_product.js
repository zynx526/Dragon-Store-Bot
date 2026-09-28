const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { HEX_COLORS } = require('../utils/colors');

function buildSuportePanel() {
  const embed = new EmbedBuilder()
    .setColor(HEX_COLORS.PRIMARY)
    .setTitle('🐉 Dragon Store • Suporte')
    .setDescription('Atendimento rápido e organizado para clientes e administradores.')
    .setFooter({ text: 'Dragon Store', iconURL: 'https://cdn-icons-png.flaticon.com/512/3556/3556091.png' })
    .addFields(
      { name: '🎫 Atendimento', value: 'Use o botão abaixo para abrir um ticket e falar com a equipe.', inline: false },
      { name: '📌 Prazo', value: 'Resposta em até 24 horas úteis.', inline: false },
      { name: '🧾 Dicas', value: 'Inclua o ID do pedido, o problema e prints sempre que possível.', inline: false }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('open_ticket').setLabel('Abrir atendimento').setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

module.exports = { buildSuportePanel, renderPanel: buildSuportePanel };
