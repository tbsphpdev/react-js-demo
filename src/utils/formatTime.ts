import { format, formatDistanceToNow, add } from 'date-fns';

// ----------------------------------------------------------------------

export const fDate = (date: string | number | Date) => format(new Date(date), 'dd MMMM yyyy');

export function fDateAbr(date: string | number | Date) {
  const newDate: string = format(new Date(date), 'dd MMMM yyyy');
  const DateEl: string[] = newDate.split(' ');
  const formattedDate = `${DateEl[0]} ${DateEl[1].substring(0, 3)} ${DateEl[2].substring(2, 4)}`;
  return formattedDate;
}

export function ftimeSuffix(date: string | number | Date) {
  return format(new Date(date), 'h:mm aaa');
}

export function fDateTime(date: string | number | Date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}
export const fDateMonthMin = (date: string | number | Date) =>
  format(new Date(date), 'dd MMM yyyy');

export const fDateMonthDb = (date: string | number | Date) => format(new Date(date), 'yyyy-MM-dd');

export const fDateSuffix = (date: string | number | Date) => format(new Date(date), 'dd/MM/yyyy');
export const fDateHyphen = (date: string | number | Date) => format(new Date(date), 'dd-MM-yyyy');

export const fDateTimeSuffix = (date: string | number | Date) =>
  format(new Date(date), 'dd/MM/yyyy p');

export const fToNow = (date: string | number | Date) =>
  formatDistanceToNow(new Date(date), {
    addSuffix: true
  });

export const addDate = (numOfDays: number) =>
  add(new Date(), {
    days: numOfDays
  });

export const getIntervals = (startTime: number = 0, interval: number = 30) => {
  const times: any[] = []; // time array
  const ap = ['AM', 'PM']; // AM-PM

  // loop to increment the time and push results in array
  for (let i = 0; startTime < 24 * 60; i++) {
    const hh = Math.floor(startTime / 60); // getting hours of day in 0-24 format
    const mm = startTime % 60; // getting minutes of the hour in 0-55 format
    times[i] = `${`0${hh % 12}`.slice(-2)}:${`0${mm}`.slice(-2)}${ap[Math.floor(hh / 12)]}`; // pushing data in array in [00:00 - 12:00 AM/PM format]
    startTime += interval;
  }
};
