export function formatTimespan(start: string, end: string) {
  if (!start && !end) {
    return "–";
  }
  return `${start ? start + "/" : "-/"}${end || "-"}`;
}

export function numberStatus(status: string) {
  const index = statusOrder.indexOf(status);
  return `${index >= 0 ? index + 1 + "." : ""} ${status || ""}`;
}
