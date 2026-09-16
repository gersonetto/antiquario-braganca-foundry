import { MODULE_ID, TEMPLATES } from '../constants';
import { getCatalog } from '../catalog/loadCatalog';
import type { CatalogItem } from '../catalog/types';
import { rerollSlot } from '../sorteio/rerollSlot';
import type { SorteioConfig, SorteioResult } from '../sorteio/types';
import { toItemViewModel } from '../apps/itemViewModel';

interface StoredSlot {
  itemId: string;
  guaranteedCategory: boolean;
}

interface StoredSorteioResult {
  config: SorteioConfig;
  slots: StoredSlot[];
}

function toStoredSlots(result: SorteioResult): StoredSlot[] {
  return result.map((s) => ({ itemId: s.item.id, guaranteedCategory: s.guaranteedCategory }));
}

function hydrateResult(slots: StoredSlot[], items: CatalogItem[]): SorteioResult {
  const byId = new Map(items.map((i) => [i.id, i]));
  const hydrated: SorteioResult = [];
  for (const slot of slots) {
    const item = byId.get(slot.itemId);
    if (item) hydrated.push({ item, guaranteedCategory: slot.guaranteedCategory });
  }
  return hydrated;
}

async function buildChatHtml(result: SorteioResult): Promise<string> {
  const slots = result.map((slot, index) => ({
    slotIndex: index,
    guaranteedCategory: slot.guaranteedCategory,
    // A carta de chat é compartilhada — sem toggle de moeda por espectador, usa a
    // economia de Bragança como padrão do módulo.
    item: toItemViewModel(slot.item, 'braganca'),
  }));
  return foundry.applications.handlebars.renderTemplate(TEMPLATES.chatCard, { slots });
}

export async function publishSorteioResult(config: SorteioConfig, result: SorteioResult): Promise<void> {
  const content = await buildChatHtml(result);
  const stored: StoredSorteioResult = { config, slots: toStoredSlots(result) };

  await ChatMessage.create({
    content,
    speaker: ChatMessage.getSpeaker(),
    flags: { [MODULE_ID]: { sorteioResult: stored } },
  });
}

async function handleRerollPublished(message: any, slotIndex: number): Promise<void> {
  const stored = message.getFlag(MODULE_ID, 'sorteioResult') as StoredSorteioResult | undefined;
  if (!stored) return;

  const items = await getCatalog();
  const currentResult = hydrateResult(stored.slots, items);
  const outcome = rerollSlot(items, stored.config, currentResult, slotIndex);

  if (!outcome.changed) {
    ui.notifications.warn('Não há outro item disponível para rerolar esse slot.');
    return;
  }

  const content = await buildChatHtml(outcome.result);
  const nextStored: StoredSorteioResult = { config: stored.config, slots: toStoredSlots(outcome.result) };
  await message.update({
    content,
    [`flags.${MODULE_ID}.sorteioResult`]: nextStored,
  });
}

export function registerChatCardListeners(): void {
  Hooks.on('renderChatMessageHTML', (message: any, html: HTMLElement) => {
    const stored = message.getFlag(MODULE_ID, 'sorteioResult');
    if (!stored) return;

    const rerollButtons = html.querySelectorAll('[data-action="reroll-published-slot"]');
    if (!game.user.isGM) {
      rerollButtons.forEach((btn: Element) => btn.remove());
      return;
    }

    rerollButtons.forEach((btn: Element) => {
      btn.addEventListener('click', () => {
        const slotIndex = Number((btn as HTMLElement).dataset.slotIndex);
        void handleRerollPublished(message, slotIndex);
      });
    });
  });
}
