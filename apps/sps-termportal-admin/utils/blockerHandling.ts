export function checkBlocker(dupeIds, tb) {
  const blocker = { hard: {}, soft: {}, status: "ok" };
  if (tb.status) {
    const statusNumber = Number(tb.status[0]);

    if (dupeIds.includes(tb.id)) {
      blocker.hard.id = "ID-en som brukes av termdatabasen er brukt i en annen termdatabase";
    }

    // 2. planlagt or further
    if (statusNumber >= 2) {
      // soft
      if (!tb.staff) {
        blocker.soft.ansatt = "Ingen ansvarlig ansatt registrert i admin-appen";
      }
    }
    // 3. initialisert or further
    if (statusNumber >= 3) {
      // hard
      if (!tb.id) {
        blocker.hard.id = "Ingen termbase ID definiert i admin-appen";
      }
      // soft
      if (!tb.domain && statusNumber < 4) {
        blocker.soft.domain = "Ingen domene oppgitt i admin-appen";
      }
    }
    // 4. opprettet or further
    if (statusNumber >= 4) {
      // hard
      if (!tb.license) {
        blocker.hard.lisens = "Ingen lisens valgt i redigeringsapplikasjonen";
      }
      if (!tb.agreement || tb.agreement === "ingen") {
        blocker.hard.avtale = "Ingen avtale registrert i admin-appen";
      }
      if (!tb.labels) {
        blocker.hard.labels = "Termbasenavn er ikke godkjent i admin-appen";
      }
      if (!tb.descriptions) {
        blocker.hard.beskrivelser = "Termbasebeskrivelser er ikke godkjent i admin-appen";
      }
      if (tb.hasMissingDomain) {
        blocker.hard.domene = "Termbasen inneholder termpost(er) uten domene";
      }
    }

    if (Object.keys(blocker.hard).length > 0) {
      blocker.status = "hard";
    }
    else if (Object.keys(blocker.soft).length > 0) {
      blocker.status = "soft";
    }
  }
  else {
    blocker.hard.status = "No termbase status registered";
    blocker.status = "hard";
  }

  return blocker;
}
