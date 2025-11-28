import { MetadataRoute } from 'next'
import { datasetTitles } from '@/config/metadata-config'
 
export default function sitemap(): MetadataRoute.Sitemap {
    
    const metaPages = [
        {
            url: 'https://stadnamn.no/',
            priority: 1
        },
        {
            url: 'https://stadnamn.no/info',
            priority: 1
        },
        {
            url: 'https://stadnamn.no/help',
            priority: 0.9
        },
        {
            url: 'https://stadnamn.no/feedback',
            priority: 0.9
        },

        {
            url: 'https://stadnamn.no/datasets',
            priority: 0.9
        }
    ]
    
    const datasets = Object.keys(datasetTitles).map((dataset) => {
        return {
            url: `https://stadnamn.no/info/datasets/${dataset}`,
            priority: ["ssr", "ssr2016", "geonames", "wikidata"].includes(dataset) ? 0.5 : 0.9,

        }
    }
    )

    return metaPages.concat(datasets)
}