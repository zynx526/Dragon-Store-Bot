const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  id: 'open_ticket',
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('ticket_modal')
      .setTitle('Abrir atendimento');

    const assunto = new TextInputBuilder()
      .setCustomId('ticket_assunto')
      .setLabel('Assunto')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const mensagem = new TextInputBuilder()
      .setCustomId('ticket_mensagem')
      .setLabel('Descreva seu problema')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder().addComponents(assunto),
      new ActionRowBuilder().addComponents(mensagem)
    );

    await interaction.showModal(modal);
  }
};
