import React, { useEffect, useState,useContext } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard1 from "examples/Cards/StatisticsCards/DetailedStatisticsCard1";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MyMapComponent from "./MyMapComponent";
import Timeline from "./Timeline";
import { AuthContext } from "../../AuthContext";
import Loader from "./Loader";
import VoyageTabel from "./VoyageTabel";
import { Button, Box } from "@mui/material";
import { format} from 'date-fns-tz';

import VoyageTableLeftsideMap from "./VoyageTableLeftsideMap";


import axios from 'axios';
import EmissionDetails from "./EmissionDetails";
function Default() {
  const { vesselId } = useParams(); // Retrieve vesselId from URL
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const { role, id } = useContext(AuthContext);
  const [loading, setloading]=useState(false);
  const [error,setError]= useState("");
  const [events, setEvents] = useState([]);
  const [showVoyageTable, setShowVoyageTable] = useState(false);
  const [voyages,setVoyages] = useState([]);
  const [allVoyages,setAllVoyages] = useState([]);

  
  const [selectedPort, setSelectedPort] = useState(null);
  const [ports, setPorts] = useState([]);
  const [searchVessels, setSearchVessels] = useState([]);
  const [searchVesselsOptions, setSearchVesselsOptions] = useState([]);



  
  
  
useEffect(() => {
  const fetchVoyages = async () => {
  try {
  
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  
  const response = await axios.get(`${baseURL}/api/get-voyages`);

  setAllVoyages(response.data);
  // Extract only the IMO values from the response data
  const imoValues = response.data.map(voyage => voyage.IMO);
  
  // Set the IMO values in the state
  setVoyages(imoValues);
  
 
 
 
  const ports = response.data.map(voyage => voyage.port); // Extract only the port objects
 
  // Remove duplicate ports by checking the port name
  const uniquePorts = ports.filter(
  (port, index, self) => 
  port && index === self.findIndex(p => p?.name === port.name)
  );
 
  setPorts(uniquePorts);

  // 

  const IMOS = [...new Set(response.data.map(voyage => voyage.IMO))];// Extract only the port objects

  const matchedVessels = vessels
  .filter(vessel => IMOS.includes(vessel.AIS.IMO)) // Find matching IMO values
  .map(vessel => vessel.AIS.NAME); // Extract name field
console.log(vessels);
console.log(matchedVessels); 
  
  setSearchVessels(matchedVessels);
 
 
 
  
  } catch (error) {
  console.error('Error fetching voyages:', error);
  }
  };
  fetchVoyages();
  }, [selectedPort]);


// Handle port selection
const handlePortSelect = (event, value) => {

if (!value) {
  setSelectedPort(null);
  return;
}

console.log(vessels);
const vesselData = ports.find(port => port.name === value.name);
setSelectedPort(vesselData || null);

  console.log(allVoyages);
  // Get matching voyages
  const matchedVoyages = allVoyages.filter(voyage => voyage.port.name === value.name);

  // Extract unique IMO values
  const uniqueIMOs = [...new Set(matchedVoyages.map(voyage => voyage.IMO))];

  const matchedVessels = vessels
  .filter(vessel => uniqueIMOs.includes(vessel.AIS.IMO)) // Find matching IMO values
   // Extract name field

  console.log(matchedVessels); 
  


  setSearchVesselsOptions(matchedVessels);
 
  console.log(vessels)


};


function handleSelect(event, value) {
  if (!value) {
    setSelectedVessel(null);
    return;
  }

  const vesselData = vessels.find(vessel => vessel.AIS.NAME === value.AIS.NAME);
  setSelectedVessel(vesselData || null);
}



 // Helper function to fetch tracked vessels by user
 const fetchTrackedVesselsByUser = async (userId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
    // console.log(response);
    return response.data.filter(vessel => vessel.loginUserId === userId);
   
    
  } catch (error) {
    console.error("Error fetching tracked vessels by user:", error);
    return [];
  }
};

 // Helper function to fetch tracked vessels by user
 const fetchTrackedVesselsByOrg = async (orgId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
    // console.log(response);
    return response.data.filter(vessel => vessel.OrgId === orgId);
   
    
  } catch (error) {
    console.error("Error fetching tracked vessels by user:", error);
    return [];
  }
};

