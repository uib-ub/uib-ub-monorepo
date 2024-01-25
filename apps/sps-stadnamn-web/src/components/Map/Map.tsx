import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

// Set default sizing to control aspect ratio which will scale responsively
// but also help avoid layout shift

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;

const Map = (props) => {

  useEffect(() => {
    // Check if the bounds are initialized
    if (bounds) {
      // Fetch data based on the new bounds
      fetch('https://search.testdu.uib.no/search/stadnamn-hord-demo/_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          
        },
        body: JSON.stringify({
          size: 200,
          query: {
            bool: {
              must: [
                {
                  geo_bounding_box: {
                    "geometry": {
                      top_left: {
                        lat: bounds.getNorthEast().lat,
                        lon: bounds.getSouthWest().lng
                      },
                      bottom_right: {
                        lat: bounds.getSouthWest().lat,
                        lon: bounds.getNorthEast().lng
                      }
                    }
                  }
                },
                ...nameQuery ? [{
                    simple_query_string: {
                      query: nameQuery,
                      fields: ["name"],
                      default_operator: "and"
                    
                  }
                }] : []
              ]
            }
          }
        })
      })
      .then(response => response.json())
      .then(data => {

        console.log(data)
        
        setMarkers(data.hits.hits)})
      .catch(error => console.error('Error:', error));
    }
  }, [bounds, nameQuery]);



  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = props;
  return (
    <div style={{ aspectRatio: width / height }}>
      <DynamicMap {...props} />
    </div>
  )
}

export default Map;