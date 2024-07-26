
const cadastreSort = ["_score", "adm1.keyword", "adm2.keyword", 
    {
      "cadastre.gnr": {
        "order": "asc", // or "desc" depending on your requirement
        "mode": "min", // or "max", depending on how you want to sort multiple values within nested objects
        "missing": "_last", // or "_last", depending on how you want to handle missing values
        "nested": {
          "path": "cadastre" // Specify the path to the nested field
        }
      }
    },
    {
      "cadastre.bnr": { 
        "order": "asc", // or "desc", depending on your requirement
        "mode": "min", // or "max", depending on how you want to sort multiple values within nested objects
        "missing": "_first", // or "_last", depending on how you want to handle missing values
        "nested": {
          "path": "cadastre" // Specify the path to the nested field
        }
      }
    }

  ]


export const getSortArray = (dataset: string) => {
    switch (dataset) {
        case 'search':
          return ["_score", "adm1.keyword", "adm2.keyword"] // add "ranking"
        case 'hord':
        case 'bsn':
        case 'm1886':
        return cadastreSort
        case 'leks_g':
            return ["_score"]
        case 'm1838':
            return ["_score", "cadastreSort.mnr", "cadastreSort.mnrLetter", "cadastreSort.lnr", "cadastreSort.lnrLetter"]
        default:
        return ["_score", "adm1.keyword", "adm2.keyword"]
    }
    }

