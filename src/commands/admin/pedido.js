const { randomUUID } = require('crypto');
const ConfigManager = require('./configManager');

const ORDER_STATUSES = new Set([
  'pendente_pagamento',
  'aguardando_aprovacao',
  'aprovado',
  'recusado',
  'entregue'
]);

function normalizeCategory(category) {
  return ['contas', 'frutas'].includes(category) ? category : null;
}

function getProducts() {
  const products = ConfigManager.loadProducts();
  if (!products.contas) products.contas = [];
  if (!products.frutas) products.frutas = [];
  return products;
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

  if (!payload || !payload.nome || payload.preco === undefined || !Number.isFinite(Number(payload.preco)) || Number(payload.preco) < 0) {
    return { success: false, message: 'Dados do produto inválidos.' };
  }

  if (payload.estoque === undefined || Number(payload.estoque) < 0) {
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
    return { success: false, message: 'Categoria inválida.' };
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
  const items = (cart.items || []).map(item => {
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

function getAllOrders() {
  const orders = ConfigManager.loadOrders();
  return Array.isArray(orders) ? orders : [];
}

function getOrderById(orderId) {
  return getAllOrders().find(order => order.id === orderId) || null;
}

function addOrderHistoryEntry(order, status, metadata = {}) {
  if (!Array.isArray(order.historico)) {
    order.historico = [];
  }

  order.historico.push({
    status,
    data: new Date().toISOString(),
    ...metadata
  });
}

function applyStockReduction(order) {
  if (!order || order.estoqueProcessado) return;

  const products = getProducts();
  for (const item of order.produtos || []) {
    const category = item.categoria;
    const targetList = products[category] || [];
    const target = targetList.find(product => product.id === item.id);
    if (!target) continue;
    target.estoque = Math.max(0, Number(target.estoque) - Number(item.quantidade));
  }

  ConfigManager.saveProducts(products);
  order.estoqueProcessado = true;
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

  for (const item of cart.items) {
    const product = getProductById(item.category, item.productId);
    if (!product) continue;

    const quantidade = Number(item.quantidade) || 0;
    if (quantidade <= 0) continue;

    const subtotal = Number(product.preco) * quantidade;
    total += subtotal;

    orderItems.push({
      id: item.productId,
      categoria: item.category,
      nome: product.nome,
      precoUnitario: Number(product.preco),
      quantidade,
      subtotal
    });
  }

  if (!orderItems.length) {
    return { success: false, message: 'Carrinho sem produtos válidos.' };
  }

  const order = {
    id: `DR-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
    userId,
    usuario: `<@${userId}>`,
    produtos: orderItems.map(item => ({
      id: item.id,
      nome: item.nome,
      categoria: item.categoria,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.subtotal
    })),
    quantidades: orderItems.map(item => item.quantidade),
    total,
    data: new Date().toISOString(),
    status: 'pendente_pagamento',
    pagamento: {
      metodo: 'pix',
      chave: process.env.PIX_KEY || null,
      observacao: 'Pagamento manual em Pix'
    },
    comprovante: null,
    historico: [{ status: 'pendente_pagamento', data: new Date().toISOString() }],
    estoqueProcessado: false,
    atualizadoEm: new Date().toISOString()
  };

  const orders = getAllOrders();
  orders.push(order);
  ConfigManager.saveOrders(orders);
  clearCart(userId);

  return { success: true, order };
}

function setOrderPaymentProof(orderId, proofUrl, metadata = {}) {
  const orders = getAllOrders();
  const order = orders.find(item => item.id === orderId);
  if (!order) {
    return { success: false, message: 'Pedido não encontrado.' };
  }

  if (!proofUrl || !String(proofUrl).trim()) {
    return { success: false, message: 'Link do comprovante inválido.' };
  }

  order.comprovante = String(proofUrl).trim();
  order.status = 'aguardando_aprovacao';
  order.atualizadoEm = new Date().toISOString();
  addOrderHistoryEntry(order, 'aguardando_aprovacao', metadata);
  ConfigManager.saveOrders(orders);
  return { success: true, order };
}

function updateOrderStatus(orderId, nextStatus, metadata = {}) {
  if (!ORDER_STATUSES.has(nextStatus)) {
    return { success: false, message: 'Status inválido.' };
  }

  const orders = getAllOrders();
  const order = orders.find(item => item.id === orderId);
  if (!order) {
    return { success: false, message: 'Pedido não encontrado.' };
  }

  order.status = nextStatus;
  order.atualizadoEm = new Date().toISOString();
  addOrderHistoryEntry(order, nextStatus, metadata);

  if (nextStatus === 'aprovado') {
    applyStockReduction(order);
    order.aprovadoEm = new Date().toISOString();
    if (metadata.adminId) {
      order.aprovadoPor = metadata.adminId;
    }
  }

  if (nextStatus === 'recusado') {
    order.recusadoEm = new Date().toISOString();
    if (metadata.adminId) {
      order.recusadoPor = metadata.adminId;
    }
    if (metadata.motivo) {
      order.motivoRecusa = metadata.motivo;
    }
  }

  if (nextStatus === 'entregue') {
    order.entregueEm = new Date().toISOString();
    if (metadata.adminId) {
      order.entreguePor = metadata.adminId;
    }
  }

  ConfigManager.saveOrders(orders);
  return { success: true, order };
}

function getOrdersByUser(userId) {
  return getAllOrders().filter(order => order.userId === userId);
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
  createOrderFromCart,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  setOrderPaymentProof,
  updateOrderStatus,
  ORDER_STATUSES
};
