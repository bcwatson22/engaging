import { formatDuration, minute, second } from './formatDuration';

const setup = (ms: number) => formatDuration(ms);

describe('formatDuration', () => {
  it('reads a render in whole seconds', () => {
    expect(setup(14 * second)).toBe('14s');
  });

  it('rounds, because nobody reads a status page for the milliseconds', () => {
    expect(setup(13_812)).toBe('14s');
  });

  it('reads a longer wait in minutes and seconds', () => {
    expect(setup(2 * minute + 5 * second)).toBe('2m 5s');
  });

  it('drops the seconds when there are none', () => {
    expect(setup(3 * minute)).toBe('3m');
  });

  it('reads nothing at all as zero rather than as missing', () => {
    expect(setup(0)).toBe('0s');
  });

  /* Two clocks are involved in producing these numbers, so a negative or a
     nonsense one is possible and should not render as "-3s". */
  it.each([
    ['a negative duration', -1],
    ['a value that is not a number', Number.NaN],
    ['an infinite value', Number.POSITIVE_INFINITY],
  ])('shows %s as unknown', (_label, ms) => {
    expect(setup(ms)).toBe('—');
  });
});
