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

export function prettyPrintDate(date: string) {
  if (date) {
    return new Date(date).toLocaleDateString("nb", {
      dateStyle: "short",
      timeStyle: undefined,
    });
  } else {
    return "";
  }
}

export function cleanId(uri: string, rmNs = false) {
  const replaced = uri.replace(
    "http://wiki.terminologi.no/index.php/Special:URIResolver/",
    ""
  );
  if (rmNs) {
    return replaced.split("-3A")[1];
  } else {
    return replaced;
  }
}

export const getCurrentDateArray = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDay();
  return [year, month, day];
};

export function getDaysDiff(timestamp: string): number {
  const currentDate = new Date();
  const timestampDate = new Date(timestamp);

  const diffTime = Math.abs(currentDate.getTime() - timestampDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays - 1;
}

export function isInFuture(timestamp: string): boolean {
  const now = new Date().getTime();
  const timestampDate = new Date(timestamp).getTime();
  return timestampDate > now;
}

export function flattenList(list: Array<any>) {
  return list?.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flattenList(b) : b),
    []
  );
}
