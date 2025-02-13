import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import axios from "axios";
import {Button, Tab, Tabs, Box,  MenuItem, Select, FormControl, InputLabel, Modal , Checkbox, ListItemText } from "@mui/material";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MyMapComponent from "./MyMapComponent";
// import MyMapComponentFleet from './MyMapComponentFleet'
import GeofenceMessage from "./GeofenceMessage";
import GeofenceList from "./GeofenceList";
import { ToastContainer, toast } from 'react-toastify'; // Import Toast components
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
// import HistoryTable from "./HistoryTable";
import SalesRadar from './SalesRadar'
import ISMTable from './ISMTable'
import Loader from "./Loader";
import { AuthContext } from "../../AuthContext";
import "./Geofence.css";

function Geofence() {
  const [vessels, setVessels] = useState([]);
  const [fleetVessels, setFleetVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselEntries, setVesselEntries] = useState({});
  const [notifications, setNotifications] = useState([]);
  const { role, id } = useContext(AuthContext);
  const [loading, setLoading]=useState(true);
  const [testloading, setTestLoading]=useState(false);
  const [salesData, setSalesData] = useState([]);
  const [tabAnimation, setTabAnimation] = useState({ opacity: 1 });
    const [organizations, setOrganizations] = useState([]); // State to hold organization data
  const [selectedOrg, setSelectedOrg ] = useState(''); // Selected organization
  // const [selectedTab, setSelectedTab] = useState(0);
  const [activeTab, setActiveTab] = useState(1);
  const [error, setError] = useState('');

  
  // Keep the original unfiltered data

const [originalRows, setOriginalRows] = useState([]);
const [originalVessels, setOriginalVessels] = useState([]);

const [allRows, setAllRows] = useState([]);
const [allVessels, setAllVessels] = useState([]);


// const [originalInportRows, setOriginalInportRows] = useState([]);
// const [originalSixHoursRows, setOriginalSixHoursRows] = useState([]);
// const [originalTwentyFourHoursRows, setOriginalTwentyFourHoursRows] = useState([]);
// const [originalBeyond24HoursRows, setOriginalBeyond24HoursRows] = useState([]);


// const [originalInportVessels, setOriginalInportVessels] = useState([]);
// const [originalSixHoursVessels, setOriginalSixHoursVessels] = useState([]);
// const [originalTwentyFourHoursVessels, setOriginalTwentyFourHoursVessels] = useState([]);
// const [originalBeyond24HoursVessels, setOriginalBeyond24HoursVessels] = useState([]);


  // const [inportRows, setInportRows] = useState([]);
  // const [inportVessels, setInportVessels] = useState([]);

  // const [sixHoursRows, setSixHoursRows] = useState([]);
  // const [sixHoursVessels, setSixHoursVessels] = useState([]);

  // const [twentyFourHoursRows, setTwentyFourHoursRows] = useState([]);
  // const [twentyFourHoursVessels, setTwentyFourHoursVessels] = useState([]);

  // const [beyond24HoursRows, setBeyond24HoursRows] = useState([]);
  // const [beyond24HoursVessels, setBeyond24HoursVessels] = useState([]);

  // useEffect(() => {
  //   setTestLoading(true);
  // }, []);
     


  // 

    // State to control if the Select component is enabled or disabled
    const [isDisabled, setIsDisabled] = useState(false);

    // Handle changes when organizations are selected/deselected
    
    // Toggle the disabled state
    const toggleDisable = () => {
      setIsDisabled(!isDisabled);
    };


  useEffect(() => {
    setSelectedVessel(null);
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/ism-organizations/get-ISM-organizations`) // Adjust the URL to your API endpoint
      .then((response) => {
        console.log(response.data);
        setOrganizations(response.data); // Set the fetched organization data
        console.log(organizations);
      
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, [activeTab]);
  

  // const handle4TabsChange = (event, newValue) => {
  //   setSelectedVessel(null);
  //   // Start fading out
  //   setTabAnimation({ opacity: 0, transition: "opacity 0.4s ease-in-out" });
  //   setTimeout(() => {
  //     // Switch tabs after fade-out
  //     setSelectedTab(newValue);
  //     setTabAnimation({ opacity: 1, transition: "opacity 0.4s ease-in-out" }); // Fade in
  //   }, 400); // Match the fade-out duration
  // };

  



  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const salesDataResponse = await axios.get(`${baseURL}/api/get-upload-sales-data`);
        setSalesData(salesDataResponse.data);
        console.log(salesDataResponse);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };
    fetchSalesData();
  }, []);



  const handleRowClick = (vessel) => {
    // console.log('Row click event received with vessel:', vessel); // Log received vessel
  
    const selected = fleetVessels.find(v => v.IMO === vessel.IMO ) || vessels.find(v => v.IMO === vessel.IMO );
    // console.log(selected);
    if (selected) {
      setSelectedVessel(selected);
      // console.log("Selected vessel:", selected);
    }
  };



  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.AIS.LATITUDE, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.AIS.LONGITUDE, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel ? [selectedVessel.AIS.LATITUDE, selectedVessel.AIS.LONGITUDE] : calculateMapCenter();
  const zoom = selectedVessel ? 10 : 6;


// new start

const fetchSalesVessels = async (userId) => {
  try {
    // Extract orgId from userId
    let OrgId = userId.includes('_') ? userId.split('_')[1] : userId.split('_')[0];
    
    // Define the base URL for the API
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    // Fetch only the relevant vessels from the server based on orgId
    const response = await axios.get(`${baseURL}/api/get-salesvessels-based-on-OrgId`, {
      params: {
        OrgId: OrgId
      }
    });

  
    
    return response.data;
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

   

    return response.data;
  } catch (error) {
    console.error("Error fetching vessels values:", error);
    return [];
  }
};




  
useEffect(() => {
  const fetchSalesData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const salesDataResponse = await axios.get(`${baseURL}/api/get-upload-sales-data`);
      setSalesData(salesDataResponse.data);
      console.log(salesDataResponse);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };
  fetchSalesData();
}, []);




const fetchVessels = async (role, userId) => {
  try {
      if (role === 'hyla admin') {

        const baseURL = process.env.REACT_APP_API_BASE_URL;
        // Now fetch all vessels
       
        const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        
        const allVessels = response.data;


        
        setVessels(allVessels);
        // console.log(vessels);
        // For 'hyla admin', return all vessels whose IMO is in the tracked IMO list
        // filteredVessels.push(...allVessels); // Spread allVessels into filteredVessels to avoid nested array



        // fleet starts


        // fleet ends
        
      } else if (role === 'organization admin' || role === 'organizational user') {
      

        // Now, you need to fetch the IMO values for the user
        const vesselsFiltered = await fetchSalesVessels(userId); // Await this async function

        setVessels(vesselsFiltered);
        // console.log(vessels);
        // Check if the vessel IMO is in the fetched IMO values
        // filteredVessels.push(...vesselsFiltered); // to avoid array inside array nested
       
        
      } else if (role === 'guest') {
        // For 'guest', filter vessels based on loginUserId
     

            // Now, you need to fetch the IMO values for the user
            const vesselsFiltered = await fetchVesselById(userId); // Await this async function
  
            
            setVessels(vesselsFiltered);
            // console.log(vessels);
            
            
      }else{
        console.log('not found')
      }
    
    

  

    // console.log('Filtered Vessels:', finalVessels);
    // return filteredVessels;

  } catch (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }
};



useEffect(() => {
  // const baseURL = process.env.REACT_APP_API_BASE_URL;
  

  fetchVessels(role, id)
    .catch((err) => {
      console.error("Error fetching vessel data:", err);
      setError(err.message);
    })
    .finally(() => {
      // setLoading(false);
    });
}, [id,vessels]);


// fleet starts



useEffect(() => {
  const fetchISMData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/ism-organizations/get-ISM-data`, {
        params: { role, id }
      });

      // Categorize the formatted data based on AisPullGfType
      const { formattedData, vesselData} = response.data;
      console.log( response.data);

      setFleetVessels(vesselData);
      

      // Transform the `AisPullGfType` values before setting the rows
      const transformedData = formattedData.map((row) => {
        let transformedAisPullGfType;
        switch (row.AisPullGfType) {
          case 'inport':
            transformedAisPullGfType = 'Within 6hrs';
            break;
          case 'terrestrial':
            transformedAisPullGfType = 'Within 12hrs';
            break;
          case 'boundary':
            transformedAisPullGfType = 'Within 24hrs';
            break;
          case '-':
          default:
            transformedAisPullGfType = 'Beyond 24hrs';
            break;
        }
        return {
          ...row,
          AisPullGfType: transformedAisPullGfType, // Update AisPullGfType field
        };
      });
      setOriginalRows(transformedData);
      setOriginalVessels(vesselData);

      setAllRows(transformedData);
      setAllVessels(vesselData);

      // const importRows = formattedData.filter((vessel) => vessel.AisPullGfType === 'inport');
      // const importVessels = vesselData.filter((vessel) => vessel.AisPullGfType === 'inport');

      // const terrestrialRows = formattedData.filter((vessel) => vessel.AisPullGfType === 'terrestrial');
      // const terrestrialVessels = vesselData.filter((vessel) => vessel.AisPullGfType === 'terrestrial');

      // const boundaryRows = formattedData.filter((vessel) => vessel.AisPullGfType === 'boundary');
      // const boundaryVessels = vesselData.filter((vessel) => vessel.AisPullGfType === 'boundary');


      // const otherRows = formattedData.filter((vessel) => vessel.AisPullGfType !== 'inport' && vessel.AisPullGfType !== 'terrestrial' && vessel.AisPullGfType !== 'boundary');
      // const otherVessels = vesselData.filter((vessel) => vessel.AisPullGfType !== 'inport' && vessel.AisPullGfType !== 'terrestrial' && vessel.AisPullGfType !== 'boundary');

      //     // Store the original unfiltered data
      //     setOriginalInportRows(importRows);
      //     setOriginalSixHoursRows(terrestrialRows);
      //     setOriginalTwentyFourHoursRows(boundaryRows);
      //     setOriginalBeyond24HoursRows(otherRows);

      //     // Set the categorized data
      //     setInportRows(importRows);
      //     setSixHoursRows(terrestrialRows);
      //     setTwentyFourHoursRows(boundaryRows);
      //     setBeyond24HoursRows(otherRows);


      
      // setOriginalInportVessels(importVessels);
      // setOriginalSixHoursVessels(terrestrialVessels);
      // setOriginalTwentyFourHoursVessels(boundaryVessels);
      // setOriginalBeyond24HoursVessels(otherVessels);

      // setInportVessels(importVessels);
      // setSixHoursVessels(terrestrialVessels);
      // setTwentyFourHoursVessels(boundaryVessels);
      // setBeyond24HoursVessels(otherVessels);
 

    } catch (error) {
      console.error('Error fetching ISM data:', error);
    }
  };

  fetchISMData();
}, [role, id]);

