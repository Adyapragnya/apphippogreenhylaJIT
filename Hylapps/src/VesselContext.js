import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types'; 
// Create the context for vessel data
const VesselContext = createContext();

// Custom hook to use the VesselContext
export const useVessel = () => {
  return useContext(VesselContext);
};

// VesselProvider component
export const VesselProvider = ({ children }) => {
  const [selectedVesselFromChatBot, setSelectedVesselFromChatBot] = useState(null); // Store the selected vessel
  const [locateClicked, setLocateClicked] = useState(false);  // Flag to indicate if locate button is clicked

  // Function to handle row click (in Dashboardcopy)
  const handleRowClickFromChatBot = (vessel) => {
    setSelectedVesselFromChatBot(vessel);
    console.log('Vessel selected:', vessel);  // Log the selected vessel
  };

  // Function to handle Locate Vessel click (in ChatBot)
  const handleLocateVesselClick = (vessel) => {
    setLocateClicked(true);
    setSelectedVesselFromChatBot(vessel);  // Set the selected vessel
  };

  return (
    <VesselContext.Provider value={{ selectedVesselFromChatBot, handleRowClickFromChatBot, handleLocateVesselClick }}>
      {children}
    </VesselContext.Provider>
  );
};



VesselProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
