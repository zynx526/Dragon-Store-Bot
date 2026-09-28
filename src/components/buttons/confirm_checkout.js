const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getCartSummary } = require('../../utils/store');

module.exports = {
  id: 'cart_checkout',
  async execute(interaction) {
    const summary = getCartSummary(interaction.user.id);
    if (!summary.items.length) {
      return interaction.reply({ content: '❌ Seu carrinho está vazio.', ephemeral: true });
    }

    const pixKey = process.env.PIX_KEY || 'PIX não configurado';
    const embed = new EmbedBuilder()
      .setColor(0xFFCC00)
      .setTitle('💳 Confirmação de compra')
      .setDescription('Antes de concluir, confirme a compra abaixo.')
      .addFields(
        { name: '🧺 Carrinho', value: summary.items.map(item => `${item.nome} (${item.quantidade}x)`).join('\n') || 'Nenhum item', inline: false },
        { name: '💵 Total', value: `R$ ${Number(summary.total).toFixed(2)}`, inline: true },
        { name: '💸 Chave Pix', value: pixKey, inline: true },
        { name: '📌 Próximo passo', value: 'Ao confirmar, o pedido será criado e ficará pendente de pagamento e aprovação.', inline: false }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_checkout:${interaction.user.id}`).setLabel('Confirmar compra').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`cancel_checkout:${interaction.user.id}`).setLabel('Cancelar').setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
