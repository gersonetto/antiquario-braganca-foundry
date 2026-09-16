export const MODULE_ID = 'antiquario-braganca';

export const SETTINGS = {
  catalogApiUrl: 'catalogApiUrl',
  catalogCache: 'catalogCache',
} as const;

export const TEMPLATES = {
  shopToolbar: `modules/${MODULE_ID}/templates/shop-toolbar.hbs`,
  shopResults: `modules/${MODULE_ID}/templates/shop-results.hbs`,
  itemCard: `modules/${MODULE_ID}/templates/partials/item-card.hbs`,
  modification: `modules/${MODULE_ID}/templates/modification-dialog.hbs`,
  sorteioApp: `modules/${MODULE_ID}/templates/sorteio/sorteio-app.hbs`,
  sorteioConfig: `modules/${MODULE_ID}/templates/sorteio/sorteio-config.hbs`,
  sorteioReview: `modules/${MODULE_ID}/templates/sorteio/sorteio-review.hbs`,
  chatCard: `modules/${MODULE_ID}/templates/chat/sorteio-chat-card.hbs`,
  modificationChatCard: `modules/${MODULE_ID}/templates/chat/modification-chat-card.hbs`,
} as const;

// Nomes de partial registrados via loadTemplates() no hook 'init' (ver src/module.ts).
export const PARTIALS = {
  itemCard: 'antiquario-braganca-item-card',
  sorteioConfig: 'antiquario-braganca-sorteio-config',
  sorteioReview: 'antiquario-braganca-sorteio-review',
} as const;
