const { buildContasPanel } = require('../../panels/contasPanel');
const { buildFrutasPanel } = require('../../panels/frutasPanel');

module.exports = {
  id: 'store_category',
  async execute(interaction) {
    const category = interaction.values[0];
    const payload = category === 'contas' ? buildContasPanel() : buildFrutasPanel();
    return interaction.update(payload);
  }
};
