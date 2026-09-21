export const OTHER = "outro";

export type RaceKey = "president" | "governor" | "federal" | "state";

export interface Race {
  key: RaceKey;
  label: string;
  short: string;
  options: string[];
  choiceField: string;
  otherField: string;
}

export const RACES: Race[] = [
  {
    key: "president",
    label: "Presidente",
    short: "Pres.",
    options: ["LULA 13", "FLAVIO 22"],
    choiceField: "president_choice",
    otherField: "president_other",
  },
  {
    key: "governor",
    label: "Governador",
    short: "Gov.",
    options: ["ELMANO 13", "CIRO 45"],
    choiceField: "governor_choice",
    otherField: "governor_other",
  },
  {
    key: "federal",
    label: "Deputado Federal",
    short: "Dep. Fed.",
    options: ["Yuri", "Fernando", "Sandrinha", "Lukão", "Gastão", "Giordana Mano"],
    choiceField: "federal_choice",
    otherField: "federal_other",
  },
  {
    key: "state",
    label: "Deputado Estadual",
    short: "Dep. Est.",
    options: ["Davi", "Giovanni", "Franzé", "Zé Ailton", "Felipe Vasques", "Andrea Landim"],
    choiceField: "state_choice",
    otherField: "state_other",
  },
];

export interface VisitRow {
  id: string;
  visited_at: string;
  activist_name: string | null;
  neighborhood: string;
  locality: string | null;
  address_number: string | null;
  is_undecided: boolean | null;
  undecided_details: string | null;
  vote_count: number;
  voter_name: string | null;
  notes: string | null;
  president_choice: string;
  president_other: string | null;
  governor_choice: string;
  governor_other: string | null;
  federal_choice: string;
  federal_other: string | null;
  state_choice: string;
  state_other: string | null;
}

export function answerFor(visit: VisitRow, race: Race): string {
  const choice = visit[race.choiceField as keyof VisitRow] as string;
  const other = visit[race.otherField as keyof VisitRow] as string | null;
  if (choice === OTHER) return other?.trim() ? other.trim() : "Outro";
  return choice;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const PREDEFINED_NEIGHBORHOODS = [
  "Centro",
  "Salesianos",
  "Socorro",
  "Romeirão",
  "Horto",
  "Lagoa Seca",
  "João Cabral",
  "Pirajá",
  "Frei Damião",
  "Jardim Gonzaga",
  "Novo Juazeiro",
  "Tiradentes",
  "Limoeiro",
  "Franciscanos",
  "São José",
  "Aeroporto",
  "Betolândia",
  "Planalto",
  "Campo Alegre",
  "Juvêncio Santana",
  "Timbaúbas",
  "Pio XII",
  "São Miguel",
  "Santa Teresa",
  "Antônio Vieira",
  "Triângulo",
  "Vila Fátima",
  "Vila Três Marias",
  "Salgadinho",
  "Carité",
  "São Geraldo",
  "Distrito Padre Cícero",
  "Distrito Marrocos"
];

export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
