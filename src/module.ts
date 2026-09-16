import './styles/module.css';
import { MODULE_ID, PARTIALS, TEMPLATES } from './constants';
import { registerCatalogSettings } from './catalog/loadCatalog';
import { registerShopMenu } from './settings';
import { registerChatCardListeners } from './chat/sorteioChatCard';

Hooks.once('init', async () => {
  console.log(`${MODULE_ID} | Initializing`);

  registerCatalogSettings();
  registerShopMenu();

  await foundry.applications.handlebars.loadTemplates({
    [PARTIALS.itemCard]: TEMPLATES.itemCard,
    [PARTIALS.sorteioConfig]: TEMPLATES.sorteioConfig,
    [PARTIALS.sorteioReview]: TEMPLATES.sorteioReview,
  });
});

Hooks.once('ready', () => {
  console.log(`${MODULE_ID} | Ready`);
  registerChatCardListeners();
});
