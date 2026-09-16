import { CATEGORIES, RARITIES } from '../catalog/options';
import type { CatalogItem } from '../catalog/types';
import { breakIntoCoins, type CurrencyMode } from '../currency/breakIntoCoins';

const RARITY_LABEL: Record<string, string> = Object.fromEntries(
  RARITIES.map((r) => [r.id, r.label])
);
const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);

const COIN_ORDER = ['pp', 'po', 'pr', 'pc'] as const;

export interface ItemViewModel {
  id: string;
  name: string;
  rarityId: string;
  rarityLabel: string;
  categoriesLabel: string;
  typeLine: string;
  source: string | null;
  hasModificationCompleta: boolean;
  hasModificationSimples: boolean;
  coins: { key: (typeof COIN_ORDER)[number]; value: number }[];
}

export function toItemViewModel(item: CatalogItem, currency: CurrencyMode): ItemViewModel {
  const coinsRaw = breakIntoCoins(item.priceGp, currency);
  let coins = COIN_ORDER.filter((k) => coinsRaw[k] > 0).map((k) => ({ key: k, value: coinsRaw[k] }));
  if (coins.length === 0) coins = [{ key: 'po', value: 0 }];

  return {
    id: item.id,
    name: item.name,
    rarityId: item.rarity,
    rarityLabel: RARITY_LABEL[item.rarity] ?? item.rarity,
    categoriesLabel: item.categories.map((c) => CATEGORY_LABEL[c] ?? c).join(', '),
    typeLine: item.attun ? `${item.type} · Sintonia` : item.type,
    source: item.source,
    hasModificationCompleta: item.modification?.kind === 'completa',
    hasModificationSimples: item.modification?.kind === 'simples',
    coins,
  };
}
