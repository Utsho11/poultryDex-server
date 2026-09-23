export interface IRegisterUserPayload {
  name: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface IRegisterFarmPayload {
  farmName: string;
  ownerName: string;
  email?: string;
  phone?: string;
  password: string;
  animalType?: 'poultry' | 'layer' | 'broiler';
  date?: string;
  location?: string;
  timezone?: string;
}

export interface ILoginPayload {
  identifier?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface ISwitchFarmPayload {
  farmId: string;
}
