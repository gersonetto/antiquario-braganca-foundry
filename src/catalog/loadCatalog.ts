import { MODULE_ID, SETTINGS } from '../constants';
import type { CatalogItem } from './types';

const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_CATALOG_API_URL = 'https://antiquario-braganca.vercel.app/api/catalog';

interface CachedCatalog {
  items: CatalogItem[];
  fetchedAt: number;
}

let memoryCache: CachedCatalog | null = null;

export function registerCatalogSettings(): void {
  game.settings.register(MODULE_ID, SETTINGS.catalogApiUrl, {
    name: 'ANTIQUARIO.Settings.apiUrl.name',
    hint: 'ANTIQUARIO.Settings.apiUrl.hint',
    scope: 'world',
    config: true,
    type: String,
    default: DEFAULT_CATALOG_API_URL,
  });

  // Última cópia boa do catálogo, usada quando o fetch ao vivo falha. Só o GM
  // consegue gravar (scope "world"), o que basta: o primeiro GM que conseguir
  // buscar com sucesso já semeia o cache pra mesa toda.
  game.settings.register(MODULE_ID, SETTINGS.catalogCache, {
    scope: 'world',
    config: false,
    type: Object,
    default: null,
  });
}

/** Busca o catálogo em `/api/catalog`, com cache em memória e fallback pra última cópia salva. */
export async function getCatalog(options: { force?: boolean } = {}): Promise<CatalogItem[]> {
  if (!options.force && memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return memoryCache.items;
  }

  const apiUrl = game.settings.get(MODULE_ID, SETTINGS.catalogApiUrl) as string;
  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const items = (await response.json()) as CatalogItem[];
      memoryCache = { items, fetchedAt: Date.now() };
      if (game.user.isGM) {
        await game.settings.set(MODULE_ID, SETTINGS.catalogCache, memoryCache);
      }
      return items;
    } catch (err) {
      console.warn(`${MODULE_ID} | Falha ao buscar o catálogo ao vivo, tentando cache salvo.`, err);
    }
  }

  const cached = game.settings.get(MODULE_ID, SETTINGS.catalogCache) as CachedCatalog | null;
  if (cached?.items?.length) {
    memoryCache = cached;
    return cached.items;
  }

  throw new Error('Catálogo indisponível: sem conexão e sem cache salvo.');
}
