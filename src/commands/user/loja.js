const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/roleCheck');
const { getAllOrders, getOrderById, updateOrderStatus } = require('../../utils/store');

function formatStatus(status) {
  const labels = {
    pendente_pagamento: '⏳ Pendente de pagamento',
    aguardando_aprovacao: '🕵️ Aguardando aprovação',
    aprovado: '✅ Aprovado',
    recusado: '❌ Recusado',
    entregue: '📦 Entregue'
  };

  return labels[status] || status;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido')
    .setDescription('Gerenciar pedidos da Dragon Store')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand.setName('listar')
        .setDescription('Listar todos os pedidos pendentes e concluídos')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('ver')
        .setDescription('Visualizar detalhes de um pedido')
        .addStringOption(option => option.setName('pedido_id').setDescription('ID do pedido').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('aprovar')
        .setDescription('Aprovar um pedido após o pagamento')
        .addStringOption(option => option.setName('pedido_id').setDescription('ID do pedido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo opcional').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('recusar')
        .setDescription('Recusar um pedido')
        .addStringOption(option => option.setName('pedido_id').setDescription('ID do pedido').setRequired(true))
        .addStringOption(option => option.setName('motivo').setDescription('Motivo da recusa').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('entregar')
        .setDescription('Marcar pedido como entregue')
        .addStringOption(option => option.setName('pedido_id').setDescription('ID do pedido').setRequired(true))
    ),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '❌ Você não tem permissão para gerenciar pedidos.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'listar') {
      const orders = getAllOrders().slice().reverse();
      const embed = new EmbedBuilder()
        .setColor(0x00FFFF)
        .setTitle('🛒 Pedidos da Dragon Store')
        .setDescription('Últimos pedidos registrados no sistema.');

      if (!orders.length) {
        embed.addFields({ name: '📭 Sem pedidos', value: 'Ainda não há pedidos no sistema.', inline: false });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const list = orders.slice(0, 5).map(order => {
        const total = Number(order.total || 0).toFixed(2);
        return `• ${order.id} | ${formatStatus(order.status)} | ${order.usuario} | R$ ${total}`;
      }).join('\n');

      embed.addFields({ name: '📋 Pedidos recentes', value: list || 'Nenhum pedido', inline: false });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'ver') {
      const orderId = interaction.options.getString('pedido_id');
      const order = getOrderById(orderId);
      if (!order) {
        return interaction.reply({ content: '❌ Pedido não encontrado.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`🧾 Pedido ${order.id}`)
        .setDescription(`Status: ${formatStatus(order.status)}`)
        .addFields(
          { name: '👤 Usuário', value: order.usuario || 'N/A', inline: true },
          { name: '💵 Total', value: `R$ ${Number(order.total || 0).toFixed(2)}`, inline: true },
          { name: '📅 Data', value: new Date(order.data).toLocaleString('pt-BR'), inline: true },
          { name: '📦 Produtos', value: (order.produtos || []).map(item => `${item.nome} (${item.quantidade}x)`).join('\n') || 'Nenhum item', inline: false }
        );

      if (order.comprovante) {
        embed.addFields({ name: '🧾 Comprovante', value: `[Abrir comprovante](${order.comprovante})`, inline: false });
      }

      if (order.pagamento && order.pagamento.chave) {
        embed.addFields({ name: '💸 Pix', value: order.pagamento.chave, inline: false });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const orderId = interaction.options.getString('pedido_id');
    const order = getOrderById(orderId);
    if (!order) {
      return interaction.reply({ content: '❌ Pedido não encontrado.', ephemeral: true });
    }

    if (subcommand === 'aprovar') {
      const motivo = interaction.options.getString('motivo') || 'Pagamento confirmado.';
      const result = updateOrderStatus(orderId, 'aprovado', { adminId: interaction.user.id, motivo });
      return interaction.reply({
        content: result.success ? `✅ Pedido ${orderId} aprovado com sucesso.` : `❌ ${result.message}`,
        ephemeral: true
      });
    }

    if (subcommand === 'recusar') {
      const motivo = interaction.options.getString('motivo') || 'Pagamento não foi confirmado.';
      const result = updateOrderStatus(orderId, 'recusado', { adminId: interaction.user.id, motivo });
      return interaction.reply({
        content: result.success ? `✅ Pedido ${orderId} recusado.` : `❌ ${result.message}`,
        ephemeral: true
      });
    }

    if (subcommand === 'entregar') {
      const result = updateOrderStatus(orderId, 'entregue', { adminId: interaction.user.id });
      return interaction.reply({
        content: result.success ? `✅ Pedido ${orderId} marcado como entregue.` : `❌ ${result.message}`,
        ephemeral: true
      });
    }

    return interaction.reply({ content: '❌ Subcomando inválido.', ephemeral: true });
  }
};
