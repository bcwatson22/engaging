import { getDirection, isCurrent } from './List';

const setup = (pathname: string | null, target: string): boolean =>
  isCurrent(pathname, target);

describe('isCurrent', () => {
  it('matches home on the home page', () => {
    expect(setup('/', '/')).toBe(true);
  });

  it("doesn't match home anywhere else", () => {
    expect(setup('/contact', '/')).toBe(false);
  });

  it('matches a route exactly', () => {
    expect(setup('/cv', '/cv')).toBe(true);
  });

  it('matches a route from a page nested in it', () => {
    expect(setup('/cv/download', '/cv')).toBe(true);
  });

  it("doesn't match a route that only shares a prefix", () => {
    expect(setup('/cvs', '/cv')).toBe(false);
  });

  it('matches nothing without a pathname', () => {
    expect(setup(null, '/')).toBe(false);
  });
});

describe('getDirection', () => {
  it('points forward to a link after the current page', () => {
    expect(getDirection(2, 0)).toEqual(['nav-forward']);
  });

  it('points back to a link before the current page', () => {
    expect(getDirection(0, 2)).toEqual(['nav-back']);
  });

  it('gives the current page no direction', () => {
    expect(getDirection(1, 1)).toBeUndefined();
  });

  it('gives no direction when no link is current', () => {
    expect(getDirection(1, -1)).toBeUndefined();
  });
});
