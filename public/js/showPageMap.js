mapboxgl.accessToken = mapboxToken  // in "show.ejs"

// make a map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
})

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl())

// marker on the map
new mapboxgl.Marker()   // make a marker
    .setLngLat(campground.geometry.coordinates) // set coordinates (longitude and latitude)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )   // set popup on the marker
    .addTo(map) // add marker to map
