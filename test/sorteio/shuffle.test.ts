import { describe, it, expect } from 'vitest';
import { shuffle } from '../../src/sorteio/shuffle';

describe('shuffle', () => {
  it('produz uma ordem determinística com um rng fixo', () => {
    const result = shuffle([1, 2, 3, 4, 5], () => 0);
    expect(result).toEqual([2, 3, 4, 5, 1]);
  });

  it('não muta o array original', () => {
    const original = [1, 2, 3];
    const copy = [...original];
    shuffle(original, () => 0);
    expect(original).toEqual(copy);
  });

  it('preserva todos os elementos, sem perda ou duplicação', () => {
    const original = ['a', 'b', 'c', 'd'];
    const result = shuffle(original, Math.random);
    expect(result).toHaveLength(original.length);
    expect([...result].sort()).toEqual([...original].sort());
  });

  it('array vazio retorna vazio', () => {
    expect(shuffle([], Math.random)).toEqual([]);
  });

  it('usa Math.random por padrão quando nenhum rng é passado', () => {
    const result = shuffle([1, 2, 3]);
    expect(result).toHaveLength(3);
  });
});
