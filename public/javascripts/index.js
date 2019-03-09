mapboxgl.accessToken = 'pk.eyJ1IjoiaXJvc2VuYiIsImEiOiJFWjhEY0NVIn0.vLbckpy27jsele4bzz7x6Q';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9', 
  maxZoom: 12,
  minZoom: 1,
  zoom: 1
});

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, 
  flyTo: false, 
  placeholder: "Where you from?"
})

var resultId = ""

map.addControl(geocoder);

map.on('load', function() {
  map.addSource('locations', {
    type: "geojson", 
    data: "https://desolate-ridge-44158.herokuapp.com/locations.geojson",
    cluster: true, 
    clusterMaxZoom: 14, 
  })

  map.addLayer({
    id: 'clusters', 
    type: 'circle', 
    source: 'locations', 
    filter: ['has', 'point_count'], 
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        100,
        "#f1f075",
        750,
        "#f28cb1"
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        100,
        30,
        750,
        40
      ]
    }
  })

  map.addLayer({
    id: "cluster-count", 
    type: "symbol", 
    source: "locations",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    }
  })

  map.addLayer({
    id: 'unclustered-point', 
    type: 'circle', 
    source: "locations", 
    filter: ['!', ['has', 'point-count']],
    paint: {
      "circle-color": "#4D90FF",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff"
    }
  })

  map.on('click', 'clusters', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['clusters']})
    var clusterId = features[0].properties.cluster_id; 
    map.getSource('locations').getClusterExpansionZoom(clusterId, function(err, zoom) {
      if (err) {
        return; 
      }

      map.easeTo({
        center: features[0].geometry.coordinates, 
        zoom: zoom
      })
    })
  })

  map.on('mouseenter', 'clusters', function() {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = '';
  });

})

geocoder.on('result', function(ev) {
  if (resultId === ev.result.id) {
    return; 
  }

  resultId = ev.result.id 
  var el = document.createElement('div');
  el.className = "marker"; 
  console.log(ev.result);
  new mapboxgl.Marker(el)
    .setLngLat(ev.result.geometry.coordinates)
    .addTo(map)

  var url = "https://desolate-ridge-44158.herokuapp.com/location"
  var data = {
    latitude: ev.result.geometry.coordinates[0],
    longitude: ev.result.geometry.coordinates[1]
  }
  console.log(data);
  var params = {
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
    method: "POST"
  }

  fetch(url, params)
    .then(res => { console.log(res) })
})
