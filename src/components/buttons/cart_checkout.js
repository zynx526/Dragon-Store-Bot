const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getOrderById, setOrderPaymentProof } = require('../../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comprovante')
    .setDescription('Enviar o comprovante de pagamento Pix do pedido')
    .addStringOption(option =>
      option.setName('pedido_id')
        .setDescription('ID do pedido')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Link do comprovante ou imagem do pagamento')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('observacao')
        .setDescription('Observação opcional')
        .setRequired(false)
    ),

  async execute(interaction) {
    const orderId = interaction.options.getString('pedido_id');
    const proofUrl = interaction.options.getString('link');
    const order = getOrderById(orderId);

    if (!order) {
      return interaction.reply({ content: '❌ Pedido não encontrado.', ephemeral: true });
    }

    if (order.userId !== interaction.user.id) {
      return interaction.reply({ content: '❌ Este pedido pertence a outro usuário.', ephemeral: true });
    }

    const result = setOrderPaymentProof(orderId, proofUrl, {
      userId: interaction.user.id,
      observacao: interaction.options.getString('observacao') || ''
    });

    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
    }

    await interaction.reply({
      content: `✅ Comprovante enviado com sucesso para o pedido ${orderId}. Aguardando aprovação do administrador.`,
      ephemeral: true
    });
  }
};
