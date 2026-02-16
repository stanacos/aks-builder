const MAX_CLUSTER_NAME_LENGTH = 20;
const SUFFIX_LENGTH = 4; // hyphen + 3 digits
const MAX_CHARACTER_NAME_LENGTH = MAX_CLUSTER_NAME_LENGTH - SUFFIX_LENGTH;

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

const invalidNames = nintendoCharacters.filter(name => name.length > MAX_CHARACTER_NAME_LENGTH);
if (invalidNames.length > 0) {
  throw new Error(
    `Nintendo character names exceed ${MAX_CHARACTER_NAME_LENGTH} chars (cluster name limit ${MAX_CLUSTER_NAME_LENGTH}): ${invalidNames.join(', ')}`
  );
}

function generateNintendoClusterName() {
  const character = nintendoCharacters[Math.floor(Math.random() * nintendoCharacters.length)];
  const digits = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${character}-${digits}`;
}

export { nintendoCharacters, generateNintendoClusterName, MAX_CLUSTER_NAME_LENGTH };
