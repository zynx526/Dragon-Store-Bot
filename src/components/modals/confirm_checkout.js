const { EmbedBuilder } = require('discord.js');

module.exports = {
  id: 'ticket_modal',
  async execute(interaction) {
    const assunto = interaction.fields.getTextInputValue('ticket_assunto');
    const mensagem = interaction.fields.getTextInputValue('ticket_mensagem');

    const embed = new EmbedBuilder()
      .setColor(0x4CC9F0)
      .setTitle('🎫 Novo ticket de suporte')
      .setDescription('Um cliente abriu um ticket de atendimento.')
      .addFields(
        { name: '👤 Usuário', value: `<@${interaction.user.id}>`, inline: true },
        { name: '🧾 Assunto', value: assunto || 'Sem assunto', inline: false },
        { name: '💬 Mensagem', value: mensagem || 'Sem mensagem', inline: false }
      );

    await interaction.reply({ content: '✅ Ticket enviado com sucesso. Nossa equipe irá responder em breve.', ephemeral: true });
    await interaction.channel.send({ embeds: [embed] }).catch(() => {});
  }
};
