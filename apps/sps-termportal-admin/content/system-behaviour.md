## System Behavior Specification

### Lazy Localization

Some labels in the frontend are lazily localized. They are fetched at
runtime from the database (based on _redigeringsapplikasjonen_) instead of
being defined in the frontend codebase.

This applies to the following data:

- Termbase labels
- Conceptual domain labels

The frontend has a fallback mechanism for displaying labels when there
is no match for the current locale. The language fallback order is
itself localized and as follows:

- nb: nb -> nn -> en
- nn: nn -> nb -> en
- en: en -> nb -> nn

If a termbase is not supposed to have a translated English name, the
field should be left empty so that the frontend can handle falling
back to other versions.

### Conceptual domain publishing

Conceptual domains are maintained in the _redigeringsapplikasjon_ in a
separate namespace:
[DOMENE](https://wiki.terminologi.no/index.php?title=DOMENE:DOMENE){:target="\_blank"}.
They are fetched at runtime by the frontend. A visualization of the
domain hierarchy can be found on the page for the
[topdomain](https://wiki.terminologi.no/index.php?title=DOMENE:Toppdomene){:target="\_blank"}.

Only domains that have associated concept data should be set to
"published". Empty domains can be created, linked, and described, but
should remain unpublished for the time being.
