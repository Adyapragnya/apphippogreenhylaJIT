import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MapWithFullscreen = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      const fullscreenControl = L.control.fullscreen({
        position: 'topright',
        title: 'View Fullscreen',
        titleCancel: 'Exit Fullscreen',
      }).addTo(map);

      const resetViewControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd() {
          const container = L.DomUtil.create('div', 'leaflet-bar');
          const button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-reset-view', container);
          button.title = 'Reset View';
          button.innerHTML = '<i class="fas fa-sync-alt"></i>';
          L.DomEvent.on(button, 'click', () => map.setView([0, 0], 1.15)); // Reset view coordinates and zoom level
          return container;
        },
      });

      const resetControl = new resetViewControl();
      resetControl.addTo(map);

      // Set scale when entering or exiting fullscreen
      const onFullscreenChange = () => {
        if (document.fullscreenElement) {
          // Change the view/scale when entering fullscreen
          map.setView([0, 0], 2.5); // Set your desired latitude, longitude, and zoom level
        } else {
          // Reset the view when exiting fullscreen if needed
          map.setView([0, 0], 1); // Change this to your default view if desired
        }
      };

      document.addEventListener('fullscreenchange', onFullscreenChange);
      
      return () => {
        fullscreenControl.remove();
        resetControl.remove();
        document.removeEventListener('fullscreenchange', onFullscreenChange);
      };
    }
  }, [map]);

  return null;
};

export default MapWithFullscreen;