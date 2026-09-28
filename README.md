# Dragon-Store-Bot

## Estrutura inicial de canais

O projeto foi preparado para trabalhar com painéis separados por canal:

- **📦 Contas** — exibe somente produtos da categoria Contas.
- **🍎 Frutas** — exibe somente produtos da categoria Frutas.
- **🛒 Compras** — reservado para carrinhos e pedidos.
- **🆘 Suporte** — reservado para o sistema de atendimento.

## Comando administrativo planejado

```text
/painel contas
/painel frutas
/painel compras
/painel suporte
```

Cada subcomando deverá enviar o painel correspondente no canal atual. A configuração reserva `channelId` e `panelMessageId` para permitir a atualização ou recriação do painel sem duplicações.

## Estrutura

```text
src/
├── commands/
│   ├── admin/painel.js
│   └── user/loja.js
├── config/channels.json
├── database/products.json
├── panels/
│   ├── contasPanel.js
│   ├── frutasPanel.js
│   ├── comprasPanel.js
│   ├── suportePanel.js
│   └── panelManager.js
├── utils/
│   ├── configManager.js
│   └── roleCheck.js
└── index.js
```

Esta etapa contém apenas a estrutura do projeto; a implementação completa dos comandos, produtos, compras e atendimento será feita posteriormente.
