import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapWithMarkers from './MapWithMarkers';
import MapWithFullscreen from './MapWithFullscreen';
import 'leaflet/dist/leaflet.css';

const MyMapComponent = ({ vessels,  center, selectedVessel }) => (

  

  <MapContainer
    center={center}
    zoom={1}
    minZoom={1.25}
    maxZoom={15}
    maxBounds={[[85, -180], [-85, 180]]}
    maxBoundsViscosity={8}
    style={{ height: '500px', width: '100%', backgroundColor: 'rgba(170,211,223,255)' }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap />
    <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />

    <MapWithFullscreen />
  </MapContainer>
);

MyMapComponent.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      SpireTransportType: PropTypes.string,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      speed: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
    })
  ).isRequired,
  zoom: PropTypes.number.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedVessel: PropTypes.shape({
    SpireTransportType: PropTypes.string,
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    speed: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
    eta: PropTypes.string,
    destination: PropTypes.string,
  }),
};

export default MyMapComponent;