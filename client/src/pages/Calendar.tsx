import React from "react";

export default function Calendar() {
  const daysMatrix = getDaysMatrix(2023, 4);
  return (
    <div>
      <h1>Calendar</h1>
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

  const daysMatrix = new Array(5).fill([]).map(() => {
    return new Array(7).fill(null).map(() => {
      dayCount++;
      return new Date(year, month, dayCount);
    });
  });

  return daysMatrix
};

