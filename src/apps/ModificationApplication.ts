import { TEMPLATES } from '../constants';
import type { CatalogItem } from '../catalog/types';
import { renderModificationText } from '../markdown/renderModificationText';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Dialog GM-e-jogador (o catálogo é público) mostrando a anotação do mestre de um item. */
export class ModificationApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'antiquario-braganca-modification',
    classes: ['antiquario-braganca'],
    window: {
      title: 'Anotação do mestre',
      icon: 'fa-solid fa-scroll',
      resizable: true,
    },
    position: { width: 480, height: 'auto' },
    actions: {
      'publish-modification': ModificationApplication.#onPublish,
    },
  };

  static PARTS = {
    body: { template: TEMPLATES.modification },
  };

  #item: CatalogItem;

  constructor(item: CatalogItem, options: Record<string, unknown> = {}) {
    super(options);
    this.#item = item;
  }

  async _prepareContext() {
    return {
      itemName: this.#item.name,
      html: renderModificationText(this.#item.modification?.text ?? ''),
    };
  }

  static async #onPublish(this: ModificationApplication) {
    const content = await foundry.applications.handlebars.renderTemplate(TEMPLATES.modificationChatCard, {
      itemName: this.#item.name,
      html: renderModificationText(this.#item.modification?.text ?? ''),
    });
    await ChatMessage.create({ content, speaker: ChatMessage.getSpeaker() });
    ui.notifications.info('Anotação publicada no chat.');
  }
}
