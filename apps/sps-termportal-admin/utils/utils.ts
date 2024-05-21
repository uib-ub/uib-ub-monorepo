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
