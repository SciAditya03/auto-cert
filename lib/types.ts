export type Participant = {
  id: string | number;
  registration_number: string;
  name: string;
  eligible: boolean;
};

export type Achievement = {
  id: string | number;
  registration_number: string;
  name: string;
  eligible: boolean;
};

export type LookupResult = {
  registrationNumber: string;
  participant: Participant | null;
  achievements: Achievement[];
};
