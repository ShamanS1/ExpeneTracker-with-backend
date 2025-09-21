export type MonthItem = { month: number; year: number; name: string };

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function generateMonthData(yearsRange = 5): MonthItem[] {
  const data: MonthItem[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  for (let y = currentYear - yearsRange; y <= currentYear + yearsRange; y++) {
    monthNames.forEach((name, month) => data.push({ month, year: y, name }));
  }
  return data;
}

export function getInitialMonthIndex(yearsRange = 5): number {
  const now = new Date();
  return yearsRange * 12 + now.getMonth(); // start at current month
}