// const getVesselsByTab = (tab) => {
//   switch(tab) {
//     case 0:
//       return inportVessels;  // Use the inportVessels for selectedTab 0
//     case 1:
//       return sixHoursVessels;  // Use the sixHoursVessels for selectedTab 1
//     case 2:
//       return twentyFourHoursVessels;  // Use the twentyFourHoursVessels for selectedTab 2
//     case 3:
//       return beyond24HoursVessels;  // Use the beyond24HoursVessels for selectedTab 3
//     default:
//       return [];  // Return empty array if no match
//   }
// };


const handleOrgChange = (event) => {
  const { value } = event.target;
  setSelectedOrg(value); // Update selected organization
  console.log('Selected Organization:', value);

  // Filter rows by CompanyTitle
  const filterDataByOrg = (rows) => {
    return rows.filter((row) => row.CompanyTitle === value); // Single value comparison
  };

  const filteredAllRows = filterDataByOrg(originalRows);

  // Apply filter to the original (unfiltered) rows
  // const filteredInportRows = filterDataByOrg(originalInportRows);
  // const filteredSixHoursRows = filterDataByOrg(originalSixHoursRows);
  // const filteredTwentyFourHoursRows = filterDataByOrg(originalTwentyFourHoursRows);
  // const filteredBeyond24HoursRows = filterDataByOrg(originalBeyond24HoursRows);

  // Filter vessels by IMO field, matching IMO values from the filtered rows
  const filterVesselsByIMO = (vessels, filteredRows) => {
    const filteredIMOs = filteredRows.map(row => row.IMO); // Extract IMO values from filtered rows
    return vessels.filter(vessel => filteredIMOs.includes(vessel.IMO)); // Only vessels with matching IMO
  };


  const filteredAllVessels = filterVesselsByIMO(originalVessels, filteredAllRows);

  // Filter vessels for each category based on IMO
  // const filteredInportVessels = filterVesselsByIMO(originalInportVessels, filteredInportRows);
  // const filteredSixHoursVessels = filterVesselsByIMO(originalSixHoursVessels, filteredSixHoursRows);
  // const filteredTwentyFourHoursVessels = filterVesselsByIMO(originalTwentyFourHoursVessels, filteredTwentyFourHoursRows);
  // const filteredBeyond24HoursVessels = filterVesselsByIMO(originalBeyond24HoursVessels, filteredBeyond24HoursRows);

  setAllRows(filteredAllRows);
  // Update the state with the filtered data
  // setInportRows(filteredInportRows);
  // setSixHoursRows(filteredSixHoursRows);
  // setTwentyFourHoursRows(filteredTwentyFourHoursRows);
  // setBeyond24HoursRows(filteredBeyond24HoursRows);

  setAllVessels(filteredAllVessels);
  // setInportVessels(filteredInportVessels);
  // setSixHoursVessels(filteredSixHoursVessels);
  // setTwentyFourHoursVessels(filteredTwentyFourHoursVessels);
  // setBeyond24HoursVessels(filteredBeyond24HoursVessels);


};





