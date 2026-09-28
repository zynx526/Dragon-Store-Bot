const { ChannelType, PermissionOverwriteFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
  id: 'open_ticket',
  async execute(interaction) {
    const guild = interaction.guild;
    const channelName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
      ]
    });

    await channel.send(`🎫 Ticket criado para ${interaction.user}... A equipe de suporte entrará em contato.`);
    return interaction.reply({ content: `✅ Seu ticket foi criado: ${channel}`, ephemeral: true });
  }
};
