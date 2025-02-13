import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const DrawTool = ({ selectedFeatureGroup, onGeofenceEdited, onGeofenceDeleted }) => {
  const map = useMap();

  // useEffect(() => {
  //   if (!map) return;

  //   // 🛑 Disable built-in delete
  //   const drawControl = new L.Control.Draw({
  //     draw: false,
      
  //   });

  //   map.addControl(drawControl);

  //   map.on(L.Draw.Event.EDITED, (event) => {
  //     event.layers.eachLayer((layer) => {
  //       let updatedGeofence = {
  //         geofenceId: layer.options.geofenceId || Math.random().toString(36).substr(2, 9),
  //         geofenceName: layer.options.geofenceName || 'Edited Geofence',
  //         geofenceType: layer.options.geofenceType || '',
  //         coordinates: [],
  //       };

  //       if (layer instanceof L.Polygon || layer instanceof L.Polyline || layer instanceof L.Rectangle) {
  //         const latLngs = layer.getLatLngs();
  //         const coordinates = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
  //         updatedGeofence.coordinates = coordinates.map((latLng) => ({
  //           lat: latLng.lng,
  //           lng: latLng.lat,
  //         }));
  //         updatedGeofence.geofenceType = layer instanceof L.Polygon ? 'Polygon' : 'Line';
  //       } else if (layer instanceof L.Circle) {
  //         const center = layer.getLatLng();
  //         updatedGeofence.coordinates = [
  //           { lat: center.lat, lng: center.lng, radius: layer.getRadius() },
  //         ];
  //         updatedGeofence.geofenceType = 'Circle';
  //       }

  //       onGeofenceEdited(updatedGeofence);
  //     });
  //   });

  //   return () => {
  //     map.removeControl(drawControl);
  //     map.off(L.Draw.Event.EDITED);
  //   };
  // }, [map, selectedFeatureGroup, onGeofenceEdited]);

  useEffect(() => {
    if (!map) return;

    // Custom delete button
    const DeleteButton = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        btn.innerHTML = '🗑️'; // Trash icon
        btn.style.backgroundColor = 'white';
        btn.style.padding = '7px';
        btn.style.border = '1px solid gray';
        btn.style.cursor = 'pointer';

        btn.onclick = function () {
          if (selectedFeatureGroup.getLayers().length === 0) {
            Swal.fire('No Geofence Selected', 'Please select a geofence to delete.', 'info');
            return;
          }

          Swal.fire({
            title: 'Delete Selected Geofence?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
          }).then((result) => {
            if (result.isConfirmed) {
              selectedFeatureGroup.eachLayer((layer) => {
                onGeofenceDeleted(layer.options.geofenceId);
                selectedFeatureGroup.removeLayer(layer);
              });

              Swal.fire('Deleted!', 'Geofence has been removed.', 'success');
            }
          });
        };

        return btn;
      },
    });

    const EditSaveControl = L.Control.extend({
      options: { position: 'topleft' },
    
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    
        // Edit Button
        const editBtn = L.DomUtil.create('button', '', container);
        editBtn.innerHTML = '✏️';
        editBtn.style.backgroundColor = 'white';
        editBtn.style.padding = '6px';
        editBtn.style.border = '1px solid gray';
        editBtn.style.cursor = 'pointer';
  

        // Save Button (Initially Hidden)
        const saveBtn = L.DomUtil.create('button', '', container);
        saveBtn.innerHTML = '💾';
        saveBtn.style.backgroundColor = 'white';
        saveBtn.style.padding = '6px';
        saveBtn.style.border = '1px solid gray';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.display = 'none';
    
        // Edit Click Event
        editBtn.onclick = function () {
          if (selectedFeatureGroup.getLayers().length === 0) {
            Swal.fire('No Geofence Selected', 'Please select a geofence to edit.', 'info');
            return;
          }
    
          selectedFeatureGroup.eachLayer((layer) => {
            if (layer.editing) layer.editing.enable();
          });
    
          saveBtn.style.display = 'inline-block'; // Show Save Button
        };
    
        // Save Click Event
        saveBtn.onclick = function () {
          Swal.fire({
            title: 'Save Changes',
            text: 'Do you want to save the updated geofence?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Save it!',
          }).then((result) => {
            if (result.isConfirmed) {
              selectedFeatureGroup.eachLayer((layer) => {
                if (layer.editing) {
                  layer.editing.disable();
    
                  const updatedGeofence = {
                    geofenceId: layer.options.geofenceId || Math.random().toString(36).substr(2, 9),
                    geofenceName: layer.options.geofenceName || 'Edited Geofence',
                    geofenceType: layer instanceof L.Polygon ? 'Polygon' : layer instanceof L.Circle ? 'Circle' : 'Line',
                    coordinates: [],
                  };
    
                  if (layer instanceof L.Polygon || layer instanceof L.Polyline || layer instanceof L.Rectangle) {
                    const latLngs = layer.getLatLngs();
                    const coordinates = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
                    updatedGeofence.coordinates = coordinates.map((latLng) => ({
                      lat: latLng.lng,
                      lng: latLng.lat,
                    }));
                  } else if (layer instanceof L.Circle) {
                    const center = layer.getLatLng();
                    updatedGeofence.coordinates = [{ lat: center.lat, lng: center.lng, radius: layer.getRadius() }];
                  }
    
                  onGeofenceEdited(updatedGeofence);
                }
              });
    
              Swal.fire('Saved!', 'Your geofence changes have been saved.', 'success');
              saveBtn.style.display = 'none'; // Hide Save Button after saving
            }
          });
        };
    
        return container;
      },
    });
    
    // ✅ Add Edit+Save Control to Map
    const editSaveControl = new EditSaveControl();
    map.addControl(editSaveControl);

    
    // Add the buttons to the toolbar
    const deleteControl = new DeleteButton();
    map.addControl(deleteControl);

 

    return () => {
      map.removeControl(deleteControl);
      map.removeControl(editSaveControl);
    };
  }, [map, selectedFeatureGroup,onGeofenceEdited, onGeofenceDeleted]);

  return null;
};

DrawTool.propTypes = {
  selectedFeatureGroup: PropTypes.object.isRequired,
  onGeofenceEdited: PropTypes.func.isRequired,
  onGeofenceDeleted: PropTypes.func.isRequired,
};

export default DrawTool;