// fleet ends



  // Modify handleNewGeofenceEntry to include the vessel's name and geofence details
  const handleNewGeofenceEntry = (message, vessel) => {
    setNotifications((prev) => [
      ...prev,
      {
        title: `${vessel.AIS.NAME} has entered ${message.title}`,
        date: new Date().toLocaleTimeString(),
        image: <img src={team2} alt="vessel" />,
      }
    ]);
  };

  // Disable keyboard shortcuts and mouse zoom
  useEffect(() => {
    const handleKeyDown = (event) => {
     
      if (event.key.startsWith('F') || (event.ctrlKey && (event.key === '+' || event.key === '-'))) {
        event.preventDefault();
        toast.warning("THIS FUNCTION IS DISABLED"); // Show toast alert
      }
    };

    const handleWheel = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        toast.warning("THIS FUNCTION IS DISABLED"); // Show toast alert
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
  // if (loading){
  //   return<Loader/>;
  // }

 

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <DashboardNavbar vesselEntries={vesselEntries} />
      <div style={{
      maxWidth: '100%',
      padding: '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#D4F6FF',
        padding: '16px',
        boxSizing: 'border-box',
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          className="tabs" 
          indicatorColor="primary"
          textColor="primary"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Tab label="Current Orders" />
          <Tab label="Up Sell With Fleet Managers" />
        </Tabs>
        </div>
        </div>


        {(activeTab === 1 &&
        <Button onClick={toggleDisable} variant="contained" sx={{ marginBottom: '20px' }} style={{color:"white", backgroundColor:"#EB5A3C"}}><i className="fa-solid fa-pen-to-square"></i> &nbsp;
        {isDisabled ? 'Disable' : 'Enable'} Fleet Organization
      </Button>
        )}
        {(activeTab === 1 && isDisabled &&
        <>


           {/* Organization Filter - Multi Select */}
           <FormControl fullWidth sx={{ marginBottom: '20px' }}>
      <InputLabel>Select Fleet Organization</InputLabel>
      <Select
        value={selectedOrg} // Single value selection
        onChange={handleOrgChange} // onChange, not onClick
        label="Organization"
      >
        {organizations.map((org) => (
          <MenuItem key={org.orgId} value={org.companyTitle}>
            <ListItemText primary={org.companyTitle} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
        </>
        )}

      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>

               {(activeTab === 0 && 
                <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={vessels}
                  selectedVessel={selectedVessel}
                  setVesselEntries={setVesselEntries}
                  onNewGeofenceEntry={handleNewGeofenceEntry}
                />
               )} 

              {(activeTab === 1 &&
              

          

              <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={allVessels}
                  selectedVessel={selectedVessel}
                  setVesselEntries={setVesselEntries}
                  onNewGeofenceEntry={handleNewGeofenceEntry}
                />

              )} 

              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <br></br>

        {/* {activeTab === 1 && (
        <div style={{
      maxWidth: '100%',
      padding: '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#D4F6FF',
        padding: '16px',
        boxSizing: 'border-box',
      }}>
        
              <Tabs
              value={selectedTab}
              onChange={handle4TabsChange}
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
              </Tabs>


       
      </div>
    </div>
     )} */}
          {/* <br></br> */}
        <Box className="tab-container" mt={2}>
          
          <div className="tab-content">
            {activeTab === 0 && (
              <SalesRadar
                vesselEntries={vesselEntries}
                vessels={vessels}
                onRowClick={handleRowClick}
              />
            )}

        {activeTab === 1 && (
              <>
                {/* {selectedTab === 0 && */}
                
                 <ISMTable rows={allRows} onRowClick={handleRowClick} />
                 
                 {/* }
                {selectedTab === 1 && <ISMTable rows={sixHoursRows} onRowClick={handleRowClick} />}
                {selectedTab === 2 && <ISMTable rows={twentyFourHoursRows} onRowClick={handleRowClick} />}
                {selectedTab === 3 && <ISMTable rows={beyond24HoursRows} onRowClick={handleRowClick} />} */}
              </>
            )}


          </div>
        </Box>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Geofence;
