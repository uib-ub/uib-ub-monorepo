export function formatTimespan(start: string, end: string) {
  if (!start && !end) {
    return "–";
  }
  return `${start ? start + "/" : "-/"}${end || "-"}`;
}
