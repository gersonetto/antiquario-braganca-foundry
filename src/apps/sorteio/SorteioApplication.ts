import { TEMPLATES } from '../../constants';
import { CATEGORIES, RARITIES } from '../../catalog/options';
import type { CatalogItem, CategorySlug, RaritySlug } from '../../catalog/types';
import { rollLoot } from '../../sorteio/rollLoot';
import { rerollSlot } from '../../sorteio/rerollSlot';
import { SORTEIO_MODO_LABELS } from '../../sorteio/labels';
import type { SorteioConfig, SorteioModo, SorteioResult } from '../../sorteio/types';
import { toItemViewModel } from '../itemViewModel';
import { publishSorteioResult } from '../../chat/sorteioChatCard';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const DEFAULT_CONFIG: SorteioConfig = { modo: 'lote', rarity: 'comum', category: 'arcana' };

/**
 * Ferramenta de sorteio, GM-only. Fluxo: configura -> sorteia numa revisão privada
 * (pode rerolar/vetar qualquer slot) -> publica no chat. Uma única Application com
 * estado interno de step, não duas janelas separadas.
 */
export class SorteioApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'antiquario-braganca-sorteio',
    classes: ['antiquario-braganca'],
    window: {
      title: 'ANTIQUARIO.Sorteio.windowTitle',
      icon: 'fa-solid fa-dice',
      resizable: true,
    },
    position: { width: 640, height: 'auto' },
    actions: {
      'set-modo': SorteioApplication.#onSetModo,
      'set-rarity': SorteioApplication.#onSetRarity,
      'set-category': SorteioApplication.#onSetCategory,
      'submit-config': SorteioApplication.#onSubmitConfig,
      'reroll-slot': SorteioApplication.#onRerollSlot,
      'back-to-config': SorteioApplication.#onBackToConfig,
      publish: SorteioApplication.#onPublish,
    },
  };

  static PARTS = {
    body: { template: TEMPLATES.sorteioApp },
  };

  #items: CatalogItem[];
  #config: SorteioConfig = { ...DEFAULT_CONFIG };
  #result: SorteioResult = [];
  #step: 'config' | 'review' = 'config';

  constructor(items: CatalogItem[], options: Record<string, unknown> = {}) {
    super(options);
    this.#items = items;
  }

  async _onFirstRender(context: unknown, options: unknown) {
    await super._onFirstRender(context, options);
    if (!game.user.isGM) {
      ui.notifications.error(game.i18n.localize('ANTIQUARIO.Shop.sorteioGmOnly'));
      this.close();
    }
  }

  async _prepareContext() {
    if (this.#step === 'config') {
      return {
        isReview: false,
        modos: (Object.keys(SORTEIO_MODO_LABELS) as SorteioModo[]).map((id) => ({
          id,
          title: SORTEIO_MODO_LABELS[id].title,
          description: SORTEIO_MODO_LABELS[id].description,
          active: this.#config.modo === id,
        })),
        rarities: RARITIES.map((r) => ({ ...r, active: this.#config.rarity === r.id })),
        categories: CATEGORIES.map((c) => ({ ...c, active: this.#config.category === c.id })),
      };
    }

    const modoInfo = SORTEIO_MODO_LABELS[this.#config.modo];
    const rarityLabel = RARITIES.find((r) => r.id === this.#config.rarity)?.label ?? this.#config.rarity;
    const categoryLabel =
      CATEGORIES.find((c) => c.id === this.#config.category)?.label ?? this.#config.category;

    return {
      isReview: true,
      modoTitle: modoInfo.title,
      rarityLabel,
      categoryLabel,
      empty: this.#result.length === 0,
      warning:
        this.#result.length > 0 && this.#result.length < modoInfo.count
          ? `Só ${this.#result.length} ${this.#result.length === 1 ? 'item disponível' : 'itens disponíveis'} nessa combinação de raridade e temática.`
          : null,
      slots: this.#result.map((slot, index) => ({
        slotIndex: index,
        guaranteedCategory: slot.guaranteedCategory,
        item: toItemViewModel(slot.item, 'braganca'),
      })),
    };
  }

  static #onSetModo(this: SorteioApplication, event: Event, target: HTMLElement) {
    this.#config = { ...this.#config, modo: target.dataset.id as SorteioModo };
    this.render();
  }

  static #onSetRarity(this: SorteioApplication, event: Event, target: HTMLElement) {
    this.#config = { ...this.#config, rarity: target.dataset.id as RaritySlug };
    this.render();
  }

  static #onSetCategory(this: SorteioApplication, event: Event, target: HTMLElement) {
    this.#config = { ...this.#config, category: target.dataset.id as CategorySlug };
    this.render();
  }

  static #onSubmitConfig(this: SorteioApplication) {
    this.#result = rollLoot(this.#items, this.#config);
    this.#step = 'review';
    this.render();
  }

  static #onRerollSlot(this: SorteioApplication, event: Event, target: HTMLElement) {
    const slotIndex = Number(target.dataset.slotIndex);
    const outcome = rerollSlot(this.#items, this.#config, this.#result, slotIndex);
    if (!outcome.changed) {
      ui.notifications.warn(game.i18n.localize('ANTIQUARIO.Sorteio.rerollExhausted'));
      return;
    }
    this.#result = outcome.result;
    this.render();
  }

  static #onBackToConfig(this: SorteioApplication) {
    this.#step = 'config';
    this.#result = [];
    this.render();
  }

  static async #onPublish(this: SorteioApplication) {
    await publishSorteioResult(this.#config, this.#result);
    this.close();
  }
}
