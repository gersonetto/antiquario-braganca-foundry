import { MODULE_ID } from './constants';
import { ShopApplication } from './apps/ShopApplication';

/**
 * Ponto de acesso à loja: uma entrada no menu de Configurações (mesmo padrão do
 * "Dice So Nice"), disponível pra todo mundo (`restricted: false`) — não usa botão
 * de scene controls/HUD pra não conflitar com outros módulos que já ocupam esse espaço.
 */
export function registerShopMenu(): void {
  game.settings.registerMenu(MODULE_ID, 'openShop', {
    name: 'ANTIQUARIO.Settings.openShop.name',
    label: 'ANTIQUARIO.Settings.openShop.label',
    hint: 'ANTIQUARIO.Settings.openShop.hint',
    icon: 'fa-solid fa-scroll',
    type: ShopApplication,
    restricted: false,
  });
}
