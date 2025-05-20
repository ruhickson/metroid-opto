var miniBosses = {
  "type": "FeatureCollection",
  "features": [

//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Botwoon",
      "room": "Botwoon's Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [12288, -6784]
    }},
        
//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Crocomire",
      "room": "Crocomire's Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [10752, -12416]
    }},
        
//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Spore Spawn",
      "room": "Spore Spawn Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [4480, -5248]
    }},
  ]
};

console.log("Loaded miniBosses.js:\nCount: " + miniBosses.features.length); 