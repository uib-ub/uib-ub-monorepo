import { cadastreSort } from '@/config/server-config';

const m1886 = {
    defaultSort: cadastreSort,
    fields: [
        {
        "key": "label",
        "label": "Stadnamn"
        },
        {
        "key": "adm2",
        "label": "Kommune"
        },
        {
        "key": "adm1",
        "label": "Fylke"
        },
        {
        "key": "sosi",
        "label": "Lokalitetstype",
        },
        {
        "key": "rawData.knr",
        "label": "Kommunenummer"
        },
        {
        "key": "cadastre.gnr",
        "label": "Gardsnummer"
        },
        {
        "key": "cadastre.bnr",
        "label": "Bruksnummer"
        },
        {
        "key": "rawData.gnidu",
        "label": "GNIDu"

        }
    ]
}


export default m1886;

