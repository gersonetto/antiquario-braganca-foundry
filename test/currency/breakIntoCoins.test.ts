import { describe, it, expect } from 'vitest';
import { breakIntoCoins } from '../../src/currency/breakIntoCoins';

describe('breakIntoCoins', () => {
  it('quebra um valor simples sem platina (padrão D&D)', () => {
    expect(breakIntoCoins(199.53, 'dnd')).toEqual({ pp: 0, po: 199, pr: 5, pc: 3 });
  });

  it('quebra em platina quando o valor em ouro passa de 1000, só em múltiplos de 100', () => {
    expect(breakIntoCoins(7878.3554, 'dnd')).toEqual({ pp: 700, po: 878, pr: 3, pc: 6 });
  });

  it('platina nunca fica com valor quebrado, sempre múltiplo de 100', () => {
    const result = breakIntoCoins(2500.5, 'dnd');
    expect(result.pp).toBe(200);
    expect(result.pp % 100).toBe(0);
    expect(result.po).toBe(500);
  });

  it('não quebra em platina abaixo de 1000', () => {
    const result = breakIntoCoins(999.99, 'dnd');
    expect(result.pp).toBe(0);
    expect(result.po).toBe(999);
  });

  it('arredonda o cobre só no final, cascateando o carry', () => {
    expect(breakIntoCoins(1.999996, 'dnd')).toEqual({ pp: 0, po: 2, pr: 0, pc: 0 });
  });

  it('economia de Bragança divide o valor por 10 antes de quebrar', () => {
    expect(breakIntoCoins(199.53, 'braganca')).toEqual({ pp: 0, po: 19, pr: 9, pc: 5 });
  });
});
