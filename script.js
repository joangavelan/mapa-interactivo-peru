const fs = require('fs')

const inputFilePath = 'app/assets/territories/regions.json' // Path to your input JSON file
const outputFilePath = 'app/assets/territories/regions-2.json' // Path for the output JSON file

// Read the input JSON file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading input file:', err)
    return
  }

  try {
    // Parse the input JSON data
    const geojson = JSON.parse(data)

    // Loop through each feature to modify its data
    const modified_geojson = geojson.map(
      ({ type, properties: { id, name, bbox, centroid }, geometry }) => {
        return {
          type,
          bbox,
          properties: { id, name, centroid },
          geometry
        }
      }
    )

    // Convert the modified GeoJSON to a JSON string
    const modifiedData = JSON.stringify(modified_geojson)

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
