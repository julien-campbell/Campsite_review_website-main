mapboxgl.accessToken = mapToken;                                 //using my account's map. mapToken can be found in show.ejs

const map = new mapboxgl.Map({                                  //creates map for desinated page
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',                //Stylesheet location
    center: campground.geometry.coordinates,                    //starting position [lang, lat]
    zoom: 5                                                   //starting zoom
});
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');       //creates button for zooming in and out. Places this control in the bottom left corner.


new mapboxgl.Marker()                                           //creates marker
    .setLngLat(campground.geometry.coordinates)           //location of the marker
    .setPopup(                                                  //creates a pop up when the marker is clicked
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )

    )
    .addTo(map)                                                 //adds the marker to the location