// new start

const fetchVesselIMOValues = async (userId) => {
  try {
    // Extract orgId from userId
    let OrgId = userId.includes('_') ? userId.split('_')[1] : userId.split('_')[0];
    
    // Define the base URL for the API
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch only the relevant vessels from the server based on orgId
    const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user-based-on-OrgId`, {
      params: {
        OrgId: OrgId
      }
    });

    // Extract IMO values from the response
    const vesselsFiltered = response.data;

    return vesselsFiltered;
  } catch (error) {
    console.error("Error fetching IMO values:", error);
    return [];
  }
};

// new end

const fetchVesselById = async (userId) => {
  try {
  
    
    // Define the base URL for the API
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch only the relevant vessels from the server based on orgId
    const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user-based-on-loginUserId`, {
      params: {
        loginUserId : userId
      }
    });
    // Extract IMO values from the response
    const vesselsFiltered = response.data;
    return vesselsFiltered;
  } catch (error) {
    console.error("Error fetching vessels values:", error);
    return [];
  }
};

const fetchVessels = async (role, userId) => {
  try {
    // Fetch the tracked vessels for the user first
    const trackedByUser = await fetchTrackedVesselsByUser(userId);
    // console.log(trackedByUser);

    // Ensure tracked vessels have a valid IMO and extract them
    const trackedIMO = trackedByUser.filter(vessel => vessel.IMO).map(vessel => vessel.IMO);

    const baseURL = process.env.REACT_APP_API_BASE_URL;
    // Now fetch all vessels
   
    const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
    
    const allVessels = response.data;
    
   // Initialize an empty array to store the filtered vessels
    const filteredVessels = [];


      if (role === 'hyla admin') {
        // For 'hyla admin', return all vessels whose IMO is in the tracked IMO list
        filteredVessels.push(...allVessels); // Spread allVessels into filteredVessels to avoid nested array
      } else if (role === 'organization admin' || role === 'organizational user') {
      

        // Now, you need to fetch the IMO values for the user
        const vesselsFiltered = await fetchVesselIMOValues(userId); // Await this async function

        // Check if the vessel IMO is in the fetched IMO values
        filteredVessels.push(...vesselsFiltered); // to avoid array inside array nested
       
        
      } else if (role === 'guest') {
        // For 'guest', filter vessels based on loginUserId

            // Now, you need to fetch the IMO values for the user
            const vesselsFiltered = await fetchVesselById(userId); // Await this async function
            filteredVessels.push(...vesselsFiltered); // to avoid array inside array nested
      }else{
        console.log('not found')
      }
    
    


    // Now filter all vessels by IMO values in state 'voyages'
    const filteredByIMO = filteredVessels.filter(vessel => voyages.includes(vessel.IMO));

    // Add the filtered vessels to the result
    return filteredByIMO;

  } catch (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }
};

useEffect(() => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  

  fetchVessels(role, id)
    .then(filteredVessels => {
      // Process filtered data
      const transformedData = filteredVessels.map((vessel) => ({
        SpireTransportType: vessel.SpireTransportType|| '',
        name: vessel.AIS?.NAME || "-",
        imo: vessel.AIS?.IMO || 0,
        speed: vessel.AIS?.SPEED || 0,
        lat: vessel.AIS?.LATITUDE || 0,
        lng: vessel.AIS?.LONGITUDE || 0,
        heading: vessel.AIS?.HEADING || 0,
        status: vessel.AIS?.NAVSTAT || 0,
        eta: vessel.AIS?.ETA || 0,
        destination: vessel.AIS?.DESTINATION || '',
        zone: vessel.AIS?.ZONE || ''
       
      }));

      setVessels(filteredVessels);

            // Find the vessel by name if vesselId is present
            const vessel = filteredData.find(vessel => vessel.AIS.NAME === decodeURIComponent(vesselId));
  
            // If no vessel found by ID, set the first vessel as default if it exists
            if (vessel) {
              // setSelectedVessel(vessel);
            } else if (filteredData.length > 0) {
              // setSelectedVessel(filteredData[0]); // Set the first vessel as default
              setloading(false);
            }
    })
    .catch((err) => {
      // console.error("Error fetching vessel data:", err);
      setError(err.message);
    })
    .finally(() => {
      // setLoading(false);
    });
}, [role,id,vessels,vesselId,selectedPort]);

