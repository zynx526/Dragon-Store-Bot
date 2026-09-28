const { PermissionFlagsBits } = require('discord.js');

function isAdmin(interaction) {
  if (!interaction.member) return false;
  return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
}

function isOwner(interaction) {
  const ownerId = process.env.OWNER_ID;
  if (!ownerId) return false;
  return interaction.user.id === ownerId;
}

module.exports = { isAdmin, isOwner };
