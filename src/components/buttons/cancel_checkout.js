const { EmbedBuilder } = require('discord.js');

module.exports = {
  id: 'cancel_checkout',
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xFF4D6D)
      .setTitle('⚠️ Compra cancelada')
      .setDescription('Nenhum pedido foi gerado. Você pode continuar comprando quando quiser.');

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
