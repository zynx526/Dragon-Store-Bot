const { renderPanel } = require('../../panels/contasPanel');

module.exports = {
  id: 'store_category',
  async execute(interaction) {
    const category = interaction.values[0];
    const panel = category === 'contas'
      ? require('../../panels/contasPanel').renderPanel('contas', interaction)
      : require('../../panels/frutasPanel').renderPanel('frutas', interaction);

    const payload = await panel;
    return interaction.update(payload);
  }
};

path="src/components/selects/store_category.js"},
{