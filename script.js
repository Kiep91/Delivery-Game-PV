// script.js – Updated for manual route selection by the user

// Initialise the Leaflet map and set a default view centred around the GTA
var map = L.map('map').setView([43.7, -79.4], 10);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

// Data structure for points: 18 fixed locations with predefined urgency and size
var points = [{"lat": 43.6532, "lng": -79.3832, "urgency": "medium", "size": "medium"}, {"lat": 43.7615, "lng": -79.4111, "urgency": "low", "size": "small"}, {"lat": 43.775, "lng": -79.2315, "urgency": "high", "size": "large"}, {"lat": 43.654, "lng": -79.527, "urgency": "medium", "size": "small"}, {"lat": 43.589, "lng": -79.6441, "urgency": "low", "size": "medium"}, {"lat": 43.7315, "lng": -79.7624, "urgency": "high", "size": "medium"}, {"lat": 43.8561, "lng": -79.337, "urgency": "medium", "size": "large"}, {"lat": 43.8372, "lng": -79.5083, "urgency": "low", "size": "small"}, {"lat": 43.9488, "lng": -79.4357, "urgency": "high", "size": "medium"}, {"lat": 43.4675, "lng": -79.6877, "urgency": "medium", "size": "large"}, {"lat": 43.3255, "lng": -79.799, "urgency": "low", "size": "small"}, {"lat": 43.8971, "lng": -78.858, "urgency": "high", "size": "medium"}, {"lat": 43.8971, "lng": -78.8658, "urgency": "medium", "size": "medium"}, {"lat": 43.8503, "lng": -79.024, "urgency": "low", "size": "small"}, {"lat": 43.838, "lng": -79.0897, "urgency": "high", "size": "large"}, {"lat": 44.0, "lng": -79.4661, "urgency": "medium", "size": "medium"}, {"lat": 44.0592, "lng": -79.4612, "urgency": "low", "size": "medium"}, {"lat": 43.5184, "lng": -79.877, "urgency": "high", "size": "small"}];
var markers = [];
var userRoute = [];
var routeLine = null;

// Populate the map with predefined markers and set up click to select
points.forEach(function(pt) {
    var marker = L.marker([pt.lat, pt.lng]).addTo(map);
    marker.bindPopup('Urgency: ' + pt.urgency + '<br>Size: ' + pt.size);
    marker.on('click', function() {
        if (userRoute.indexOf(pt) === -1) {
            userRoute.push(pt);
            updateRoute();
        }
    });
    markers.push(marker);
});

// Function to draw the current route and update score if applicable
function updateRoute() {
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    var latlngs = [];
    userRoute.forEach(function(pt) { latlngs.push([pt.lat, pt.lng]); });
    if (latlngs.length > 0) {
        routeLine = L.polyline(latlngs, {color: 'blue'}).addTo(map);
    }
}

// Function to calculate distance of an array of points and update score
function calculateDistance(route) {
    var distance = 0;
    for (var i = 0; i < route.length - 1; i++) {
        var a = L.latLng(route[i].lat, route[i].lng);
        var b = L.latLng(route[i+1].lat, route[i+1].lng);
        distance += a.distanceTo(b);
    }
    return distance;
}

function updateScore(distance) {
    var score = (distance > 0) ? Math.max(0, Math.floor(10000 / distance)) : 0;
    document.getElementById('score').innerText = 'Score: ' + score;
}

// Finish Route button: calculate total distance and update score
document.getElementById('finishBtn').addEventListener('click', function() {
    var distance = calculateDistance(userRoute);
    updateScore(distance);
    alert('Total distance: ' + Math.floor(distance) + ' meters.');
});
