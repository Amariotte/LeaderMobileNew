export const formatAmount = (amount: number | string | null | undefined) => {
  const normalized =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount.replace(/\s/g, "").replace(",", "."))
        : 0;

  const safeValue = Number.isFinite(normalized) ? normalized : 0;
  return `${safeValue.toLocaleString("fr-FR")} FCFA`;
};

export const formatNumber = (amount: number | string | null | undefined) => {
  const normalized =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount.replace(/\s/g, "").replace(",", "."))
        : 0;

  const safeValue = Number.isFinite(normalized) ? normalized : 0;
  return `${safeValue.toLocaleString("fr-FR")}`;
};

export const MAIN_ACCOUNT_FILTER = "Compte principal";

export const isModeDemoEnabled = (): boolean => {
  return process.env.EXPO_PUBLIC_MODE_DEMO === "true";
};

export const toComparableDate = (
  value: Date | string | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    const day = value.getDate();
    const month = value.getMonth() + 1;
    const year = value.getFullYear();
    return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  }

  const raw = value.trim();
  if (!raw) {
    return null;
  }

  // Handles dd/mm/yyyy first to avoid locale parsing ambiguity.
  const slashParts = raw.split("/");
  if (slashParts.length === 3) {
    const [day, month, year] = slashParts;
    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (
      Number.isInteger(dayNum) &&
      Number.isInteger(monthNum) &&
      Number.isInteger(yearNum) &&
      dayNum >= 1 &&
      dayNum <= 31 &&
      monthNum >= 1 &&
      monthNum <= 12 &&
      yearNum >= 1900
    ) {
      return `${yearNum}${String(monthNum).padStart(2, "0")}${String(dayNum).padStart(2, "0")}`;
    }
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const day = parsed.getDate();
  const month = parsed.getMonth() + 1;
  const year = parsed.getFullYear();
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
};

export const buildSousCompteFilters = <T>(
  items: T[],
  getLabel: (item: T) => string | null | undefined,
): string[] => {
  const filters = [
    "Tous",
    MAIN_ACCOUNT_FILTER,
    ...Array.from(
      new Set(
        items
          .map(getLabel)
          .filter(
            (label): label is string =>
              typeof label === "string" && label.trim().length > 0,
          ),
      ),
    ),
  ];

  filters.sort((a, b) => {
    if (a === "Tous") return -1;
    if (b === "Tous") return 1;
    if (a === MAIN_ACCOUNT_FILTER) return -1;
    if (b === MAIN_ACCOUNT_FILTER) return 1;
    return a.localeCompare(b);
  });

  return filters;
};

export const matchesSousCompteFilter = (
  activeFilter: string,
  label: string | null | undefined,
): boolean => {
  const hasLabel = typeof label === "string" && label.trim().length > 0;

  if (activeFilter === "Tous") {
    return true;
  }

  if (activeFilter === MAIN_ACCOUNT_FILTER) {
    return !hasLabel;
  }

  return label === activeFilter;
};

export const matchesDateRange = (
  issueComparable: string | null,
  startDateQuery: string,
  endDateQuery: string,
): boolean => {
  const parseInputDate = (s: string): Date | null => {
    const [d, m, y] = s.split("/");
    if (!d || !m || !y) return null;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(dt.getTime()) ? null : dt;
  };

  const startParsed =
    startDateQuery.trim().length > 0
      ? parseInputDate(startDateQuery.trim())
      : null;
  const endParsed =
    endDateQuery.trim().length > 0 ? parseInputDate(endDateQuery.trim()) : null;
  const startComparable = startParsed ? toComparableDate(startParsed) : null;
  const endComparable = endParsed ? toComparableDate(endParsed) : null;
  const afterStart =
    !startComparable || !issueComparable || issueComparable >= startComparable;
  const beforeEnd =
    !endComparable || !issueComparable || issueComparable <= endComparable;

  return afterStart && beforeEnd;
};

export const formatDate = (pDate: Date | string | null | undefined) => {
  if (!pDate) return "—";
  const date = new Date(pDate);
  if (isNaN(date.getTime())) return "—";
  const hasTime =
    date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds() > 0;
  return hasTime
    ? date.toLocaleString("fr-FR")
    : date.toLocaleDateString("fr-FR");
};


export const getLabelCivilite = (
  civ: number
): string => {
  switch (civ) {
    case 1:
      return "Monsieur";
    case 2:
      return "Madame";
    case 3:
      return "Mademoiselle";
    case 4:
      return "Société";
    default:
      return "—";
  }
};


export const getLabelTypeClient = (
  civ: number
): string => {
  switch (civ) {
    case 1:
      return "Personne physique";
    case 2:
      return "Personne morale";
    default:
      return "—";
  }
};


const AVATAR_COLORS = [
  "#1F8B82", "#6B3CFF", "#E05252", "#E8872A", "#2A7BE8",
  "#50C52A", "#A83CFF", "#2AC5C5", "#FF6B6B", "#3CB87A",
];


export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}