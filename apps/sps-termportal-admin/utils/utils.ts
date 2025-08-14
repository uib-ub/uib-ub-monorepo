export function formatTimespan(start: string, end: string) {
  if (!start && !end) {
    return "–";
  }
  return `${start ? start + "/" : "-/"}${end || "-"}`;
}

export function numberStatus(status: string) {
  const index = statusOrder.indexOf(status);
  return `${index >= 0 ? index + "." : ""} ${status || ""}`;
}

export function prettyPrintDate(date: string) {
  if (date) {
    return new Date(date).toLocaleDateString("nb", {
      dateStyle: "short",
      timeStyle: undefined,
    });
  }
  else {
    return "";
  }
}

export function cleanId(uri: string, rmNs = false) {
  const replaced = uri.replace(
    "http://wiki.terminologi.no/index.php/Special:URIResolver/",
    "",
  );
  if (rmNs) {
    return replaced.split("-3A")[1];
  }
  else {
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
    [],
  );
}

export function getReminderColorClass(data) {
  const { error } = reportReminder.interval;

  if (data.reminderCalc <= 0) return colorMappingStatus.ok.color;
  if (data.reminderCalc < error && data.reminderCalc >= 0)
    return colorMappingStatus.warning.color;
  return colorMappingStatus.error.color;
}

// domain processing
export function cleanDomainData(data) {
  return data.map((d) => {
    const labels = JSON.parse(d.labels.value);

    return {
      id: cleanId(d.concept.value, true),
      nb: labels?.nb,
      labelsLen: Object.keys(labels).length,
      nn: labels?.nn,
      en: labels?.en,
      published: d.published.value === "true",
      level: d.level.value,
      children: d?.children
        ? d?.children.value.split(", ").map(id => cleanId(id, true))
        : [],
      concepts: d.concepts.value,
    };
  });
};

export function processDomainHierarchyRecursively(
  data: [],
  output: [Record<string, string | number | Array<number>>],
  domainInstance: object = {},
  orderCounter: number,
  hierarchy: Array<number>,
) {
  let updatedCounter = orderCounter + 1;
  let hierarchyCounter = 0;
  output.push({
    ...domainInstance,
    order: updatedCounter,
    hierarchy: "^" + hierarchy.join(".") + "$",
  });

  if (domainInstance.children) {
    const sortedChildren = domainInstance?.children.sort();
    sortedChildren.forEach((child) => {
      hierarchyCounter++;
      const childDomain = data.filter(d => d.id === child)[0];
      if (childDomain) {
        updatedCounter = processDomainHierarchyRecursively(
          data,
          output,
          childDomain,
          updatedCounter,
          [...hierarchy, ...[hierarchyCounter]],
        );
      }
    });
  }

  return updatedCounter;
}

export function processTopdomains(topdomains: string[], data) {
  const topdomainOrder = topdomains;
  if (data) {
    const collected = [];
    let domainCounter = 0;
    const topdomainsFiltered = data
      .filter(d => d.level === "1")
      .sort(
        (a, b) =>
          (topdomainOrder.includes(a.id) ? topdomainOrder.indexOf(a.id) : Infinity)
          - (topdomainOrder.includes(b.id) ? topdomainOrder.indexOf(b.id) : Infinity),
      );
    let hierarchyCounter = 0;
    topdomainsFiltered.forEach((domain) => {
      hierarchyCounter++;
      domainCounter = processDomainHierarchyRecursively(
        data,
        collected,
        domain,
        domainCounter,
        [hierarchyCounter],
      );
    });
    const sumAdded = collected.map((outer) => {
      const conceptSum = collected
        .map(inner =>
          inner.hierarchy.startsWith(outer.hierarchy.slice(0, -1))
            ? parseInt(inner.concepts)
            : 0,
        )
        .reduce((a, b) => a + b, 0);
      return { ...outer, ...{ conceptSum } };
    });
    return sumAdded;
  }
  return [];
}
