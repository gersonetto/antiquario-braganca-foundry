import { MODULE_ID } from './constants';
import { ShopApplication } from './apps/ShopApplication';

/**
 * Ponto de acesso à loja: uma entrada no menu de Configurações (mesmo padrão do
 * "Dice So Nice"), disponível pra todo mundo (`restricted: false`) — não usa botão
 * de scene controls/HUD pra não conflitar com outros módulos que já ocupam esse espaço.
 */
export function registerShopMenu(): void {
  game.settings.registerMenu(MODULE_ID, 'openShop', {
    name: 'Antiquário de Bragança',
    label: 'Abrir Antiquário',
    hint: 'Abre o catálogo de itens mágicos raros.',
    icon: 'fa-solid fa-scroll',
    type: ShopApplication,
    restricted: false,
  });
}
