// utils/geoUtils.js

function checkIfInsideGeofence(lat1, lon1, centerLat, centerLon, radiusMeters) {
    const toRadians = (degree) => (degree * Math.PI) / 180;
  
    const earthRadius = 6371000; // meters
    const dLat = toRadians(centerLat - lat1);
    const dLon = toRadians(centerLon - lon1);
  
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(centerLat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = earthRadius * c;
  
    return distance <= radiusMeters; // ✅ true if inside, false if outside
  }
  
  module.exports = { checkIfInsideGeofence };
  