const nintendoCharacters = [
  'mario',
  'luigi',
  'peach',
  'toad',
  'yoshi',
  'bowser',
  'donkey-kong',
  'diddy-kong',
  'link',
  'zelda',
  'ganondorf',
  'samus',
  'kirby',
  'pikachu',
  'jigglypuff',
  'mewtwo',
  'charizard',
  'fox',
  'falco',
  'captain-falcon',
  'ness',
  'marth',
  'roy',
  'pit',
  'wario',
  'waluigi',
  'rosalina',
  'daisy',
  'toadette',
  'shy-guy',
  'koopa',
  'lakitu',
  'boo',
  'inkling',
  'villager',
  'isabelle',
];

function generateNintendoClusterName() {
  const character = nintendoCharacters[Math.floor(Math.random() * nintendoCharacters.length)];
  const digits = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${character}-${digits}`;
}

export { nintendoCharacters, generateNintendoClusterName };
