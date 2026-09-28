const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/channels.json');
const PRODUCTS_PATH = path.join(__dirname, '../database/products.json');
const ORDERS_PATH = path.join(__dirname, '../database/orders.json');
const CARTS_PATH = path.join(__dirname, '../database/carts.json');
const INVENTORY_PATH = path.join(__dirname, '../database/inventory.json');

class ConfigManager {
  static ensureDirectories() {
    const dirs = [
      path.join(__dirname, '../config'),
      path.join(__dirname, '../database')
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  static loadChannelConfig() {
    try {
      if (!fs.existsSync(CONFIG_PATH)) {
        return { channels: {} };
      }
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao carregar config:', error.message);
      return { channels: {} };
    }
  }

  static saveChannelConfig(config) {
    try {
      this.ensureDirectories();
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar config:', error.message);
      return false;
    }
  }

  static loadProducts() {
    try {
      if (!fs.existsSync(PRODUCTS_PATH)) {
        const defaultProducts = { contas: [], frutas: [] };
        this.saveProducts(defaultProducts);
        return defaultProducts;
      }
      const data = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error.message);
      return { contas: [], frutas: [] };
    }
  }

  static saveProducts(products) {
    try {
      this.ensureDirectories();
      fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar produtos:', error.message);
      return false;
    }
  }

  static loadOrders() {
    try {
      if (!fs.existsSync(ORDERS_PATH)) {
        return [];
      }
      const data = fs.readFileSync(ORDERS_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error.message);
      return [];
    }
  }

  static saveOrders(orders) {
    try {
      this.ensureDirectories();
      fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar pedidos:', error.message);
      return false;
    }
  }

  static loadCarts() {
    try {
      if (!fs.existsSync(CARTS_PATH)) {
        return {};
      }
      const data = fs.readFileSync(CARTS_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao carregar carrinhos:', error.message);
      return {};
    }
  }

  static saveCarts(carts) {
    try {
      this.ensureDirectories();
      fs.writeFileSync(CARTS_PATH, JSON.stringify(carts, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar carrinhos:', error.message);
      return false;
    }
  }

  static loadInventory() {
    try {
      if (!fs.existsSync(INVENTORY_PATH)) {
        return {};
      }
      const data = fs.readFileSync(INVENTORY_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao carregar inventário:', error.message);
      return {};
    }
  }

  static saveInventory(inventory) {
    try {
      this.ensureDirectories();
      fs.writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar inventário:', error.message);
      return false;
    }
  }

  static getChannelId(category) {
    const config = this.loadChannelConfig();
    return config.channels?.[category]?.channelId || null;
  }

  static setChannelId(category, channelId) {
    const config = this.loadChannelConfig();
    if (!config.channels) config.channels = {};
    if (!config.channels[category]) config.channels[category] = {};
    config.channels[category].channelId = channelId;
    config.channels[category].enabled = true;
    return this.saveChannelConfig(config);
  }

  static getPanelMessageId(category) {
    const config = this.loadChannelConfig();
    return config.channels?.[category]?.panelMessageId || null;
  }

  static setPanelMessageId(category, messageId) {
    const config = this.loadChannelConfig();
    if (!config.channels) config.channels = {};
    if (!config.channels[category]) config.channels[category] = {};
    config.channels[category].panelMessageId = messageId;
    return this.saveChannelConfig(config);
  }
}

module.exports = ConfigManager;
