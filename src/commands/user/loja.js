const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/roleCheck');
const ConfigManager = require('../../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pedido')
    .setDescription('Gerenciar pedidos da loja')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand => subcommand.setName('listar').setDescription('Listar pedidos'))
    .addSubcommand(subcommand => subcommand.setName('ver').setDescription('Ver um pedido').addStringOption(option => option.setName('id').setDescription('ID do pedido').setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName('aprovar').setDescription('Aprovar pedido').addStringOption(option => option.setName('id').setDescription('ID do pedido').setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName('recusar').setDescription('Recusar pedido').addStringOption(option => option.setName('id').setDescription('ID do pedido').setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName('entregar').setDescription('Entregar pedido').addStringOption(option => option.setName('id').setDescription('ID do pedido').setRequired(true))),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
    }

    const orders = ConfigManager.loadOrders();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'listar') {
      const embed = new EmbedBuilder().setColor(0x00FFFF).setTitle('🧾 Pedidos');
      if (!orders.length) {
        embed.setDescription('Nenhum pedido registrado.');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      orders.slice(-10).reverse().forEach(order => {
        embed.addFields({ name: `#${order.id}`, value: `${order.produtoNome} • ${order.status} • R$ ${Number(order.total).toFixed(2)}`, inline: false });
      });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const id = interaction.options.getString('id');
    const order = orders.find(item => item.id === id);
    if (!order) {
      return interaction.reply({ content: '❌ Pedido não encontrado.', ephemeral: true });
    }

    if (subcommand === 'ver') {
      const embed = new EmbedBuilder().setColor(0x00FFFF).setTitle(`🧾 Pedido #${order.id}`).addFields(
        { name: '👤 Usuário', value: `<@${order.userId}>`, inline: true },
        { name: '📦 Produto', value: order.produtoNome, inline: true },
        { name: '📊 Quantidade', value: String(order.quantidade), inline: true },
        { name: '💰 Total', value: `R$ ${Number(order.total).toFixed(2)}`, inline: true },
        { name: '📌 Status', value: order.status, inline: true }
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'aprovar') {
      order.status = 'pagamento_aprovado';
      ConfigManager.saveOrders(orders);
      return interaction.reply({ content: `✅ Pedido #${id} aprovado.`, ephemeral: true });
    }

    if (subcommand === 'recusar') {
      order.status = 'pagamento_recusado';
      ConfigManager.saveOrders(orders);
      return interaction.reply({ content: `❌ Pedido #${id} recusado.`, ephemeral: true });
    }

    if (subcommand === 'entregar') {
      order.status = 'entregue';
      ConfigManager.saveOrders(orders);
      return interaction.reply({ content: `📦 Pedido #${id} marcado como entregue.`, ephemeral: true });
    }
  }
};
