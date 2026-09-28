const { EmbedBuilder } = require('discord.js');

module.exports = {
  id: 'confirm_checkout_modal',
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00FF9D)
      .setTitle('✅ Confirmação registrada')
      .setDescription('Sua compra foi confirmada e o pedido foi criado.');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
