import React from 'react';
import PropTypes from 'prop-types';
import { FaShip, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import styled from 'styled-components';
import { format} from 'date-fns-tz';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;  // White background for the main container
  height: 567px;
  border-radius: 10px;

`;

const Card = styled.div`
  width: 100%;
  max-width: 500px;
  border-radius: 10px;
  background-color: #ffffff;  // White background for the card
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
  align-items: center;
  textAlign: center;
`;

const CardTitle = styled.h4`
  color: #333;
  font-size: 1.6rem;

  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  textAlign: center;
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  color: #555;
  font-size: 1rem;
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #ddd;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f2f2f2;
  }

  &:last-child {
    border-bottom: none;
  }

  .value {
    color: #333;
    font-weight: bold;
    font-size: 1.1rem;
  }

  svg {
    color: #007bff;  // Change icon color to blue for better contrast
    font-size: 1.3rem;
  }
`;

const VoyageTableLeftsideMap = ({ selectedVessel }) => {
  return (
    <Container>
      {selectedVessel ? (
        <>
          {/* Voyage Details Card */}
          <>
          <Card>
            <CardTitle>
              <FaShip /> VOYAGE DETAILS
            </CardTitle>
            </Card>
            <List>
              <ListItem>
                {/* <FaMapMarkerAlt /> */}
                Departure Port: <span className="value">{selectedVessel.AIS.DESTINATION || 'N/A'}</span>
              </ListItem>
              <ListItem>
                {/* <FaMapMarkerAlt /> */}
                Arrival Port: <span className="value">N/A</span>
              </ListItem>
              <ListItem>
                {/* <FaCalendarAlt /> */}  
                Arrival Date: <span className="value">{format(new Date(selectedVessel.AIS.ETA), 'dd-MM-yyyy HH:mm')  || 'N/A'}</span>
              </ListItem>
              <ListItem>
                {/* <FaCalendarAlt /> */}
                Actual Arrival Date: <span className="value">{format(new Date(selectedVessel.AIS.ETA), 'dd-MM-yyyy HH:mm') || 'N/A'}</span>
              </ListItem>
              <ListItem>
                Voyage Duration: <span className="value">N/A</span>
              </ListItem>
              <ListItem>
                Cargo Type: <span className="value">{selectedVessel.SpireTransportType || 'N/A'}</span>
              </ListItem>
              <ListItem>
                AIS Timestamp: <span className="value">{ format(new Date(selectedVessel.AIS.TIMESTAMP), 'dd-MM-yyyy HH:mm')  || 'N/A'}</span>
              </ListItem>
            </List>
          </>
        </>
      ) : (
        <p style={{ color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>No vessel selected.</p>
      )}
    </Container>
  );
};

VoyageTableLeftsideMap.propTypes = {
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
};

export default VoyageTableLeftsideMap;
