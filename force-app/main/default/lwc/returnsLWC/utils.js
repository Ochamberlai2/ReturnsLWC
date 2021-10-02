export const addDays = (date, days) => {
  if (days === undefined) days = 0;
  date.setDate(date.getDate() + days);
  return date;
};
