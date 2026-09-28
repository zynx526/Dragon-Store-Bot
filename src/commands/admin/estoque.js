const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isAdmin } = require('../../utils/roleCheck');
const { addProduct, removeProduct, updateProduct, getProducts, getProductByName } = require('../../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('produto')
    .setDescription('Gerenciar produtos da Dragon Store')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand.setName('adicionar')
        .setDescription('Adicionar um produto')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria do produto').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
        .addStringOption(option => option.setName('nome').setDescription('Nome do produto').setRequired(true))
        .addNumberOption(option => option.setName('preco').setDescription('Preço do produto').setRequired(true))
        .addIntegerOption(option => option.setName('estoque').setDescription('Quantidade inicial em estoque').setRequired(true))
        .addStringOption(option => option.setName('descricao').setDescription('Descrição do produto').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('remover')
        .setDescription('Remover um produto')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria do produto').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
        .addStringOption(option => option.setName('nome').setDescription('Nome do produto').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('editar')
        .setDescription('Editar um produto')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria do produto').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
        .addStringOption(option => option.setName('nome').setDescription('Nome do produto atual').setRequired(true))
        .addStringOption(option => option.setName('novo_nome').setDescription('Novo nome do produto').setRequired(false))
        .addNumberOption(option => option.setName('novo_preco').setDescription('Novo preço').setRequired(false))
        .addIntegerOption(option => option.setName('novo_estoque').setDescription('Novo estoque').setRequired(false))
        .addStringOption(option => option.setName('nova_descricao').setDescription('Nova descrição').setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('listar')
        .setDescription('Listar produtos por categoria')
        .addStringOption(option => option.setName('categoria').setDescription('Categoria do produto').setRequired(true).addChoices(
          { name: 'Contas', value: 'contas' },
          { name: 'Frutas', value: 'frutas' }
        ))
    ),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '❌ Você não tem permissão para administrar produtos.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const category = interaction.options.getString('categoria');

    if (subcommand === 'adicionar') {
      const nome = interaction.options.getString('nome');
      const preco = Number(interaction.options.getNumber('preco'));
      const estoque = Number(interaction.options.getInteger('estoque'));
      const descricao = interaction.options.getString('descricao') || 'Sem descrição';

      const result = addProduct(category, { nome, preco, estoque, descricao });
      if (!result.success) {
        return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }

      return interaction.reply({ content: `✅ Produto adicionado com sucesso em ${category}.`, ephemeral: true });
    }

    if (subcommand === 'remover') {
      const nome = interaction.options.getString('nome');
      const product = getProductByName(category, nome);
      if (!product) {
        return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });
      }
      const result = removeProduct(category, product.id);
      return interaction.reply({ content: result.success ? `✅ Produto removido: ${nome}` : '❌ Falha ao remover produto.', ephemeral: true });
    }

    if (subcommand === 'editar') {
      const nome = interaction.options.getString('nome');
      const product = getProductByName(category, nome);
      if (!product) {
        return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });
      }

      const updates = {};
      const novoNome = interaction.options.getString('novo_nome');
      const novoPreco = interaction.options.getNumber('novo_preco');
      const novoEstoque = interaction.options.getInteger('novo_estoque');
      const novaDescricao = interaction.options.getString('nova_descricao');

      if (novoNome) updates.nome = novoNome;
      if (novoPreco !== null) updates.preco = Number(novoPreco);
      if (novoEstoque !== null) updates.estoque = Number(novoEstoque);
      if (novaDescricao) updates.descricao = novaDescricao;

      const result = updateProduct(category, product.id, updates);
      return interaction.reply({ content: result.success ? `✅ Produto atualizado com sucesso.` : '❌ Não foi possível atualizar o produto.', ephemeral: true });
    }

    if (subcommand === 'listar') {
      const prods = getProducts()[category] || [];
      const embed = new EmbedBuilder()
        .setColor(0x00FFFF)
        .setTitle(`🐉 Dragon Store • ${category === 'contas' ? 'Contas' : 'Frutas'}`)
        .setDescription('Produtos cadastrados');

      if (!prods.length) {
        embed.addFields({ name: '⚠️ Lista vazia', value: 'Nenhum produto cadastrado nesta categoria.', inline: false });
      } else {
        prods.forEach(product => {
          embed.addFields({
            name: product.nome,
            value: `💰 ${Number(product.preco).toFixed(2)}\n📦 Estoque: ${product.estoque}\n📝 ${product.descricao || 'Sem descrição'}`,
            inline: false
          });
        });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
