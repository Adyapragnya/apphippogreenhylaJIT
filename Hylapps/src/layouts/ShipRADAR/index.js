import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Tabs, Tab } from "@mui/material";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MyMapComponent from "./MyMapComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Vesseleighthours from "./Vesseleighthours";
import Vesseltwentyfourhours from "./Vesseltwentyfourhours";
import VesselSixhours from "./VesselSixhours";
import ShipsinPort from "./shipsinport";
import Loader from "./Loader";
import { AuthContext } from "../../AuthContext";
import ShipsInPortContainer from './ShipsInPortContainer'; 
import OpsRadar from './OpsRadar';


function Geofence() {
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselEntries, setVesselEntries] = useState({});
  const [loading, setLoading] = useState(false);
  // const [selectedTab, setSelectedTab] = useState(0);
  const [tabAnimation, setTabAnimation] = useState({ opacity: 1 });
  const { role,id} = useContext(AuthContext); 
  const [opsData, setOpsData] = useState([]);



  const handleTabChange = (event, newValue) => {
    // Start fading out
    setTabAnimation({ opacity: 0, transition: "opacity 0.4s ease-in-out" });
    setTimeout(() => {
      // Switch tabs after fade-out
      setSelectedTab(newValue);
      setTabAnimation({ opacity: 1, transition: "opacity 0.4s ease-in-out" }); // Fade in
    }, 400); // Match the fade-out duration
  };

  const handleRowClick = (vessel) => {
    const selected = vessels.find((v) => v.name === vessel.name);
    if (selected) {
      setSelectedVessel(selected);
    }
  };

  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.lat, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.lng, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel
    ? [selectedVessel.lat, selectedVessel.lng]
    : calculateMapCenter();
  // const zoom = selectedVessel ? 10 : 6;
  


  
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

    // console.log('abcddddddddddddddddddd',response.data);

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


useEffect(() => {
  const fetchOpsData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const opsDataResponse = await axios.get(`${baseURL}/api/get-uploaded-ops-data`);
      setOpsData(opsDataResponse.data);
      console.log(opsDataResponse);
    } catch (error) {
      console.error('Error fetching ops data:', error);
    }
  };
  fetchOpsData();
}, []);




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
// vessel based on Ops start

const extractOrgPart = (value) => {

  let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
  
  return orgId;
};

const filteredOpsData = opsData.filter((entry) => entry.OrgId === extractOrgPart(id));

const finalVessels = vesselsFiltered.filter((vessel) =>
  filteredOpsData.some((op) => op.IMO === vessel.IMO)
);

// console.log(finalVessels)

// vessel based on Ops end


// start

// const getFilteredVessels = (timeRange) => {
//   const filtered = finalVessels.filter((vessel) => {
//     // Filter based on AisPullGfType
//     switch (timeRange) {
//       case "inport":
//         return vessel.AisPullGfType === "inport";
//       case "6hours":
//         return vessel.AisPullGfType === "terrestrial";
//       case "24hours":
//         return vessel.AisPullGfType === "boundary";
//       case "beyond24":
//         return vessel.AisPullGfType !== "inport" &&  vessel.AisPullGfType !== "terrestrial" && vessel.AisPullGfType !== "boundary";
//       default:
//         return true; // Default behavior (if no filtering needed)
//     }
//   });

//   // Log the filtered vessels
//   console.log(`Filtered vessels for ${timeRange}:`, filtered);
//   return filtered;
// };


// const finalfilteredVessels = getFilteredVessels(
//   selectedTab === 0
//     ? "inport"
//     : selectedTab === 1
//     ? "6hours"
//     : selectedTab === 2
//     ? "24hours"
//     : selectedTab === 3
//     ? "beyond24"
//     : "beyond24" // Default behavior
// );
  

// end 


        // Check if the vessel IMO is in the fetched IMO values
        filteredVessels.push(...finalVessels); // to avoid array inside array nested
       
        
      } else if (role === 'guest') {
        // For 'guest', filter vessels based on loginUserId
     

            // Now, you need to fetch the IMO values for the user
            const vesselsFiltered = await fetchVesselById(userId); // Await this async function


            const filteredOpsData = opsData.filter((entry) => entry.loginUserId === id);

            const finalVessels = vesselsFiltered.filter((vessel) =>
              filteredOpsData.some((op) => op.IMO === vessel.IMO)
            );
            
            // console.log(finalVessels)
            
            // vessel based on Ops end
            
            
            // start
            
            // const getFilteredVessels = (timeRange) => {
            //   const filtered = finalVessels.filter((vessel) => {
            //     // Filter based on AisPullGfType
            //     switch (timeRange) {
            //       case "inport":
            //         return vessel.AisPullGfType === "inport";
            //       case "6hours":
            //         return vessel.AisPullGfType === "terrestrial";
            //       case "24hours":
            //         return vessel.AisPullGfType === "boundary";
            //       case "beyond24":
            //         return vessel.AisPullGfType !== "inport" &&  vessel.AisPullGfType !== "terrestrial" && vessel.AisPullGfType !== "boundary";
            //       default:
            //         return true; // Default behavior (if no filtering needed)
            //     }
            //   });
            
            //   // Log the filtered vessels
            //   console.log(`Filtered vessels for ${timeRange}:`, filtered);
            //   return filtered;
            // };
            
            
            // const finalfilteredVessels = getFilteredVessels(
            //   selectedTab === 0
            //     ? "inport"
            //     : selectedTab === 1
            //     ? "6hours"
            //     : selectedTab === 2
            //     ? "24hours"
            //     : selectedTab === 3
            //     ? "beyond24"
            //     : "beyond24" // Default behavior
            // );
              

            filteredVessels.push(...finalVessels); // to avoid array inside array nested



      }else{
        console.log('not found')
      }
    
    

  

    // console.log('Filtered Vessels:', finalVessels);
    return filteredVessels;

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
// console.log(filteredVessels);
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
        zone: vessel.AIS?.ZONE || '',
      }));
      // console.log(transformedData);


      setVessels(transformedData);
      // console.log(filteredData);

   
    })
    .catch((err) => {
      console.error("Error fetching vessel data:", err);
      setError(err.message);
    })
    .finally(() => {
      // setLoading(false);
    });
}, [role,id,vessels]);



  if (loading) {
    return <Loader />;
  }

 

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <DashboardNavbar vesselEntries={vesselEntries} />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
             
                <MyMapComponent
                  // zoom={zoom}
                  center={center}
                  vessels={vessels}
                  selectedVessel={selectedVessel}
                  setVesselEntries={setVesselEntries}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* <br />
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered
          sx={{
            background: "#D4F6FF",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Tab label="In Port" />
          <Tab label="Within 6 Hours" />
          <Tab label="Within 24 Hours" />
          <Tab label="Beyond 24 Hours" />
        </Tabs> */}
        

        <div style={tabAnimation}>
          <Grid container spacing={3} mt={1}>
            {/* {selectedTab === 0 && ( */}

              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                 
                  <ShipsinPort
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>

            {/* )} */}

            {/* {selectedTab === 1 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                 
                  <VesselSixhours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 2 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                 
                  <Vesseltwentyfourhours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 3 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
               
                  <Vesseleighthours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )} */}

          </Grid>
        </div>




      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Geofence;
