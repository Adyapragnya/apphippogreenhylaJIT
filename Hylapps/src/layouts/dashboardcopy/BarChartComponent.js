import React, { useEffect, useRef, useState,useContext } from "react";
import Chart from "chart.js/auto";
import axios from "axios"; // Make sure to import axios
import './BarChart.css'; // Import the CSS for styling
import { AuthContext } from "../../AuthContext";

function BarChartComponent() {
  const chartRef = useRef(null);
  const [data, setData] = useState([]); // State to hold chart data
  const { role, id } = useContext(AuthContext);

  const downloadChart = () => {
    const link = document.createElement("a");
    link.href = chartRef.current.chart.toBase64Image();
    link.download = "barchart.png";
    link.click();
  };


  // Helper function to extract organization part
  const extractOrgPart = (value) => {

    let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
    
    return orgId;
  };
  
  
  
    
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
        console.log(filteredVessels);
  
        // Aggregate vessels by month
        const vesselCountByMonth = filteredVessels.reduce((acc, vessel) => {
          const month = new Date(vessel.createdAt).getMonth(); // Assuming ETA is a Date
          acc[month] = (acc[month] || 0) + 1; // Count vessels for each month
          return acc;
        }, {});
  
        // Transform data into the format expected by the chart
        const transformedData = Object.keys(vesselCountByMonth).map(month => ({
          month: new Date(2020, month).toLocaleString('default', { month: 'long' }), // Convert month index to month name
          count: vesselCountByMonth[month],
        }));
  
        console.log(transformedData); // Ensure this outputs the expected data structure
  
        setData(transformedData);
      })
      .catch((err) => {
        console.error("Error fetching vessel data:", err);
      });
  }, [role, id]);
  
  



  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d"); // Ensure chartRef is not null

    // Clean up previous instance of chart
    if (chartRef.current?.chart) {
      chartRef.current.chart.destroy();
    }

    if (ctx && data.length > 0) {
      // Initialize the new chart
      chartRef.current.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map(d => d.month), // Use months as labels
          datasets: [
            {
              label: "Total Vessels", // Single label for total vessels
              data: data.map(d => d.count), // Total count of vessels per month
              backgroundColor: "#0F67B1", // Chart color
              borderColor: "#0F67B1",
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true, // Make chart responsive to different devices
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 5 // Set step size to 5
              }
            },
            x: {
              title: {
                display: true,
                text: 'Months' // Set title for the x-axis
              },
              ticks: {
                autoSkip: false // Show all ticks (month names)
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom', // Position legend below the chart
            }
          }
        }
      });
    }

    // Cleanup function to destroy chart on component unmount
    return () => {
      if (chartRef.current?.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [data]);

  return (
    <div className="chart-container-wrapper">
      <div className="chart-header">
        <h4 style={{ color: "#344767" }}>Total Ships Tracked <sup style={{color:"orange", fontSize:" 12px"}}>(Based on Months)</sup></h4>
        <button className="download-btn" onClick={downloadChart}>
          <i className="fa fa-download"></i>&nbsp;Download
        </button>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

export default BarChartComponent;
