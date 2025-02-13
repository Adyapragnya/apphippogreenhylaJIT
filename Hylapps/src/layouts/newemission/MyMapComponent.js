import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MyMapComponent.css';
import './Popup.css';
import MapWithPorts from './MapWithPorts';


const createCustomIcon = (heading, width, height, iconType, isPort = false) => {
  if (isPort) {
    return L.divIcon({
      className: 'custom-icon port-icon',
      html: `<div style="width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center;">
               <img src="/anchor-icon.png" style="width: 100%; height: 100%;" />
             </div>`,
      iconSize: [width, height],
    });
  }

  if (iconType === 'point') {
    return L.divIcon({
      className: 'custom-icon blinking-icon',
      html: `<div style="width: ${width}px; height: ${height}px; background-color: red; border-radius: 50%;"></div>`,
      iconSize: [width, height],
    });
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg); width: ${width}px; height: ${height}px;">
             <img src="/ship-popup.png" style="width: 100%; height: 100%;" />
           </div>`,
    iconSize: [width, height],
  });
};



const getIconForZoom = (zoom, isSelected) => {
  const sizeMultiplier = isSelected ? 1.5 : 1;
  if (zoom > 23) return { width: 35 * sizeMultiplier, height: 60 * sizeMultiplier, type: 'extra-large' };
  if (zoom > 15) return { width: 25 * sizeMultiplier, height: 50 * sizeMultiplier, type: 'large' };
  if (zoom > 14.75) return { width: 19 * sizeMultiplier, height: 45 * sizeMultiplier, type: 'medium' };
  if (zoom > 13.75) return { width: 15 * sizeMultiplier, height: 35 * sizeMultiplier, type: 'small' };
  if (zoom > 12.75) return { width: 15 * sizeMultiplier, height: 30 * sizeMultiplier, type: 'small' };
  if (zoom > 11.5) return { width: 10 * sizeMultiplier, height: 25 * sizeMultiplier, type: 'small' };
  if (zoom > 10.75) return { width: 10 * sizeMultiplier, height: 20 * sizeMultiplier, type: 'small' };
  if (zoom > 9.75) return { width: 10 * sizeMultiplier, height: 15 * sizeMultiplier, type: 'small' };
  if (zoom > 8.75) return { width: 7 * sizeMultiplier, height: 10 * sizeMultiplier, type: 'small' };
  if (zoom > 7.75) return { width: 7 * sizeMultiplier, height: 7 * sizeMultiplier, type: 'point' };
  if (zoom > 6) return { width: 7 * sizeMultiplier, height: 7 * sizeMultiplier, type: 'point' };
  return { width: 6 * sizeMultiplier, height: 6 * sizeMultiplier, type: 'point' };
};

const MyMapComponent = ({ selectedVessel, selectedPort, style }) => {
  const mapRef = useRef(null);
  
  const [iconSize, setIconSize] = useState(getIconForZoom(5, false));
  
  const [shouldFitBounds, setShouldFitBounds] = useState(false);



  useEffect(() => {
  if (mapRef.current) {
    setTimeout(() => {
      const map = mapRef.current;
      map.invalidateSize();
      map.setZoom(map.getZoom() + 0.1);
      map.setZoom(map.getZoom() - 0.1);
    }, 500);
  }
}, []);


useEffect(() => {
  const map = mapRef.current;
  if (map && selectedVessel?.AIS?.LATITUDE && selectedVessel?.AIS?.LONGITUDE) {
    map.flyTo(
      [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE],
      4,
      { duration: 1 }
    );
  } else if (map) {
    map.setView([0, 0], 2);
  }
}, [selectedVessel]);




// useEffect(() => {
//   const map = mapRef.current;
  
//   if (!map) return; // Ensure map is initialized
  
//   if (selectedVessel && selectedPort) {
//     const vesselCoords = [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE];
//     const portCoords = [selectedPort.lat, selectedPort.long];

//     setTimeout(() => {
//       const bounds = L.latLngBounds([vesselCoords, portCoords]);
//       map.fitBounds(bounds, { padding: [50, 50] });
//     }, 500); 
//   } else if (selectedVessel) {
//     map.flyTo([selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE], 7, { duration: 1 });
//   } else if (selectedPort) {
//     map.flyTo([selectedPort.lat, selectedPort.long], 7, { duration: 1 });
//   }
// }, [selectedVessel, selectedPort]);


// useEffect(() => {
//   console.log(selectedVessel);
//   console.log(selectedPort);
//   if (mapRef.current) {
//     setTimeout(() => {
//       mapRef.current.invalidateSize();
//     }, 500);
//   }
// }, [selectedVessel, selectedPort]);


useEffect(() => {
  if (selectedVessel && selectedPort) {
    setTimeout(() => {
      setShouldFitBounds(true);
    }, 500);
  }
}, [selectedVessel, selectedPort]);

useEffect(() => {
  const map = mapRef.current;
  if (map && shouldFitBounds) {
    const vesselCoords = [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE];
    const portCoords = [selectedPort.lat, selectedPort.long];

    const bounds = L.latLngBounds([vesselCoords, portCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });
    setShouldFitBounds(false); // Reset state
  }
}, [shouldFitBounds]);


  // Resize map when window size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const map = mapRef.current;
      if (map) {
        map.invalidateSize();
      }
    });

    const mapContainer = document.querySelector('.map-card');
    if (mapContainer) {
      resizeObserver.observe(mapContainer);
    }

    return () => {
      if (mapContainer) {
        resizeObserver.unobserve(mapContainer);
      }
    };
  }, []);

  return (
    <div className="">
   
      <div className="map-card" style={{ flex: '1', ...style }}>
        <div className="card" style={{ borderRadius: '6px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}>
          <MapContainer
            center={[0, 0]}
            zoom={5}
            minZoom={1.5}
            maxZoom={15}
            maxBounds={[[90, -180], [-90, 180]]}
            maxBoundsViscosity={5}
            whenCreated={(map) => mapRef.current = map} // Save the map instance
            style={{ height: '567px', width: '100%', backgroundColor: 'rgba(170,211,223,255)' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true} />
            {selectedVessel && (
            
                          <Marker
                position={[selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE]}
                icon={createCustomIcon(selectedVessel.AIS.HEADING, iconSize.width, iconSize.height, iconSize.type)}
                eventHandlers={{
                  click: (e) => {
                    const map = mapRef.current;
                    if (map) {
                      map.flyTo([selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE], 7, {
                        duration: 1,
                      });
                      e.target.openPopup();
                    }
                  },
                }}
              >

              <Popup>
                <div className="popup-container">
                  <div className="popup-header">
                    <h3 className="popup-title">
                      {selectedVessel.AIS.NAME || '-'} 
                      <span className="popup-imo">{selectedVessel.AIS.IMO || '-'}</span>
                    </h3>
                  </div>
                  <div className="popup-details">
                    <div className="popup-detail">
                      <strong>TYPE :</strong><span className="popup-value time">{selectedVessel.SpireTransportType || '-'}</span>
                    </div>
                    <div className="popup-detail">
                      <span className="popup-value">{selectedVessel.AIS.HEADING ? `${selectedVessel.AIS.HEADING}°` : '-'} | {selectedVessel.AIS.SPEED ? `${selectedVessel.AIS.SPEED} kn` : '-'}</span>
                    </div>
                    <div className="popup-detail">
                      <strong>DESTN :</strong><span className="popup-value time">{selectedVessel.AIS.DESTINATION || '-'}</span>
                    </div>
                    <div className="popup-detail">
                      <strong>ETA :</strong><span className="popup-value time">{selectedVessel.AIS.ETA || '-'}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            )}

            {selectedPort && selectedPort.lat && selectedPort.long && (
  <Marker
    position={[selectedPort.lat, selectedPort.long]}
    icon={createCustomIcon(0, 20, 20, 'point', true)}
    eventHandlers={{
      click: (e) => {
        const map = mapRef.current;
        if (map) {
          map.flyTo([selectedPort.lat, selectedPort.long], 7, { duration: 1 });
          e.target.openPopup();
        }
      },
    }}
  >
  <Popup>
    <div className="popup-container">
      <h3>{selectedPort.name || '-'}</h3>
      <p><strong>UNLOCODE:</strong> {selectedPort.UNLOCODE || '-'}</p>
    </div>
  </Popup>
</Marker>
    
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

MyMapComponent.propTypes = {
  selectedVessel: PropTypes.shape({
    SpireTransportType: PropTypes.string,
    AIS: PropTypes.shape({
      NAME: PropTypes.string,
      IMO: PropTypes.string,
      CALLSIGN: PropTypes.string,
      SPEED: PropTypes.number,
      DESTINATION: PropTypes.string,
      SpireTransportType: PropTypes.string,
      LATITUDE: PropTypes.number,
      LONGITUDE: PropTypes.number,
      HEADING: PropTypes.number,
      ETA: PropTypes.string,
      TIMESTAMP: PropTypes.string,
    }),
  }),
  selectedPort: PropTypes.shape({
    name: PropTypes.string,
    lat: PropTypes.number,
    long: PropTypes.number,
    UNLOCODE:  PropTypes.string,
    isActive: PropTypes.bool
  }),
  style: PropTypes.object,
};

export default MyMapComponent;
