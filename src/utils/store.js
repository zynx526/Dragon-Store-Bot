const { randomUUID } = require('crypto');
const ConfigManager = require('./configManager');

function normalizeCategory(category) {
  return ['contas', 'frutas'].includes(category) ? category : null;
}

function getProducts() {
  return ConfigManager.loadProducts();
}

function getProductByName(category, name) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) return null;
  const products = getProducts()[normalizedCategory] || [];
  return products.find(product => product.nome.toLowerCase() === String(name).toLowerCase());
}

function getProductById(category, productId) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) return null;
  const products = getProducts()[normalizedCategory] || [];
  return products.find(product => product.id === productId);
}

function addProduct(category, payload) {
  const normalizedCategory = normalizeCategory(category);
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

  const products = getProducts();
  products[normalizedCategory].push(product);
  ConfigManager.saveProducts(products);
  return { success: true, product };
}

function removeProduct(category, productId) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) {
    return { success: false };
  }

  const products = getProducts();
  const list = products[normalizedCategory] || [];
  const filtered = list.filter(product => product.id !== productId);
  products[normalizedCategory] = filtered;
  ConfigManager.saveProducts(products);
  return { success: true };
}

function updateProduct(category, productId, updates) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) {
    return { success: false, message: 'Categoria inválida.' };
  }

  const products = getProducts();
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

function getCart(userId) {
  const carts = ConfigManager.loadCarts();
  return carts[userId] || { items: [] };
}

function getCartSummary(userId) {
  const cart = getCart(userId);
  const items = cart.items.map(item => {
    const product = getProductById(item.category, item.productId);
    if (!product) return null;
    const quantidade = Number(item.quantidade) || 0;
    const precoUnitario = Number(product.preco) || 0;
    const subtotal = precoUnitario * quantidade;
    return {
      productId: item.productId,
      category: item.category,
      nome: product.nome,
      quantidade,
      precoUnitario,
      subtotal
    };
  }).filter(Boolean);

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalQuantidade = items.reduce((sum, item) => sum + item.quantidade, 0);

  return { items, total, totalQuantidade, cart };
}

function addToCart(userId, category, productId, quantidade = 1) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) {
    return { success: false, message: 'Categoria inválida.' };
  }

  const product = getProductById(normalizedCategory, productId);
  if (!product) {
    return { success: false, message: 'Produto não encontrado.' };
  }

  if (Number(product.estoque) <= 0) {
    return { success: false, message: '❌ Estoque zerado. Este produto não pode ser adicionado ao carrinho.' };
  }

  const qty = Number(quantidade);
  if (!Number.isInteger(qty) || qty <= 0) {
    return { success: false, message: 'Quantidade inválida.' };
  }

  const carts = ConfigManager.loadCarts();
  const cart = carts[userId] || { items: [] };
  const existing = cart.items.find(item => item.productId === productId && item.category === normalizedCategory);
  const currentQuantity = cart.items.reduce((sum, item) => {
    if (item.productId === productId && item.category === normalizedCategory) {
      return sum + Number(item.quantidade || 0);
    }
    return sum;
  }, 0);

  const available = Number(product.estoque) - currentQuantity;
  if (qty > available) {
    return { success: false, message: `Quantidade indisponível. Restam ${available} unidade(s) em estoque.` };
  }

  if (existing) {
    existing.quantidade = Number(existing.quantidade) + qty;
  } else {
    cart.items.push({ productId, category: normalizedCategory, quantidade: qty });
  }

  carts[userId] = cart;
  ConfigManager.saveCarts(carts);
  return { success: true, cart };
}

function removeFromCart(userId, category, productId) {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) {
    return { success: false, message: 'Categoria inválida.' };
  }

  const carts = ConfigManager.loadCarts();
  const cart = carts[userId];
  if (!cart || !cart.items || !cart.items.length) {
    return { success: false, message: 'Carrinho vazio.' };
  }

  const itemIndex = cart.items.findIndex(item => item.productId === productId && item.category === normalizedCategory);
  if (itemIndex === -1) {
    return { success: false, message: 'Produto não encontrado no carrinho.' };
  }

  cart.items.splice(itemIndex, 1);
  if (!cart.items.length) {
    delete carts[userId];
  } else {
    carts[userId] = cart;
  }

  ConfigManager.saveCarts(carts);
  return { success: true, cart: carts[userId] || { items: [] } };
}

function clearCart(userId) {
  const carts = ConfigManager.loadCarts();
  delete carts[userId];
  ConfigManager.saveCarts(carts);
  return { success: true };
}

function createOrderFromCart(userId, cartOverride = null) {
  const carts = ConfigManager.loadCarts();
  const cart = cartOverride || carts[userId] || { items: [] };

  if (!cart || !cart.items || !cart.items.length) {
    return { success: false, message: 'Carrinho vazio.' };
  }

  const products = getProducts();
  const orderItems = [];
  let total = 0;

  cart.items.forEach(item => {
    const product = getProductById(item.category, item.productId);
    if (!product) return;

    const quantidade = Number(item.quantidade) || 0;
    if (quantidade <= 0) return;

    const subtotal = Number(product.preco) * quantidade;
    total += subtotal;

    orderItems.push({
      productId: item.productId,
      category: item.category,
      nome: product.nome,
      precoUnitario: Number(product.preco),
      quantidade,
      subtotal
    });

    const categoryProducts = products[item.category] || [];
    const target = categoryProducts.find(productItem => productItem.id === item.productId);
    if (target) {
      target.estoque = Math.max(0, Number(target.estoque) - quantidade);
    }
  });

  if (!orderItems.length) {
    return { success: false, message: 'Carrinho sem produtos válidos.' };
  }

  ConfigManager.saveProducts(products);

  const order = {
    id: `DR-${Date.now().toString().slice(-6)}`,
    userId,
    usuario: `<@${userId}>`,
    produtos: orderItems.map(item => ({
      id: item.productId,
      nome: item.nome,
      categoria: item.category,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.subtotal
    })),
    quantidades: orderItems.map(item => item.quantidade),
    total,
    data: new Date().toISOString(),
    status: 'pendente'
  };

  const orders = ConfigManager.loadOrders();
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
  removeFromCart,
  getCart,
  getCartSummary,
  clearCart,
  createOrderFromCart
};
