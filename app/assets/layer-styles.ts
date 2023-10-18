import type { LayerProps } from 'react-map-gl'

export const territories_outline: LayerProps = {
  id: 'territories_outline',
  type: 'line',
  source: 'territories_data',
  paint: {
    'line-width': 2,
    'line-color': '#ccc'
  }
}
