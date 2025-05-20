var bosses = {
  "type": "FeatureCollection",
  "features": [

//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Ridley",
      "room": "Ridley's Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [12672, -14080]
    }},
        
//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Draygon",
      "room": "Draygon's Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [16128, -7168]
    }},
        
//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Kraid",
      "room": "Kraid Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [13056, -9472]
    }},
        
//-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

    {
    "type": "Feature",
    "properties": {
      "boss": "Phantoon",
      "room": "Phantoon's Room"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [13168, -2432]
    }},
  ]
};

console.log("Loaded bosses.js:\nCount: " + bosses.features.length); 