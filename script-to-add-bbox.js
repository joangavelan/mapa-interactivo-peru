const fs = require('fs')
const turf = require('@turf/turf')

const inputFilePath = 'app/assets/district-data.json' // Path to your input JSON file
const outputFilePath = 'app/assets/territories/district-data-with-bbox.json' // Path for the output JSON file

// Read the input JSON file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading input file:', err)
    return
  }

  try {
    // Parse the input JSON data
    const geojson = JSON.parse(data)

    // Loop through each feature and add a 'bbox' property
    geojson.forEach((feature) => {
      const bbox = turf.bbox(feature.geometry)
      feature.properties.bbox = bbox
    })

    // Convert the modified GeoJSON to a JSON string
    const modifiedData = JSON.stringify(geojson) // Use null and 2 for pretty printing

    // Write the modified data to the output file
    fs.writeFile(outputFilePath, modifiedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing output file:', err)
        return
      }
      console.log('Bounding boxes added and saved to', outputFilePath)
    })
  } catch (err) {
    console.error('Error parsing or transforming data:', err)
  }
})
