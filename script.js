// script.js – Updated to use 18 fixed delivery locations within the Greater Toronto Area

// Initialise the Leaflet map and set a default view centred around the GTA
var map = L.map('map').setView([43.7, -79.4], 10);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Data structure for points: 18 fixed locations with predefined urgency and size
var points = [{"lat": 43.6532, "lng": -79.3832, "urgency": "medium", "size": "medium"}, {"lat": 43.7615, "lng": -79.4111, "urgency": "low", "size": "small"}, {"lat": 43.775, "lng": -79.2315, "urgency": "high", "size": "large"}, {"lat": 43.654, "lng": -79.527, "urgency": "medium", "size": "small"}, {"lat": 43.589, "lng": -79.6441, "urgency": "low", "size": "medium"}, {"lat": 43.7315, "lng": -79.7624, "urgency": "high", "size": "medium"}, {"lat": 43.8561, "lng": -79.337, "urgency": "medium", "size": "large"}, {"lat": 43.8372, "lng": -79.5083, "urgency": "low", "size": "small"}, {"lat": 43.9488, "lng": -79.4357, "urgency": "high", "size": "medium"}, {"lat": 43.4675, "lng": -79.6877, "urgency": "medium", "size": "large"}, {"lat": 43.3255, "lng": -79.799, "urgency": "low", "size": "small"}, {"lat": 43.8971, "lng": -78.858, "urgency": "high", "size": "medium"}, {"lat": 43.8971, "lng": -78.8658, "urgency": "medium", "size": "medium"}, {"lat": 43.8503, "lng": -79.024, "urgency": "low", "size": "small"}, {"lat": 43.838, "lng": -79.0897, "urgency": "high", "size": "large"}, {"lat": 44.0, "lng": -79.4661, "urgency": "medium", "size": "medium"}, {"lat": 44.0592, "lng": -79.4612, "urgency": "low", "size": "medium"}, {"lat": 43.5184, "lng": -79.877, "urgency": "high", "size": "small"}];
var markers = [];
var routeLine = null;

// Populate the map with predefined markers
points.forEach(function(pt) {
    var marker = L.marker([pt.lat, pt.lng]).addTo(map);
    marker.bindPopup('Urgency: ' + pt.urgency + '<br>Size: ' + pt.size);
    markers.push(marker);
});

// Function to update the score display
function updateScore(distance) {
    var score = (distance > 0) ? Math.max(0, Math.floor(10000 / distance)) : 0;
    document.getElementById('score').innerText = 'Score: ' + score;
}

// Nearest Neighbour heuristic TSP solver
function computeRoute(startLatLng) {
    if (points.length === 0) return [];
    var unvisited = points.slice();
    var route = [];
    var current = startLatLng;
    while (unvisited.length > 0) {
        var nearestIndex = 0;
        var nearestDist = current.distanceTo(L.latLng(unvisited[0].lat, unvisited[0].lng));
        for (var i = 1; i < unvisited.length; i++) {
            var d = current.distanceTo(L.latLng(unvisited[i].lat, unvisited[i].lng));
            if (d < nearestDist) {
                nearestDist = d;
                nearestIndex = i;
            }
        }
        var next = unvisited.splice(nearestIndex, 1)[0];
        route.push(next);
        current = L.latLng(next.lat, next.lng);
    }
    return route;
}

// Draw the computed route onto the map and update the score
function drawRoute(route, startLatLng) {
    var latlngs = [];
    latlngs.push(startLatLng);
    route.forEach(function(pt) {
        latlngs.push([pt.lat, pt.lng]);
    });
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    routeLine = L.polyline(latlngs, {color: 'blue'}).addTo(map);
    var distance = 0;
    for (var i = 0; i < latlngs.length-1; i++) {
        var a = L.latLng(latlngs[i][0], latlngs[i][1]);
        var b = L.latLng(latlngs[i+1][0], latlngs[i+1][1]);
        distance += a.distanceTo(b);
    }
    updateScore(distance);
}

// Hook up the Optimize button: start at the first point or map centre
document.getElementById('optimizeBtn').addEventListener('click', function() {
    var startLatLng;
    if (points.length > 0) {
        startLatLng = L.latLng(points[0].lat, points[0].lng);
    } else {
        startLatLng = map.getCenter();
    }
    var route = computeRoute(startLatLng);
    drawRoute(route, startLatLng);
});
