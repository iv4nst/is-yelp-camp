mapboxgl.accessToken = mapboxToken  // from index.ejs

// make a map
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-103.5917, 40.6699],
    zoom: 3
})

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl())

// on map load
map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    })

    // clusters
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#00BCD4',
                10,        // step
                '#2196F3',
                30,        // step
                '#3F51B5'
            ],
            'circle-radius': [  // size of the circle and color of the circle depending on the number of points in it
                'step',
                ['get', 'point_count'],
                15, // size
                10, // step
                20, // size
                30, // step
                25  // size
            ]
        }
    })

    // number (count) of things in the cluster
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    })

    // unclustered point (single point)
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],  // where there is no point count
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    })

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {layers: ['clusters']})
        const clusterId = features[0].properties.cluster_id
        map.getSource('campgrounds').getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return

                // center to the clicked cluster
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                })
            }
        )
    })

    // clicking on an unclustered-point (not grouped), open a popup
    map.on('click', 'unclustered-point', (e) => {
        const {popupMarkup} = e.features[0].properties
        const coordinates = e.features[0].geometry.coordinates.slice()

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        // popup
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupMarkup)
            .addTo(map)
    })

    // mouse enter (hover) on a cluster
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
    })
    // mouse leave from a cluster
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
    })
})
