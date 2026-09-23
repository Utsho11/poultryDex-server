export const ANIMAL_TYPE = {
  poultry: 'poultry',
  layer: 'layer',
  broiler: 'broiler',
} as const;

export type TAnimalType = keyof typeof ANIMAL_TYPE;

export const farmSearchableFields = ['name', 'location'];
