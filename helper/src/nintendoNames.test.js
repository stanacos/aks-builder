import { nintendoCharacters, generateNintendoClusterName } from './nintendoNames';

describe('nintendoCharacters', () => {
  test('contains at least 35 characters', () => {
    expect(nintendoCharacters.length).toBeGreaterThanOrEqual(35);
  });

  test('all entries are lowercase strings with only letters and hyphens', () => {
    nintendoCharacters.forEach(name => {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  });

  test('contains no duplicates', () => {
    const unique = new Set(nintendoCharacters);
    expect(unique.size).toBe(nintendoCharacters.length);
  });
});

describe('generateNintendoClusterName', () => {
  test('returns a string matching {character}-{3digits} format', () => {
    const name = generateNintendoClusterName();
    expect(name).toMatch(/^[a-z]+(-[a-z]+)*-\d{3}$/);
  });

  test('uses a character from the nintendoCharacters list', () => {
    const name = generateNintendoClusterName();
    // Strip the last 4 chars (-NNN) to get the character name
    const character = name.slice(0, name.length - 4);
    expect(nintendoCharacters).toContain(character);
  });

  test('suffix is a zero-padded 3-digit number between 000 and 999', () => {
    for (let i = 0; i < 50; i++) {
      const name = generateNintendoClusterName();
      const digits = name.slice(-3);
      const num = parseInt(digits, 10);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(999);
      expect(digits).toHaveLength(3);
    }
  });

  test('generates varying names across multiple calls', () => {
    const names = new Set();
    for (let i = 0; i < 20; i++) {
      names.add(generateNintendoClusterName());
    }
    expect(names.size).toBeGreaterThan(1);
  });
});
