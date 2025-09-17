// script.js – Game script with leaderboard and user info

// Initialise the Leaflet map
var map = L.map('map').setView([43.7, -79.4], 10);
// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
// Points array
var points = [{"lat": 43.6532, "lng": -79.3832}, {"lat": 43.7615, "lng": -79.4111}, {"lat": 43.775, "lng": -79.2315}, {"lat": 43.654, "lng": -79.527}, {"lat": 43.589, "lng": -79.6441}, {"lat": 43.7315, "lng": -79.7624}, {"lat": 43.8561, "lng": -79.337}, {"lat": 43.8372, "lng": -79.5083}, {"lat": 43.9488, "lng": -79.4357}, {"lat": 43.4675, "lng": -79.6877}, {"lat": 43.3255, "lng": -79.799}, {"lat": 43.8971, "lng": -78.858}, {"lat": 43.8971, "lng": -78.8658}, {"lat": 43.8503, "lng": -79.024}, {"lat": 43.838, "lng": -79.0897}, {"lat": 44.0, "lng": -79.4661}, {"lat": 44.0592, "lng": -79.4612}, {"lat": 43.5184, "lng": -79.877}];
var markers = [];
var userRoute = [];
var routeLine = null;

points.forEach(function(pt) {
    var marker = L.marker([pt.lat, pt.lng]).addTo(map);
    marker.on('click', function() {
        if (userRoute.indexOf(pt) === -1) {
            userRoute.push(pt);
            updateRoute();
        }
    });
    markers.push(marker);
});

function updateRoute() {
    if (routeLine) map.removeLayer(routeLine);
    var latlngs = [];
    userRoute.forEach(function(pt) { latlngs.push([pt.lat, pt.lng]); });
    if (latlngs.length > 0) routeLine = L.polyline(latlngs, {color: 'blue'}).addTo(map);
}

function calculateDistance(route) {
    var distance = 0;
    for (var i = 0; i < route.length - 1; i++) {
        var a = L.latLng(route[i].lat, route[i].lng);
        var b = L.latLng(route[i+1].lat, route[i+1].lng);
        distance += a.distanceTo(b);
    }
    return distance;
}
function calcScore(distance) {
    return (distance > 0) ? Math.max(0, Math.floor(10000 / distance)) : 0;
}
function updateScoreDisplay(score) {
    document.getElementById('score').innerText = 'Score: ' + score;
}
function updateLeaderboardDisplay() {
    var lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    var list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    lb.forEach(function(entry) {
        var li = document.createElement('li');
        li.textContent = entry.name + ' (' + entry.phone + '): ' + entry.score;
        list.appendChild(li);
    });
}
function saveToLeaderboard(name, phone, score) {
    var lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    lb.push({name: name, phone: phone, score: score});
    lb.sort(function(a, b) {return b.score - a.score;});
    if (lb.length > 10) lb = lb.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(lb));
    updateLeaderboardDisplay();
}
// On load, show leaderboard
document.addEventListener('DOMContentLoaded', function() {
    updateLeaderboardDisplay();
});
// Finish button
document.getElementById('finishBtn').addEventListener('click', function() {
    if (userRoute.length < points.length) {
        alert('Please select all ' + points.length + ' locations before scoring. Selected: ' + userRoute.length);
        return;
    }
    var dist = calculateDistance(userRoute);
    var score = calcScore(dist);
    updateScoreDisplay(score);
    alert('Total distance: ' + Math.floor(dist) + ' meters. Score: ' + score);
    var name = prompt('Enter your name:');
    if (!name) return;
    var phone = prompt('Enter your cellphone number:');
    if (!phone) return;
    saveToLeaderboard(name, phone, score);
});
// Reset button
document.getElementById('resetBtn').addEventListener('click', function() {
    userRoute = [];
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    updateScoreDisplay(0);
});
