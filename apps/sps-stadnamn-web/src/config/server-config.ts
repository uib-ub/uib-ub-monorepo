
const cadastreSort = ["_score", "adm1.keyword", "adm2.keyword", 
    {
      "cadastre.gnr": { // Adjusted to remove `.keyword` since `gnr` is an integer
        "order": "asc", // or "desc" depending on your requirement
        "mode": "min", // or "max", depending on how you want to sort multiple values within nested objects
        "missing": "_first", // or "_last", depending on how you want to handle missing values
        "nested": {
          "path": "cadastre" // Specify the path to the nested field
        }
      }
    },
    {
      "cadastre.bnr": { // Adjusted to remove `.keyword` since `bnr` is an integer
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
        case 'hord':
        case 'm1886':
        return cadastreSort
        default:
        return ["_score", "adm1.keyword", "adm2.keyword"]
    }
    }

