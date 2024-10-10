import { MetadataRoute } from 'next'
import { datasetTitles } from '@/config/metadata-config'
 
export default function sitemap(): MetadataRoute.Sitemap {
    
    const metaPages = [
        {
            url: 'https://stadnamnportalen.uib.no/',
            priority: 1
        },
        {
            url: 'https://stadnamnportalen.uib.no/info',
            priority: 1
        },
        {
            url: 'https://stadnamnportalen.uib.no/help',
            priority: 0.9
        },
        {
            url: 'https://stadnamnportalen.uib.no/feedback',
            priority: 0.9
        },

        {
            url: 'https://stadnamnportalen.uib.no/datasets',
            priority: 0.9
        }
    ]
    
    const datasets = Object.keys(datasetTitles).map((dataset) => {
        return {
            url: `https://stadnamnportalen.uib.no/view/${dataset}/info`,
            priority: dataset == 'search' ? 1 : dataset.includes('_') ? 0.5 : 0.7,

        }
    }
    )

    return metaPages.concat(datasets)
}