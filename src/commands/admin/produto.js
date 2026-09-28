const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isAdmin } = require('../../utils/roleCheck');
const ConfigManager = require('../../utils/configManager');
const { buildContasPanel } = require('../../panels/contasPanel');
const { buildFrutasPanel } = require('../../panels/frutasPanel');
const { buildComprasPanel } = require('../../panels/comprasPanel');
const { buildSuportePanel } = require('../../panels/suportePanel');

const categoryMap = {
  contas: buildContasPanel,
  frutas: buildFrutasPanel,
  compras: buildComprasPanel,
  suporte: buildSuportePanel
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Envia ou atualiza o painel de um canal específico')
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Categoria do painel')
        .setRequired(true)
        .addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' },
          { name: 'Compras', value: 'compras' },
          { name: 'Suporte', value: 'suporte' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '❌ Você não tem permissão para executar este comando.', ephemeral: true });
    }

    const category = interaction.options.getString('categoria');
    const channel = interaction.channel;
    const config = ConfigManager.loadChannelConfig();

    if (!config.channels) config.channels = {};
    if (!config.channels[category]) config.channels[category] = {};

    const panelBuilder = categoryMap[category];
    if (!panelBuilder) {
      return interaction.reply({ content: '❌ Categoria inválida.', ephemeral: true });
    }

    const payload = panelBuilder();
    const existingId = ConfigManager.getPanelMessageId(category);

    try {
      if (existingId) {
        const existingMessage = await channel.messages.fetch(existingId).catch(() => null);
        if (existingMessage) {
          await existingMessage.edit(payload);
          config.channels[category].channelId = channel.id;
          config.channels[category].panelMessageId = existingMessage.id;
          ConfigManager.saveChannelConfig(config);
          return interaction.reply({ content: `✅ Painel de ${category} atualizado no canal atual.`, ephemeral: true });
        }
      }

      const sent = await channel.send(payload);
      config.channels[category].channelId = channel.id;
      config.channels[category].panelMessageId = sent.id;
      config.channels[category].enabled = true;
      ConfigManager.saveChannelConfig(config);
      return interaction.reply({ content: `✅ Painel de ${category} enviado no canal atual.`, ephemeral: true });
    } catch (error) {
      console.error('Erro ao enviar painel:', error);
      return interaction.reply({ content: '❌ Não foi possível enviar o painel.', ephemeral: true });
    }
  }
};
