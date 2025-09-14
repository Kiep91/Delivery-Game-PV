// Delivery Route Master starter code
var map = L.map('map').setView([0, 0], 2);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Data structure for points
var points = [];
var markers = [];
var routeLine = null;

// Function to update score display
function updateScore(distance) {
    // Simple scoring: lower distance means higher score
    var score = (distance > 0) ? Math.max(0, Math.floor(10000 / distance)) : 0;
    document.getElementById('score').innerText = 'Score: ' + score;
}

// Nearest Neighbor TSP heuristic
function computeRoute(startLatLng) {
    if (points.length === 0) return [];
    var unvisited = points.slice();
    var route = [];
    var current = startLatLng;
    while (unvisited.length > 0) {
        // find nearest neighbor
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

// Function to draw the route on the map
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
    // Calculate distance
    var distance = 0;
    for (var i = 0; i < latlngs.length-1; i++) {
        var a = L.latLng(latlngs[i][0], latlngs[i][1]);
        var b = L.latLng(latlngs[i+1][0], latlngs[i+1][1]);
        distance += a.distanceTo(b);
    }
    updateScore(distance);
}

// Map click event: add marker and ask for attributes
map.on('click', function(e) {
    var urgency = prompt('Enter package urgency (low/medium/high):', 'low');
    if (urgency === null) return; // cancelled
    var size = prompt('Enter package size (small/medium/large):', 'small');
    if (size === null) return;
    var marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup('Urgency: ' + urgency + '<br>Size: ' + size);
    markers.push(marker);
    points.push({lat: e.latlng.lat, lng: e.latlng.lng, urgency: urgency, size: size});
});

// Optimize button: compute and draw route from map center or first point
document.getElementById('optimizeBtn').addEventListener('click', function() {
    // Starting location: first point or map center if none
    var startLatLng;
    if (points.length > 0) {
        startLatLng = L.latLng(points[0].lat, points[0].lng);
    } else {
        startLatLng = map.getCenter();
    }
    // Copy points excluding starting point if included in list
    var listForRoute = points.slice();
    // If first point included, remove it from list
    if (listForRoute.length > 0 && listForRoute[0].lat === startLatLng.lat && listForRoute[0].lng === startLatLng.lng) {
        listForRoute.splice(0,1);
    }
    var route = computeRoute(startLatLng);
    drawRoute(route, startLatLng);
});