useEffect(() => {
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  // setLoading(true);

  fetchVessels(role, id)
    .then(filteredData => {
      // Process filtered data

      const transformedData = filteredData.map((vessel) => ({
        SpireTransportType:vessel.SpireTransportType|| '',
        name: vessel.AIS.NAME || '',
        imo: vessel.AIS.IMO || 0,
        speed: vessel.AIS.SPEED || 0,
        lat: vessel.AIS.LATITUDE || 0,
        lng: vessel.AIS.LONGITUDE || 0,
        heading: vessel.AIS.HEADING || 0,
        status: vessel.AIS.NAVSTAT || 0,
        eta: vessel.AIS.ETA || 0,
        destination: vessel.AIS.DESTINATION || '',
      }));
      setVessels(filteredData);
      console.log(transformedData);

      // Find the vessel by name if vesselId is present
        const vessel = filteredData.find(vessel => vessel.AIS.NAME === decodeURIComponent(vesselId));
  
        // If no vessel found by ID, set the first vessel as default if it exists
        if (vessel) {
          // setSelectedVessel(vessel);
        } else if (filteredData.length > 0) {
          // setSelectedVessel(filteredData[0]); // Set the first vessel as default
          setloading(false);
        }
    })
    .catch((err) => {
      console.error("Error fetching vessel data:", err);
      setError(err.message);
    })
    .finally(() => {
      // setLoading(false);
    });
}, [vesselId,role, id, selectedPort]);




  const destination = selectedVessel?.AIS?.DESTINATION || "-";
  const speed = selectedVessel?.AIS?.SPEED ? `${selectedVessel.AIS.SPEED} knots` : "-";
  const eta = selectedVessel?.AIS?.ETA || "-";
  const zone = selectedVessel?.AIS?.ZONE || "-";

// Simulated function that fetches new event data (could be replaced by API calls)
const fetchNewEvent = () => {
  return new Promise((resolve) => {
      setTimeout(() => {
          const eventId = (events.length + 1).toString();
          const newEvent = {
              id: eventId,
              title: `Event ${eventId}`,
              date: new Date().toLocaleString(),
              description: `New event added: ${eventId}`
          };

          // Randomly decide to return new event or null (to simulate no new events)
          const hasNewEvent = Math.random() > 0.5; // 50% chance to get a new event
          resolve(hasNewEvent ? newEvent : null);
      }, 2000); // Simulate a delay for fetching
  });
};

if (loading) {
  return <Loader/>;
}


const handleToggleView = () => {
  setShowVoyageTable((prev) => !prev);
};



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
      <Card
 sx={{
 backgroundColor: " #ffffff",
 borderRadius: "17px",
 boxShadow: 1,
 padding: 2,
 }}
