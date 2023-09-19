import React from "react";
import mapboxgl from "mapbox-gl";
import { createListMap } from "../../utils/map_utils";

mapboxgl.accessToken = MAPBOX_TOKEN;

const { geojson } = BACKEND_DATA;

class HomeMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    this.initMap();
  }

  initMap = () => {
    const container = this.mapContainer.current;

    const routes = {};

    for (const feature of geojson.features) {
      routes[feature.properties.route_id] = feature.properties;
    }


    createListMap(container, geojson, routes);
  }

  render() {
    return (
      <div id="system_map" ref={this.mapContainer} className="map ml-4 h-full w-full" />
    );
  };
}

export default HomeMap;
