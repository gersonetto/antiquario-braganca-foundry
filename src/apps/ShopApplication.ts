import { TEMPLATES } from '../constants';
import { CATEGORIES, RARITIES } from '../catalog/options';
import { getCatalog } from '../catalog/loadCatalog';
import type { CatalogItem, CategorySlug, RaritySlug } from '../catalog/types';
import type { CurrencyMode } from '../currency/breakIntoCoins';
import { toItemViewModel } from './itemViewModel';
import { ModificationApplication } from './ModificationApplication';
import { SorteioApplication } from './sorteio/SorteioApplication';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Catálogo completo — visível a qualquer usuário, GM ou jogador, sem gating. */
export class ShopApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'antiquario-braganca-shop',
    classes: ['antiquario-braganca'],
    window: {
      title: 'Antiquário de Bragança',
      icon: 'fa-solid fa-scroll',
      resizable: true,
    },
    position: { width: 920, height: 720 },
    actions: {
      'toggle-rarity': ShopApplication.#onToggleRarity,
      'toggle-category': ShopApplication.#onToggleCategory,
      'set-currency': ShopApplication.#onSetCurrency,
      'open-modification': ShopApplication.#onOpenModification,
      'open-sorteio': ShopApplication.#onOpenSorteio,
      'refresh-catalog': ShopApplication.#onRefreshCatalog,
    },
  };

  // Duas partes: a busca fica na toolbar, que só re-renderiza em toggles de
  // raridade/moeda — assim digitar na busca (que só re-renderiza "results") nunca
  // perde o foco do input.
  static PARTS = {
    toolbar: { template: TEMPLATES.shopToolbar },
    results: { template: TEMPLATES.shopResults },
  };

  #search = '';
  #rarities = new Set<RaritySlug>();
  #categories = new Set<CategorySlug>();
  #currency: CurrencyMode = 'braganca';
  #items: CatalogItem[] = [];
  #loadError: string | null = null;

  async _prepareContext() {
    try {
      this.#items = await getCatalog();
      this.#loadError = null;
    } catch (err) {
      this.#loadError = err instanceof Error ? err.message : String(err);
    }

    const q = this.#search.trim().toLowerCase();
    const filteredRaw = this.#items.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (this.#rarities.size && !this.#rarities.has(item.rarity)) return false;
      if (this.#categories.size && !item.categories.some((c) => this.#categories.has(c))) return false;
      return true;
    });

    const categoryCounts = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<
      CategorySlug,
      number
    >;
    for (const item of this.#items) {
      if (q && !item.name.toLowerCase().includes(q)) continue;
      if (this.#rarities.size && !this.#rarities.has(item.rarity)) continue;
      for (const c of item.categories) categoryCounts[c]++;
    }

    return {
      isGM: game.user.isGM,
      search: this.#search,
      isBraganca: this.#currency === 'braganca',
      isDnd: this.#currency === 'dnd',
      rarities: RARITIES.map((r) => ({ ...r, active: this.#rarities.has(r.id) })),
      categories: CATEGORIES.map((c) => ({
        ...c,
        active: this.#categories.has(c.id),
        count: categoryCounts[c.id],
      })),
      filtered: filteredRaw.map((item) => toItemViewModel(item, this.#currency)),
      resultCountLabel: this.#loadError
        ? 'Não foi possível carregar o catálogo.'
        : `${filteredRaw.length} ${filteredRaw.length === 1 ? 'item encontrado' : 'itens encontrados'}`,
    };
  }

  async _onRender(context: unknown, options: unknown) {
    await super._onRender(context, options);
    const input = this.element.querySelector('[data-role="search-input"]') as HTMLInputElement | null;
    if (input && !input.dataset.wired) {
      input.dataset.wired = 'true';
      input.addEventListener('input', () => {
        this.#search = input.value;
        this.render({ parts: ['results'] });
      });
    }
  }

  static #onToggleRarity(this: ShopApplication, event: Event, target: HTMLElement) {
    const id = target.dataset.id as RaritySlug;
    if (this.#rarities.has(id)) this.#rarities.delete(id);
    else this.#rarities.add(id);
    this.render();
  }

  static #onToggleCategory(this: ShopApplication, event: Event, target: HTMLElement) {
    const id = target.dataset.id as CategorySlug;
    if (this.#categories.has(id)) this.#categories.delete(id);
    else this.#categories.add(id);
    this.render();
  }

  static #onSetCurrency(this: ShopApplication, event: Event, target: HTMLElement) {
    this.#currency = target.dataset.value as CurrencyMode;
    this.render();
  }

  static #onOpenModification(this: ShopApplication, event: Event, target: HTMLElement) {
    const item = this.#items.find((i) => i.id === target.dataset.itemId);
    if (item) new ModificationApplication(item).render({ force: true });
  }

  static #onOpenSorteio(this: ShopApplication) {
    if (!game.user.isGM) {
      ui.notifications.warn('Somente o mestre pode usar o sorteio.');
      return;
    }
    new SorteioApplication(this.#items).render({ force: true });
  }

  static async #onRefreshCatalog(this: ShopApplication) {
    try {
      await getCatalog({ force: true });
      ui.notifications.info('Catálogo atualizado.');
    } catch {
      ui.notifications.warn('Não foi possível atualizar o catálogo agora — mostrando a última cópia salva.');
    }
    this.render();
  }
}
