export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type ActivityLevel = 
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE';

export type Goal = 
  | 'LOSE_WEIGHT'
  | 'MAINTAIN_WEIGHT'
  | 'GAIN_WEIGHT';

export type Persona = 'OBSIDIAN' | 'CHARCOAL' | 'ARCTIC';

export interface RegisterResponse {
  access_token: string;
}
