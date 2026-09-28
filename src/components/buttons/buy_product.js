const { randomUUID } = require('crypto');
const ConfigManager = require('./configManager');

function getProducts() {
  return ConfigManager.loadProducts();
}

function getProductByName(category, name) {
  const products = getProducts()[category] || [];
  return products.find(product => product.nome.toLowerCase() === String(name).toLowerCase());
}

function getProductById(category, productId) {
  const products = getProducts()[category] || [];
  return products.find(product => product.id === productId);
}

function addProduct(category, payload) {
  const products = getProducts();
  const normalizedCategory = ['contas', 'frutas'].includes(category) ? category : null;
  if (!normalizedCategory) {
    return { success: false, message: 'Categoria inválida.' };
  }

  if (!payload || !payload.nome || !payload.preco || !Number.isFinite(Number(payload.preco)) || Number(payload.preco) < 0) {
    return { success: false, message: 'Dados do produto inválidos.' };
  }

  if (!payload.estoque || Number(payload.estoque) < 0) {
    return { success: false, message: 'Estoque inválido.' };
  }

  const existing = getProductByName(normalizedCategory, payload.nome);
  if (existing) {
    return { success: false, message: 'Produto já existe nesta categoria.' };
  }

  const product = {
    id: randomUUID(),
    nome: String(payload.nome).trim(),
    preco: Number(payload.preco),
    estoque: Number(payload.estoque),
    descricao: payload.descricao ? String(payload.descricao).trim() : 'Sem descrição',
    categoria: normalizedCategory
  };

  products[normalizedCategory].push(product);
  ConfigManager.saveProducts(products);
  return { success: true, product };
}

function removeProduct(category, productId) {
  const products = getProducts();
  const normalizedCategory = ['contas', 'frutas'].includes(category) ? category : null;
  if (!normalizedCategory) {
    return { success: false };
  }

  const list = products[normalizedCategory] || [];
  const filtered = list.filter(product => product.id !== productId);
  products[normalizedCategory] = filtered;
  ConfigManager.saveProducts(products);
  return { success: true };
}

function updateProduct(category, productId, updates) {
  const products = getProducts();
  const normalizedCategory = ['contas', 'frutas'].includes(category) ? category : null;
  if (!normalizedCategory) {
    return { success: false, message: 'Categoria inválida.' };
  }

  const product = (products[normalizedCategory] || []).find(item => item.id === productId);
  if (!product) {
    return { success: false, message: 'Produto não encontrado.' };
  }

  if (updates.nome) product.nome = String(updates.nome).trim();
  if (updates.preco !== undefined) product.preco = Number(updates.preco);
  if (updates.estoque !== undefined) product.estoque = Number(updates.estoque);
  if (updates.descricao !== undefined) product.descricao = String(updates.descricao).trim();

  ConfigManager.saveProducts(products);
  return { success: true, product };
}

function addToCart(userId, category, productId, quantidade = 1) {
  const carts = ConfigManager.loadCarts();
  const cart = carts[userId] || { items: [] };
  const product = getProductById(category, productId);
  if (!product) {
    return { success: false, message: 'Produto não encontrado.' };
  }

  const qty = Number(quantidade);
  if (!Number.isInteger(qty) || qty <= 0) {
    return { success: false, message: 'Quantidade inválida.' };
  }

  const existing = cart.items.find(item => item.productId === productId && item.category === category);
  if (existing) {
    existing.quantidade += qty;
  } else {
    cart.items.push({ productId, category, quantidade: qty });
  }

  if (product.estoque < cart.items.reduce((sum, item) => {
    if (item.productId === productId && item.category === category) return sum + item.quantidade;
    return sum;
  }, 0)) {
    return { success: false, message: 'Estoque insuficiente.' };
  }

  carts[userId] = cart;
  ConfigManager.saveCarts(carts);
  return { success: true, cart };
}

function getCart(userId) {
  const carts = ConfigManager.loadCarts();
  return carts[userId] || { items: [] };
}

function clearCart(userId) {
  const carts = ConfigManager.loadCarts();
  delete carts[userId];
  ConfigManager.saveCarts(carts);
}

function createOrderFromCart(userId, cart) {
  const orders = ConfigManager.loadOrders();
  const createdAt = new Date();
  let total = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = getProductById(item.category, item.productId);
    if (!product) continue;
    const subtotal = Number(product.preco) * Number(item.quantidade);
    total += subtotal;
    orderItems.push({
      productId: item.productId,
      category: item.category,
      nome: product.nome,
      precoUnitario: product.preco,
      quantidade: item.quantidade,
      subtotal
    });
  }

  if (!orderItems.length) {
    return { success: false, message: 'Carrinho vazio.' };
  }

  const order = {
    id: `DR-${Date.now().toString().slice(-6)}`,
    userId,
    data: createdAt.toISOString(),
    status: 'pendente',
    total,
    items: orderItems,
    produtoNome: orderItems[0].nome,
    quantidade: orderItems.reduce((sum, item) => sum + item.quantidade, 0),
    produtoCategoria: orderItems[0].category
  };

  orders.push(order);
  ConfigManager.saveOrders(orders);
  clearCart(userId);
  return { success: true, order };
}

module.exports = {
  getProducts,
  getProductByName,
  getProductById,
  addProduct,
  removeProduct,
  updateProduct,
  addToCart,
  getCart,
  clearCart,
  createOrderFromCart
};
