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
        "key": "rawData.merknader",
        "label": "Merknader"
        },
        {
        "key": "rawData.knr",
        "label": "Kommunenummer"
        },
        {
        "key": "rawData.gnr",
        "label": "Gardsnummer"
        },
        {
        "key": "rawData.bnr",
        "label": "Bruksnummer",
        },
        {
        "key": "cadastre",
        "nested": [
            {
            "key": "gnr",
            "label": "Gardsnummer",
            "type": "integer"
            },
            {
            "key": "bnr",
            "label": "Bruksnummer",
            "type": "integer"
            }

        ]
    },
        {
        "key": "rawData.gnidu",
        "label": "GNIDu"
        }
    ]
}


export default m1886;

