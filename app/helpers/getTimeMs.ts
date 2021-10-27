export function getTimeMs(days = 0, hours = 0, minutes = 0, seconds = 0) {
  hours += days * 24;
  minutes += hours * 60;
  seconds += minutes * 60;
  return seconds * 1000;
}
