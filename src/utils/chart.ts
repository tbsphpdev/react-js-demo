import { eachDayOfInterval, isSameDay } from 'date-fns';

export const fillStartDate = (startDate: string, data: { x: string; y: string | number }[]) => {
  const dataStartDate = new Date(data[0]?.x);
  const fStartDate = new Date(startDate);
  const isStartSame = isSameDay(fStartDate, dataStartDate);

  if (!isStartSame) {
    const filldate = eachDayOfInterval({ start: fStartDate, end: dataStartDate }).map((date) => ({
      x: date,
      y: 0
    }));

    const newData = [...filldate, ...data];
    return newData;
  }

  return data;
};