>
 <CardContent
 sx={{
 backgroundColor: " #ffffff",
 padding: 0,
 }}
 >
 <Typography variant="h4" gutterBottom>
 Search Options
 </Typography>
 <Box sx={{ display: "flex", gap: 2 }}>
 {/* Port Search */}
 <Box sx={{ flex: 1 }}>
 <Typography variant="h6" gutterBottom>

 </Typography>
 <Autocomplete
 options={ports} // Assuming you have a ports data array
 getOptionLabel={(option) => option.name || ""}
 value={selectedPort}
 onChange={handlePortSelect}
 renderInput={(params) => (
 <TextField {...params} label="Select Port" variant="outlined" />
 )}
 />
 </Box>

 {/* Vessel Search (Conditional) */}
 {selectedPort && (
 <Box sx={{ flex: 1 }}>
 <Typography variant="h6" gutterBottom>

 </Typography>
 <Autocomplete
 options={searchVesselsOptions}
 getOptionLabel={(option) => option.AIS.NAME || ""}
 value={selectedVessel}
 onChange={handleSelect}
 renderInput={(params) => (
 <TextField {...params} label="Select Vessel" variant="outlined" />
 )}
 />
 </Box>
 )}
 </Box>
 </CardContent>
 </Card>
        <br></br>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={12}>
            <DetailedStatisticsCard1 vessel={selectedVessel} />
          </Grid>
        
          {selectedVessel && (
            <>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="Port"
                  count={destination}
                  icon={{ color: "info", component: <i className="fa fa-ship" /> }}
                  percentage={{ color: "success", count: "+3%", text: "since yesterday" }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="Speed"
                  count={speed}
                  icon={{ color: "info", component: <i className="fa fa-gauge" /> }}
                  percentage={{ color: "success", count: "+3%", text: "since last week" }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="ETA"
                  count={eta}
                  icon={{ color: "info", component: <i className="fa fa-map" /> }}
                  percentage={{ color: "error", count: "-2%", text: "since last quarter" }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <DetailedStatisticsCard
                  title="Zone"
                  count={zone}
                  icon={{ color: "info", component: <i className="fa fa-map-pin" /> }}
                  percentage={{ color: "success", count: "+5%", text: "than last month" }}
                />
              </Grid>
            </>
          )}

        </Grid>



        {selectedVessel && (
        <Grid container spacing={3} justifyContent="center" alignItems="flex-start" style={{ height: '100%' }}>
  <Grid item xs={12} md={4} lg={4} style={{ height: '100%' }}>
    <div style={{ borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', height: '100%' }}>
      <VoyageTableLeftsideMap
        selectedVessel={selectedVessel}
        style={{ borderRadius: '10px', overflow: 'hidden', height: '100%' }}
      />
    </div>
  </Grid>
  <Grid item xs={12} md={8} lg={8} style={{ height: '100%' }}>
    <div style={{ borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', height: '100%' }}>
      <MyMapComponent
        selectedVessel={selectedVessel}
        selectedPort={selectedPort}
        style={{ borderRadius: '10px', overflow: 'hidden', height: '100%' }}
      />
    </div>
  </Grid>
</Grid>

)}



 <Grid container spacing={0} mt={3}>
 <Grid item xs={12} md={12}>
 <Card sx={{ padding: 1, position: "relative", paddingBottom: "15px" }}>
 <CardContent>
 {/* Container for Header and Button */}
 <div style={{
 display: "flex", 
 justifyContent: "space-between", 
 alignItems: "center", 
 flexWrap: "wrap"
 }}>
 {/* Header */}
 <Typography variant="h3" color="#344767" style={{ margin: "0 8px" }} gutterBottom>
 JIT OPTIMIZATION
 </Typography>
 
 {/* Button */}
 <Button
 variant="contained"
 color="primary"
 onClick={handleToggleView}
 style={{
 color: "#fff",
 display: "flex",
 alignItems: "center",
 marginTop: "8px"
 }}
 >
 <i className="fa-solid fa-wand-magic-sparkles"></i>&nbsp; 
 {showVoyageTable ? "Show Emission Details" : "Calculate JIT"}
 </Button>
 </div>
 </CardContent>

 {/* Conditional rendering of components */}
 {showVoyageTable ? (
 <VoyageTabel selectedVessel={selectedVessel} selectedPort={selectedPort}/>
 ) : (
 <EmissionDetails selectedVessel={selectedVessel} selectedPort={selectedPort} />
 )}
</Card>

 </Grid>
 </Grid>
 

      </ArgonBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Default;