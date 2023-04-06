import React from "react";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const goToNextMonth = () => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() + 1);
    setSelectedDate(date);
  };

  const goToPreviousMonth = () => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() - 1);
    setSelectedDate(date);
  };

  const daysMatrix = getDaysMatrix(selectedDate.getFullYear(), selectedDate.getMonth());

  return (
    <div>
      <h1>Calendar</h1>
      <div>
        <button onClick={goToPreviousMonth}>Previous</button>
        <span>{selectedDate.toLocaleString("default", { month: "long" })}</span>
        <button onClick={goToNextMonth}>Next</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sunday</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
          </tr>
        </thead>
        <tbody>
          {daysMatrix.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => (
                <td key={j}>{day?.getDate()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const getDaysMatrix = (year: number = new Date().getFullYear(), month: number = new Date().getMonth()) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  let dayCount = 0 - firstDayOfMonth;
  const weeksInMonth = Math.ceil((firstDayOfMonth + getDaysInMonth(year, month)) / 7);

  const daysMatrix = new Array(weeksInMonth).fill([]).map(() => {
    return new Array(7).fill(null).map(() => {
      dayCount++;
      return new Date(year, month, dayCount);
    });
  });

  return daysMatrix
};

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month + 1, 0);
  const daysInMonth = date.getDate();
  return daysInMonth;
};

