import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';

import {
  Box,
  Button,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
  Tooltip,
  TableContainer,
  Grid,
  Collapse,
  ListItemText,
  ListItem,
  List,
  ButtonGroup,
  TextField,
  Paper,
} from "@mui/material";
// import { format } from "date-fns";
import { isValid } from "date-fns";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import axios from "axios";
import DateTimePicker from "react-datetime-picker";
import { format} from 'date-fns-tz';

import { toZonedTime  } from 'date-fns-tz';
// import { ArrowRight as ArrowRightIcon } from "./arrow-right";
import { PencilAlt as PencilAltIcon } from "./pencil-alt";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import DoneIcon from "@mui/icons-material/Done";
import { useSelector } from "react-redux";
// import { RootState } from "src/store";
import NextLink from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SummarizeIcon from "@mui/icons-material/Summarize";
import DoneAllIcon from "@mui/icons-material/DoneAll";
// import { Scrollbar } from "./scrollbar";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
// import { AuthContext } from "src/contexts/firebase-auth-context";
import zIndex from "@mui/material/styles/zIndex";
import { Delete } from "@mui/icons-material";

// Define the type for selectedVessel using the PropTypes shape
interface AIS {
  NAME: string;
  IMO: string; // Assuming IMO is a string based on your PropTypes
  CALLSIGN: string;
  SPEED: number;
  DESTINATION: string;
  SpireTransportType: string;
  LATITUDE: number;
  LONGITUDE: number;
  HEADING: number;
  ETA: string;
}

interface SelectedVessel {
  SpireTransportType: string;
  AIS: AIS;
}
interface SelectedPort {
 name: string;
  
}


interface VoyageTabelProps {
  selectedVessel: SelectedVessel,// Define selectedVessel as a prop
  selectedPort: SelectedPort;
}



const VoyageTabel: React.FC<VoyageTabelProps> = ({ selectedVessel, selectedPort }) => {
  // const {
  //   data,
  //   dataCount,
  //   onPageChange,
  //   onRowsPerPageChange,
  //   page,
  //   rowsPerPage,
  //   isLoading,
  //   openDialog,
  //   openETB,
  //   openRemoveDialog,
  //   ...other
  // } = props;

  // const isOrganizationName = useSelector(
  //   (state: RootState) => state.isOrganization.isOrganizationName
  // );

  // let dynamicPath = `/${isOrganizationName}/alert`;

  const [selectedTransportId, setSelectedTransportId] = useState(null);

  const [showSaveButton, setShowSaveButton] = useState(false);
  
  
    interface EmissionForm {
      JitEta: Date | string | null;
      pointOfSpeedReduction: Date | string | null;
      ETB: Date | string | null;
      // berthName: null | string;
      dtgAtVirtualNOR: number;
      speedToMaintainETB: number;
      currentDTG: number;
      positionReportedAt: Date;
      currentETA: Date | string | null;
      // currentTime: string;
      currentSpeed: number;
    }
  
  
    const [submittedData, setSubmittedData] = useState<EmissionForm | null>(null);
    
    interface ReportData {
      speed: number,
      totalH: number;
      ETA: Date | string | null,
      EWT: any,
      MTD: any,
      actualCons: number;
      loadFactor: number;
      anchorageTime?: number;
      FOconsatanchorage?: number;
      totalConsumption?: number;
      CO2?: number;
      SOx?: number;
      NOx?: number;
    }
    const [EReport, setEReport] = useState<ReportData[]>([]);  // Explicitly typed as an array of ReportData

    const [EReportAssumption, setEReportAssumption] = useState<ReportData[]>([]);  // Explicitly typed as an array of ReportData


    
  const [emissionForm, setEmissionForm] = useState({
    JitEta: null as Date | string | null,
    pointOfSpeedReduction: null as Date |  string | null,
    ETB: null as Date |  string | null
  });

  const [isEmissionFormOpen, setIsEmissionFormOpen] = useState(false);

  const [data, setData] = useState([]);
  


  

 
  
  useEffect(() => {

    const fetchVoyages = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-voyages`);

        // Convert IMO from string to number and filter based on selectedVessel.AIS.IMO
        // const filteredData = response.data.filter(
        //   (vessel: { IMO: string | number }) =>
        //     vessel.IMO === selectedVessel.AIS.IMO
        // );

        let filteredData = response.data;

            // If selectedPort is provided, filter by port name
      if (selectedPort) {
        filteredData = filteredData.filter(
          (vessel: { port: { name: string } }) => vessel.port.name === selectedPort.name
        );
      }

      // If selectedVessel is provided, filter by IMO after filtering by port
      if (selectedVessel) {
        filteredData = filteredData.filter(
          (vessel: { IMO: string | number }) => vessel.IMO === selectedVessel.AIS.IMO
        );
      }

  

        setData(filteredData); // Set filtered data to state
        console.log(filteredData); // Log the filtered data for debugging
      } catch (error) {
        console.error('Error fetching voyages:', error);
      }
    };

    fetchVoyages();
  }, [selectedVessel, selectedPort]);

 




  
  



  const formatString = (inputString: any) => {
    const formattedString =
      inputString.charAt(0).toUpperCase() + inputString.slice(1);
    const finalString = formattedString.replace(/[_-]/g, " ");

    return finalString;
  };

  // const handleOpen = (Id: any) => {
  //   openDialog(Id);
  // };
  // const handleETBOpen = (Id: any) => {
  //   openETB(Id);
  // };

  const handleReset = () => {

    setSubmittedData(null);
    setIsEmissionFormOpen(false);
    setShowSaveButton(false);
    setEmissionForm({
      JitEta: null,
      pointOfSpeedReduction: null,
      ETB: null
    });
    setEReport([]);
    setEReportAssumption([]);
  };

  let formatDate = (date: string | Date): string => {
    // Convert to Date object if it's a string
    const dateObj = new Date(date);
  
    // Format the date to 'DD-MM-YYYY hh:mm AM/PM'
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = dateObj.getFullYear();
    
    const hours = dateObj.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';
  
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };


  const calculateGreatCircleDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Great-circle distance in kilometers
// console.log(distance);
    return distance;
};


  const handleSubmitEmissionForm = async (row : any) => {

    setShowSaveButton(true);

    let latestAISData: any;
    let transportData: any;
    let portData: any;
    let distance: any;
    let distance11: any;
    let APIDis: any;
    let timeDiffrence: any;
    let extraTime: any;
    let totalHour: any;
    let totalExtraDays: any;
    let extraDistance: any;

    if (!emissionForm.JitEta || !emissionForm.pointOfSpeedReduction || !emissionForm.ETB) {
    
      Swal.fire('Error', 'Please fill in all required fields.', 'error')
      return;
    }

    if (emissionForm.pointOfSpeedReduction > emissionForm.JitEta) {
    
      Swal.fire('Error', "Point Of Speed Reduction should be less than to JIT ETA." , 'error');

      return;
    }

    try {
      console.log('aaaaaaaa', row.transport.imoNumber);
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(
        `${baseURL}/api/get-latestAISData-on-submit/${row.transport.imoNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        toast.error(`Oops!! Something went wrong. Please retry`);
      }

      const responseData = await response.json();
// console.log(responseData);
      if (responseData.data) {
        latestAISData = responseData.data.latestAISData;
        // console.log(latestAISData);
        transportData = row.transport;
        portData = row.port;


      } else {
        latestAISData = {};
        transportData = row.transport;
        portData = row.port;

      }
    } catch (error) {
      toast.error(`Oops!! Something went wrong`);
    }
  
    // try {
    //   const baseURL = process.env.REACT_APP_API_BASE_URL;
    //   const res_2 = await fetch(
    //     `${baseURL}/api/distance/${latestAISData.LONGITUDE}/${latestAISData.LATITUDE}/${portData.long}/${portData.lat}`,
    //     {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //         // Authorization: `Bearer ${authToken}`,
    //       },
    //     }
    //   );

    //   if (!res_2.ok) {
    //   } else {
    //     const data = await res_2.json();
    //     // console.log(data);
    //     const distanceInMeters = data?.properties?.Distance || 0;
    //     console.log("api meters",distanceInMeters);
    //     distance = Math.round(distanceInMeters / 1852);
    //     console.log('api ',distance);


    //     // console.log('api 1',distanceInMeters/1000);

    //   }
    // } catch (error: any) {
    //   console.error("Error during API request:", error.message);
    // }
  
  
    try {
      distance11 = calculateGreatCircleDistance(
          latestAISData.LATITUDE,
          latestAISData.LONGITUDE,
          portData.lat,
          portData.long
      );
    
      distance = Math.round(distance11*1000/1852);
      
      console.log( latestAISData.LATITUDE,
        latestAISData.LONGITUDE,
        portData.lat,
        portData.long);
      // console.log(`NON-api 1 ${distance11 } `);
      // console.log(`NON-api meters ${distance11*1000} `);

      console.log(`NON-api  ${distance } `);
      // console.log(`NON-api 3 ${distance11/1000 } `);
      // console.log(`NON-api 4 ${distance11/1852 } `);


    } catch (error) {
        toast.error("Error calculating distance.");
        console.error(error);
        return;
    }

    // time diffrence TIMESTAMP-pointOfSpeedReduction
    const pointOfSpeedReduction = new Date(emissionForm.pointOfSpeedReduction);

    const aisTimestamp = new Date(latestAISData?.TIMESTAMP);

    // const ETB = new Date(row.ETB);
    const ETB = new Date(emissionForm.ETB);


    const timeDifferenceInMilliseconds_CurrentVsTimeTenderAt =
      aisTimestamp.getTime() - pointOfSpeedReduction.getTime();

    const timeDifferenceInHours_CurrentVsTimeTenderAt =
    timeDifferenceInMilliseconds_CurrentVsTimeTenderAt / (1000 * 60 * 60);

    const roundedTimeDifferenceInHours_CurrentVsTimeTenderAt = Math.round(timeDifferenceInHours_CurrentVsTimeTenderAt);

    // extra time
    const speed: number = parseFloat(latestAISData?.SPEED);
    extraDistance = roundedTimeDifferenceInHours_CurrentVsTimeTenderAt * speed;



    const timeDifferenceInMilliseconds_CurrentVsETB =
    ETB.getTime() - aisTimestamp.getTime();

    const timeDifferenceInHours_CurrentVsETB =
    timeDifferenceInMilliseconds_CurrentVsETB / (1000 * 60 * 60);

    let totalTimeRemaining;

    totalTimeRemaining = Math.round(timeDifferenceInHours_CurrentVsETB);


    const additionalData = {
      dtgAtVirtualNOR: distance + extraDistance,
      speedToMaintainETB: Number((distance / totalTimeRemaining).toFixed(1)),
      currentDTG: distance,
      positionReportedAt:latestAISData?.TIMESTAMP,
      currentETA: latestAISData?.ETA ,
      currentSpeed: latestAISData?.SPEED,
      ETB: emissionForm?.ETB,
      // ETB: row?.ETB,
    };

    const updatedEmissionForm = {
      ...emissionForm,
      ...additionalData,
    };
    setSubmittedData(updatedEmissionForm );
    console.log(updatedEmissionForm);
    

    // let obj = {};
   
    // let report = [];
  

    interface SpeedData {
      loadFactor: number;
      SFOC: number;
    }
    
    const speedData: Record<number, SpeedData> = {
      8.0: { loadFactor: 0.30, SFOC: 193 },
      9.0: { loadFactor: 0.40, SFOC: 192 },
      10.0: { loadFactor: 0.50, SFOC: 191 },
      11.5: { loadFactor: 0.60, SFOC: 189 },
      12.5: { loadFactor: 0.70, SFOC: 186 },
      13.0: { loadFactor: 0.75, SFOC: 185 },
      13.5: { loadFactor: 0.80, SFOC: 186 },
      14.0: { loadFactor: 0.85, SFOC: 188 },
      14.2: { loadFactor: 0.90, SFOC: 191 },
      14.5: { loadFactor: 1.00, SFOC: 198 },
    };
    
  // Function to get exact or interpolated loadFactor and SFOC
function getSpeedData(speed: number): SpeedData {
  const speeds = Object.keys(speedData).map(Number).sort((a, b) => a - b);

  // If speed is exactly in speedData, return it directly
  if (speedData[speed]) return speedData[speed];

  // If speed is out of range, return boundary values
  if (speed <= 8) return speedData[8.0];
  if (speed >= 14.5) return speedData[14.5];

  // Find the closest lower and upper speeds for interpolation
  let lowerSpeed = speeds[0];
  let upperSpeed = speeds[speeds.length - 1];

  for (let i = 0; i < speeds.length - 1; i++) {
    if (speed > speeds[i] && speed < speeds[i + 1]) {
      lowerSpeed = speeds[i];
      upperSpeed = speeds[i + 1];
      break;
    }
  }

  const lowerData = speedData[lowerSpeed];
  const upperData = speedData[upperSpeed];

  // Linear interpolation formula
  const ratio = (speed - lowerSpeed) / (upperSpeed - lowerSpeed);
  const loadFactor = lowerData.loadFactor + ratio * (upperData.loadFactor - lowerData.loadFactor);
  const SFOC = lowerData.SFOC + ratio * (upperData.SFOC - lowerData.SFOC);

  return { loadFactor: parseFloat(loadFactor.toFixed(2)), SFOC: Math.round(SFOC) };
}

// if(transportData?.SpireTransportType !== "Car Carrier" || "Container Ship")
  if (transportData?.SpireTransportType !== "Car Carrier" && transportData?.SpireTransportType !== "Container Ship")
    {
  console.log(`name: ${transportData?.transportName} , type: ${transportData?.SpireTransportType}`);
    let report: ReportData[] = [];
    if (transportData && latestAISData) {

        // Check if speed is 0
  if (latestAISData?.SPEED === 0) {
    // If SPEED is 0, set all fields to 0
    let obj: ReportData = {
      speed: 0,
      totalH: 0,
      ETA: null,
      EWT: 0,
      MTD: 0,
      actualCons: 0,
      loadFactor: 0,
      anchorageTime: 0,
      FOconsatanchorage: 0,
      totalConsumption: 0,
      CO2: 0,
      SOx: 0,
      NOx: 0,
    };
    report.push({ ...obj });
  } else {
      // transportData?.SOFC_map_array.map((data: any, index: any) => {
      // transportData?.map((data: any, index: any) => {

        // let totalH = distance / data.speed;
    
         // Get exact or interpolated values
    const { loadFactor, SFOC } = getSpeedData(latestAISData?.SPEED);
    console.log(`current speed: ${latestAISData?.SPEED}, SFOC: ${SFOC}, loadFactor: ${loadFactor}`)


        let totalH = updatedEmissionForm.dtgAtVirtualNOR / latestAISData?.SPEED ;
        // console.log(`DTG: ${distance },current  speed : ${latestAISData?.SPEED} ,time :${totalH}`);


        let totalD = totalH / 24;
        let timestampInMillis = new Date(latestAISData?.TIMESTAMP).getTime();
        let newTimestampInMillis =
          timestampInMillis + totalD * 24 * 60 * 60 * 1000;
        let newTimestampDate = new Date(newTimestampInMillis);
        let formattedDate = newTimestampDate.toLocaleString();

        let rowETBDate: Date = ETB;
        // console.log(ETB);
        // console.log(emissionForm.ETB);

        let timeDifferenceInMilliseconds: number =
          rowETBDate.getTime() - newTimestampDate.getTime();
        let timeDifferenceInHours: number =
          timeDifferenceInMilliseconds / (1000 * 60 * 60);
        timeDifferenceInHours = parseFloat(timeDifferenceInHours.toFixed(1));
     
        let MTD =
     
          ((loadFactor * transportData?.ME_kW_used * SFOC ) /
            10 ** 6) *
          24;
        MTD = parseFloat(MTD.toFixed(2));
        let actualCons = MTD * (totalH / 24);
        actualCons = parseFloat(actualCons.toFixed(2));

        let obj: ReportData = {
     
          speed: latestAISData?.SPEED ,

          totalH: totalH,
          ETA: newTimestampDate,
          EWT: timeDifferenceInHours,
          MTD: MTD,
          actualCons: actualCons,
          FOconsatanchorage: 0,
          totalConsumption: 0,
          CO2: 0,
          SOx: 0,
          NOx: 0,
          loadFactor: loadFactor,
          anchorageTime: 0,
        };


       
        report.push({ ...obj });
        // console.log(report);
       
    }
  }


    if (report.length > 0) {
      const lastTotalH = report[report.length - 1].totalH;
      // console.log(lastTotalH);
      report.forEach((data) => {

        const currentTotalH = data.totalH;
        // console.log(currentTotalH);
        const anchorageTime = lastTotalH - currentTotalH;
        const formattedAnchorageTime = parseFloat(anchorageTime.toFixed(2));

        data.anchorageTime = formattedAnchorageTime;
        let fo: number;
        // fo = (4 * 24) / data.anchorageTime;

        fo = (data.MTD / 24) * anchorageTime * 0.04 ;


        if (fo === Infinity || isNaN(fo)) {
          fo = 0;
        }
        data.FOconsatanchorage = fo;

        let tCon = data.actualCons + data.FOconsatanchorage;
        tCon = parseFloat(tCon.toFixed(1));
        data.totalConsumption = tCon;
        let co2: any;
        co2 = data.totalConsumption * 3.14;
        data.CO2 = parseFloat(co2.toFixed(2));

        let sox: any;
        sox = 2 * 0.97753 * 0.005 * data.totalConsumption;
        data.SOx = parseFloat(sox.toFixed(2));

        let nox: any;

        let factor: number;
        
// Assign the factor based on the buildYear
if (transportData?.buildYear <= 2011) {
  factor = 17;
} else if (transportData?.buildYear > 2012 && transportData?.buildYear <= 2015) {
  factor = 14.4;
} else if (transportData?.buildYear >= 2016) {
  factor = 3.4;
} else {
  // Default factor if buildYear is not in the expected range
  factor = 3.4; // or some other default value if needed
}

// console.log(`year of built : ${transportData?.buildYear }, factor : ${factor}, MEKW : ${transportData?.ME_kW_used}`);
        nox =
          (transportData?.ME_kW_used *
            // transportData?.NOx_g_kwh *

             factor *
            lastTotalH *
            data.loadFactor) /
          1000000;


        data.NOx = parseFloat(nox.toFixed(2));
      });
      setEReport(report);
      
    }


    // const speedsForAssumption = [8, 9, 10, 11.5, 12.5, 13, 13.5, 14, 14.2, 14.5];

    const speedsForAssumption = [14.5, 14.2, 14, 13.5, 13, 12.5, 11.5, 10, 9, 8];

 
 
// Logic to add speedToMaintainETB if conditions are met
if (updatedEmissionForm && updatedEmissionForm?.speedToMaintainETB > 8) {
  // console.log( updatedEmissionForm?.speedToMaintainETB );

  // Check if the value is not already in the speedsForAssumption array
  if (!speedsForAssumption.includes( updatedEmissionForm?.speedToMaintainETB )) {
    // Add the value to the array (insert it at the beginning)
    speedsForAssumption.unshift( updatedEmissionForm?.speedToMaintainETB );
    // console.log(speedsForAssumption);
  }
}

    // let objAssumtion = {};
    // let reportAssumption = [];

    let reportAssumption: ReportData[] = [];


    speedsForAssumption.forEach((speed) => {
      
      
      const { loadFactor, SFOC } = getSpeedData(speed);

      console.log(`speed: ${speed}, SFOC: ${SFOC}, loadFactor: ${loadFactor}`)


      // let totalH = (distance + ( roundedTimeDifferenceInHours_CurrentVsTimeTenderAt * speed ) ) / speed;

      // let totalH = distance / speed;

      let totalH = updatedEmissionForm.dtgAtVirtualNOR  / speed;

      // console.log(`DTG: ${distance + ( roundedTimeDifferenceInHours_CurrentVsTimeTenderAt * speed )}, speed : ${speed} ,time :${totalH}`);
      let totalD = totalH / 24;
      let timestampInMillis = new Date(latestAISData?.TIMESTAMP).getTime();
      let newTimestampInMillis = timestampInMillis + totalD * 24 * 60 * 60 * 1000;
      let newTimestampDate = new Date(newTimestampInMillis);

      let formattedDate = newTimestampDate.toLocaleString();

      
      let rowETBDate: Date = ETB;
      

      let timeDifferenceInMilliseconds: number = rowETBDate.getTime() - newTimestampDate.getTime();
      let timeDifferenceInHours: number = timeDifferenceInMilliseconds / (1000 * 60 * 60);
      timeDifferenceInHours = parseFloat(timeDifferenceInHours.toFixed(1));

      let MTD = (((loadFactor * transportData?.ME_kW_used) * SFOC ) / 10 ** 6) * 24;
      MTD = parseFloat(MTD.toFixed(2));
      // console.log('MTD',MTD);
      // console.log('me_kw',transportData?.ME_kW_used);

      

      let actualCons = MTD * (totalH / 24);
      actualCons = parseFloat(actualCons.toFixed(2));



      let objAssumption: ReportData = {
        speed: speed,
        totalH: totalH,
        ETA: newTimestampDate,
        EWT: timeDifferenceInHours,
        MTD: MTD,
        actualCons: actualCons,
        FOconsatanchorage: 0,
        totalConsumption: 0,
        CO2: 0,
        SOx: 0,
        NOx: 0,
        loadFactor: loadFactor,
        anchorageTime: 0,
      };

      reportAssumption.push({ ...objAssumption });
      // console.log(reportAssumption);
    });

   
    if (reportAssumption.length > 0) {
      let lastTotalH = reportAssumption[reportAssumption.length - 1].totalH;
      reportAssumption.forEach((data) => {

        // let lastTotalH = data.totalH;


        let currentTotalH = data.totalH;
        let anchorageTime = lastTotalH - currentTotalH;
        console.log(`last: ${lastTotalH}, current: ${currentTotalH}, anc.TIME: ${anchorageTime}, MTD: ${data.MTD} `);
        

        let formattedAnchorageTime = parseFloat(anchorageTime.toFixed(2));

        data.anchorageTime = formattedAnchorageTime;
        let fo: number;
        // fo = (4 * 24) / data.anchorageTime;

        fo = (data.MTD / 24) * anchorageTime * 0.04 ;


        if (fo === Infinity || isNaN(fo)) {
          fo = 0;
        }
        data.FOconsatanchorage = fo;

        let tCon = data.actualCons + data.FOconsatanchorage;
        tCon = parseFloat(tCon.toFixed(1));
        data.totalConsumption = tCon;

        let co2: any;
        co2 = data.totalConsumption * 3.14;
        data.CO2 = parseFloat(co2.toFixed(2));

        let sox: any;
        sox = 2 * 0.97753 * 0.005 * data.totalConsumption;
        data.SOx = parseFloat(sox.toFixed(2));

        let nox: any;

        let factor: number;
        
// Assign the factor based on the buildYear
if (transportData?.buildYear <= 2011) {
  factor = 17;
} else if (transportData?.buildYear > 2012 && transportData?.buildYear <= 2015) {
  factor = 14.4;
} else if (transportData?.buildYear >= 2016) {
  factor = 3.4;
} else {
  // Default factor if buildYear is not in the expected range
  factor = 3.4; // or some other default value if needed
}

        nox =
          (transportData?.ME_kW_used *
            // transportData?.NOx_g_kwh *

             factor *
            lastTotalH *
            data.loadFactor) /
          1000000;


        data.NOx = parseFloat(nox.toFixed(2));
      });
      setEReportAssumption(reportAssumption);
      
    }

  }
  else{
    console.log('out-----transport',transportData?.transportName);
  }
  };



const handleSaveJITReport = async (voyageId: any, voyageName : string, vesselName: string, IMO: Number, port: string) => {
  console.log(voyageId);
  console.log(voyageName);
  console.log(vesselName);
  console.log(IMO);
  console.log(port);

  // Ensure that submittedData and EReport are available and in the correct format
  if (!submittedData ) {
    alert("Please make sure all necessary data is provided.");
    return;
  }
// Ensure EReport is a valid array
const isEReportValid = Array.isArray(EReport) && EReport.length > 0;
const isEReportAssumptionValid = Array.isArray(EReportAssumption) && EReportAssumption.length > 0;

console.log("isEReportValid:", isEReportValid);
console.log("isEReportAssumptionValid:", isEReportAssumptionValid);

let emissionData: any = [];

if (isEReportValid) {
  emissionData = [
    {
      speed: EReport[0]?.speed || null,
      ETA: EReport[0]?.ETA || null,
      EWT: EReport[0]?.EWT || null,
      CO2: EReport[0]?.CO2 || null,
      SOx: EReport[0]?.SOx || null,
      NOx: EReport[0]?.NOx || null,
      totalConsumption: EReport[0]?.totalConsumption || null,
    },
    ...(isEReportAssumptionValid
      ? EReportAssumption.map((assumption: any) => ({
          speed: assumption.speed || null,
          ETA: assumption.ETA || null,
          EWT: assumption.EWT || null,
          CO2: assumption.CO2 || null,
          SOx: assumption.SOx || null,
          NOx: assumption.NOx || null,
          totalConsumption: assumption.totalConsumption || null,
        }))
      : []),
    
  ];
}
// Ensure EmissionData is only added if not empty
const reportData: any = {
  VoyageId: voyageId,
  VoyageName: voyageName,
  VesselName: vesselName,
  port: port,
  IMO: IMO,
  CalculatedData: {
    JitEta: submittedData.JitEta,
    pointOfSpeedReduction: submittedData.pointOfSpeedReduction,
    ETB: submittedData.ETB,
    currentDTG: submittedData.currentDTG,
    positionReportedAt: submittedData.positionReportedAt,
    currentETA: submittedData.currentETA || null,
    currentSpeed: submittedData.currentSpeed,
    dtgAtVirtualNOR: submittedData.dtgAtVirtualNOR,
    speedToMaintainETB: submittedData.speedToMaintainETB,
  },
};

// 🔹 Only add EmissionData if it's not empty
if (emissionData.length > 0) {
  reportData.EmissionData = emissionData;
}

console.log("Final Report Data:", reportData);


  console.log(reportData);
  
  try {

    const baseURL = process.env.REACT_APP_API_BASE_URL;
 

    // Send the request to the backend
    const response = await axios.post(`${baseURL}/api/jit-report`, {
      reportData: reportData
    });

    // Handle response and success case
    if (response.status === 200) {
      console.log('Report saved successfully', response.data);
       Swal.fire('Success', 'JIT Report saved successfully!', 'success')
    } else {
      console.error('Failed to save the report', response.data);
    }
  } catch (error) {
        console.error('Error saving the report:', error);
        Swal.fire('Error', 'Failed to save JIT Report data. ' , 'error')
  }
};


  // Function to get the current date-time in the user's local timezone
  const getLocalDateTime = () => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's timezone (e.g., "Asia/Kolkata" for India, "America/New_York" for USA)
    const currentDate = new Date();

    // Convert the local time to the user's timezone
    const localTime = toZonedTime(currentDate, userTimeZone);
    console.log('localTime', localTime);

    // Return the formatted local date-time (you can adjust the format as per your needs)
    return localTime;
  };


  const handleEmissionIconClick = (rowId: any) => {
    setIsEmissionFormOpen((prevIsOpen) => {
      const newState = !prevIsOpen;
      setEReport([]);
      setEReportAssumption([]);
      setSubmittedData(null);
      setEmissionForm({
        JitEta: null,
        pointOfSpeedReduction: getLocalDateTime(),  // Set to local time
        ETB: null
      });
      return newState;
    });
    setSelectedTransportId(rowId);
  };





  return (
    <div>
      {/* {isLoading ? (
        <Typography variant="h6" align="center">
          <CircularProgress />
        </Typography>
      ) : ( */}
        <React.Fragment>
          {data.length === 0 ? (
            <Typography
              variant="h6"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "10vh",
              }}
            >
              No data added of voyage yet.
            </Typography>
          ) : (
            // <Scrollbar>
              <React.Fragment>
                <div style={{overflow:"auto", width:"100%"}}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontFamily: "'Arial', sans-serif",fontSize: "17px", }}>
                      <thead style={{backgroundColor:" #0F67B1", color:"#fff"}}>
                      <tr style={{ border: "1px solid #A6AEBF" }}>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>Name</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>AIS ETA</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>PortName</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>TransportName</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>BerthName</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>ATB</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>ActualBerth</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>Status</th>
                          <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>Emission</th>
                      {/* <th style={{backgroundColor:" #0F67B1", color:"#fff", padding:"10px"}}>Actions</th> */}
                          </tr>
                        </thead>
                        <tbody>

                          {data.map((data: any) => {
                            return (
                              <React.Fragment key={data._id}>
                                <tr style={{ border: "1px solid #A6AEBF"}}>
                                <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>{data?.name}</td>
                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                  {data?.AISETA ? format(data.AISETA, 'dd-MM-yyyy HH:mm') : '--' }
                                  </td>
                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                    {data?.port?.name}
                                  </td>
                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                    {data?.transport?.transportName}
                                  </td>
                                

                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>{data?.BerthName}</td>
                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                              
                                  {data?.ATB && data.ATB !== "1970-01-01T00:00:00.000Z" ? format(new Date(data.ATB), 'dd-MM-yyyy HH:mm') : '--'}

                                    {/* {isValid(new Date(data?.ATB))
                                      ? format(
                                       data?.ATB,
                                           'dd-MM-yyyy HH:mm'
                                        )
                                      : "--"} */}
                                  </td>

                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                    {data && data.A_Berth ? data.A_Berth : "--"}
                                  </td>
                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                    <Box
                                      style={{
                                        color:
                                          data.status === "complete"
                                            ? "darkgreen"
                                            : "darkorange",
                                      }}
                                    >
                                      {formatString(data.status)}
                                    </Box>
                                  </td>
                                  <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                    <ButtonGroup variant="text" size="small" aria-label="grouped button group">
                                      {/* JIT Report Icon Button */}
                                      <Tooltip title="JIT Report">
                                        <IconButton
                                          onClick={() => handleEmissionIconClick(data._id)}
                                        >
                                          <SummarizeIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>

                                      {/* Download JIT Report Button */}
                                      <CSVLink
                                        data={EReport}
                                        headers={[
                                          { label: "Speed", key: "speed" },
                                          { label: "ETA", key: "ETA" },
                                          { label: "EWT", key: "EWT" },
                                          { label: "CO2", key: "CO2" },
                                          { label: "SOx", key: "SOx" },
                                          { label: "NOx", key: "NOx" },
                                          { label: "totalConsumption", key: "totalConsumption" },
                                        ]}
                                        filename={`emission_report_${data._id}.csv`}
                                        style={{ textDecoration: "none" }}
                                      >
                                        <Tooltip title="Download JIT Report">
                                          <IconButton>
                                            <CloudDownloadIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </CSVLink>
                                    </ButtonGroup>
                                    </td>
                                  {/* <td style={{ border: "1px solid #A6AEBF", padding: "10px" }}>
                                    {data.status === "complete" ? (
                                      <>
                                        <Tooltip title="Edit">
                                          <IconButton
                                            size="small"
                                            // onClick={() => handleETBOpen(data._id)}
                                          >
                                            <PencilAltIcon
                                              fontSize="small"
                                              style={{ color: "darkgreen" }}
                                            />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Voyage Complated">
                                          <IconButton size="small">
                                            <DoneAllIcon
                                              fontSize="small"
                                              style={{ color: "darkgreen" }}
                                            />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <>
                                        <Tooltip title="Edit">
                                          <IconButton
                                            size="small"
                                            // onClick={() => handleETBOpen(data._id)}
                                          >
                                            <PencilAltIcon
                                              fontSize="small"
                                              style={{ color: "darkgreen" }}
                                            />
                                          </IconButton>
                                        </Tooltip> 
                                        <Tooltip title="Complete Voyage">
                                          <IconButton
                                            size="small"
                                            // onClick={() => handleOpen(data._id)}
                                            role="button"
                                            tabIndex={0}
                                          >
                                            <DoneIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Voyage">
                                          <IconButton
                                            size="small"
                                            // onClick={() => openRemoveDialog(data._id)}
                                            role="button"
                                            tabIndex={0}
                                          >
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        </Tooltip> 
                                      </>
                                    )}
                                  </td> */}
                                </tr>
                                {isEmissionFormOpen &&
                                  selectedTransportId === data._id && (
                                    <TableRow>
                                      <TableCell colSpan={9}>
                                        <Collapse
                                          in={
                                            isEmissionFormOpen &&
                                            selectedTransportId === data._id
                                          }
                                        >
                                          <Grid
                                            container
                                            spacing={2}
                                            alignItems="center"
                                            p={3}
                                          >
                                            <Grid item xs={12} md={4}>
                                              <Typography
                                                variant="subtitle1"
                                                style={{ fontSize: "12px" }}
                                              >
                                                {/* Virtual Tendered NOR Date & Time */}
                                                JIT ETA
                                              </Typography>

                                              <DateTimePicker
                                                onChange={(date) =>
                                                  setEmissionForm({
                                                    ...emissionForm,
                                                    JitEta: date,
                                                  })
                                                }
                                                value={
                                                  emissionForm.JitEta
                                                }
                                                clearIcon={<ClearIcon />}
                                                calendarIcon={<EventIcon />}
                                                format="dd-MM-yyyy HH:mm"
                                                disableClock={true}
                                              />
                                              
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                              <Typography
                                                variant="subtitle2"
                                                style={{ fontSize: "12px" }}
                                              >
                                                {/* Actual Tendered NOR Date & Time */}
                                              Point Of Speed Reduction
                                              </Typography>
                                              <DateTimePicker
                                                onChange={(date) =>
                                                  setEmissionForm({
                                                    ...emissionForm,
                                                    pointOfSpeedReduction: date,
                                                  })
                                                }
                                                value={emissionForm.pointOfSpeedReduction}
                                                clearIcon={<ClearIcon />}
                                                calendarIcon={<EventIcon />}
                                                format="dd-MM-yyyy HH:mm"
                                                disableClock={true}
                                              />
                                            </Grid>

                                            {/* ETB*/}

                                            <Grid item xs={12} md={4}>
                                              <Typography
                                                variant="subtitle2"
                                                style={{ fontSize: "12px" }}
                                              >
                                            ETB
                                              </Typography>
                                              <DateTimePicker
                                                onChange={(date) =>
                                                  setEmissionForm({
                                                    ...emissionForm,
                                                    ETB: date,
                                                  })
                                                }
                                                value={emissionForm.ETB}
                                                clearIcon={<ClearIcon />}
                                                calendarIcon={<EventIcon />}
                                                format="dd-MM-yyyy HH:mm"
                                                disableClock={true}
                                              />
                                            </Grid>
                                                
                                            {/* end  */}
                                            <Grid container spacing={2} justifyContent="flex-start" alignItems="center" style={{marginTop:"5px", marginLeft:"5px"}}>
                                                <Grid item>
                                                  <Tooltip title="Submit">
                                                    <IconButton
                                                      size="small" // Smaller size
                                                      color="primary"
                                                      onClick={() => handleSubmitEmissionForm(data)}
                                                      sx={{
                                                        backgroundColor: '#1976d2', // Blue background
                                                        color: '#fff',
                                                        borderRadius: '8px', // Slightly smaller radius for a more compact look
                                                        padding: '8px', // Reduced padding
                                                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)', // Subtle shadow
                                                        '&:hover': {
                                                          backgroundColor: '#1565c0', // Darker blue on hover
                                                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', // Slightly deeper shadow
                                                        },
                                                      }}
                                                    >
                                                      <SendIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                </Grid>

                                                <Grid item>
                                                  <Tooltip title="Reset">
                                                    <IconButton
                                                      size="small" // Smaller size
                                                      onClick={handleReset}
                                                      sx={{
                                                        backgroundColor: '#f44336', // Red background
                                                        color: '#fff',
                                                        borderRadius: '8px',
                                                        padding: '8px',
                                                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                                                        '&:hover': {
                                                          backgroundColor: '#d32f2f', // Darker red on hover
                                                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                                                        },
                                                      }}
                                                    >
                                                      <ClearIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                </Grid>

                                                {showSaveButton && (
                                                  <Grid item>
                                                    <Tooltip title="Save">
                                                      <IconButton
                                                        size="small" // Smaller size
                                                        onClick={() =>
                                                          handleSaveJITReport(
                                                            data._id,
                                                            data.name,
                                                            data.transport.transportName,
                                                            data.transport.imoNumber,
                                                            data.port.name
                                                          )
                                                        }
                                                        sx={{
                                                          backgroundColor: '#4caf50', // Green background
                                                          color: '#fff',
                                                          borderRadius: '8px',
                                                          padding: '8px',
                                                          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                                                          '&:hover': {
                                                            backgroundColor: '#388e3c', // Darker green on hover
                                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                                                          },
                                                        }}
                                                      >
                                                        Save
                                                      </IconButton>
                                                    </Tooltip>
                                                  </Grid>
                                                )}
                                            </Grid>
                                          </Grid>
                                            {submittedData && Object.keys(submittedData).length > 0 && (
                                              <div style={{ padding: '20px', margin: '20px', border: '1px solid lightgray', borderRadius: '8px' }}>
                                                <h3 style={{ marginBottom: '15px' }}>Calculated Data</h3>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px',  }}>
                                                  <thead>
                                                    <tr>
                                                      <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center',backgroundColor:" #0F67B1", color:"#fff" }}>Field</th>
                                                      <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center',backgroundColor:" #0F67B1", color:"#fff" }}>Value</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {[
                                                      { label: 'JIT ETA',  value: submittedData?.JitEta ? format(submittedData.JitEta, 'dd-MM-yyyy HH:mm') : 'N/A'},
                                                      { label: 'Point Of Speed Reduction', value: submittedData?.pointOfSpeedReduction ? format(submittedData.pointOfSpeedReduction, 'dd-MM-yyyy HH:mm') : 'N/A' },
                                                      { label: 'ETB', value: submittedData?.ETB ? format(submittedData.ETB, 'dd-MM-yyyy HH:mm') : 'N/A' },
                                                      { label: 'Current DTG', value: submittedData.currentDTG },
                                                      { label: 'Position Reported At', value: submittedData?.positionReportedAt ? format(submittedData.positionReportedAt, 'dd-MM-yyyy HH:mm') : 'N/A' },
                                                      { label: 'Current ETA - AIS', value: submittedData?.currentETA ? format(submittedData.currentETA, 'dd-MM-yyyy HH:mm') : 'N/A' },
                                                      { label: 'Current Speed', value: submittedData.currentSpeed },
                                                      { label: 'DTG At Virtual NOR', value: submittedData.dtgAtVirtualNOR },
                                                      { label: 'Speed To Maintain ETB', value: submittedData.speedToMaintainETB },
                                                    ].map((data: any, index) => (
                                                      <tr key={index}
                                                      style={{
                                                        backgroundColor: data.label === 'Speed To Maintain ETB' && submittedData.speedToMaintainETB  > 8 ? '#EB5A3C' : '',
                                                        // color: data.label === 'Speed To Maintain ETB' && submittedData.speedToMaintainETB  > 8 ? 'white' : 'black',
                                                      }}
                                                      >
                                                        <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>{data.label}</td>
                                                        <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                        {data.value instanceof Date ? data.value.toLocaleString() : data.value || '--'}
                                                      </td>

                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>

                                                <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Emission Data Table</h3>

                                                {EReport.length > 0 ? (
                                                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                                    <thead  style={{backgroundColor:" #0F67B1", color:"#fff"}}>
                                                      <tr>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Speed <sub>(knots)</sub></th>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Calculated ETA</th>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Estimated Waiting Time (hrs)</th>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>CO<sub>2</sub> (MT)</th>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>SO<sub>x</sub> (MT)</th>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>NO<sub>x</sub> (MT)</th>
                                                        <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Fuel Consumption (MT)</th>
                                                      </tr>
                                                    </thead>

                                                    {/* <tbody> */}
                                                      {EReport.map((data: any, index) => (
                                                        <tr key={index} style={{ backgroundColor:'#A9C46C'}}>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data.speed} <sup style={{fontSize:"15px", color:"#fff"}}> (current speed) </sup>
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                      
                                                          {/* {  format(data?.ETA, 'dd-MM-yyyy HH:mm')  || ''} */}
                                                          {/* {data?.ETA} */}
                                                        
                                                            {isValid(new Date(data?.ETA)) ? format(new Date(data?.ETA), "dd-MM-yyyy HH:mm ") : '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                              {data?.EWT !== undefined && data?.EWT !== null && !Number.isNaN(data?.EWT)  ? (
                                                                data?.EWT < 0 ? 
                                                                  `Late by ${Math.abs(data?.EWT)}` : 
                                                                  `Early by ${data?.EWT}`
                                                              ) : '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.CO2 || '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.SOx || '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.NOx || '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.totalConsumption || '--'}
                                                          </td>
                                                        </tr>
                                                      ))}

                                                      { EReportAssumption.length <= 10 &&   EReportAssumption.map((data: any, index) => (
                                                        <tr key={index}>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data.speed}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                          {/* {  format(data?.ETA, 'dd-MM-yyyy HH:mm')  || ''} */}
                                                          {/* {data?.ETA} */}


                                                          {isValid(new Date(data?.ETA)) ? format(new Date(data?.ETA), "dd-MM-yyyy HH:mm ") : '--'}
                                                          
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                              {data?.EWT !== undefined && data?.EWT !== null && !Number.isNaN(data?.EWT) && data?.EWT !==0  ? (
                                                                data?.EWT < 0 ? 
                                                                  `Late by ${Math.abs(data?.EWT)}` : 
                                                                  `Early by ${data?.EWT}`
                                                              ) : '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.CO2 || '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.SOx || '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.NOx || '--'}
                                                          </td>
                                                          <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                                                            {data?.totalConsumption || '--'}
                                                          </td>
                                                        </tr>
                                                      ))}

                                                      {EReportAssumption.length > 10 && EReportAssumption.map((data: any, index) => (
                                                        <tr
                                                          key={index}
                                                          style={{
                                                            backgroundColor: index === 0 ? '#EB5A3C' : '', // Apply red color to the first row if length > 10
                                                            border: '1px solid lightgray',
                                                          }}
                                                        >
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {data.speed}
                                                          </td>
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {isValid(new Date(data?.ETA)) ? format(new Date(data?.ETA), "dd-MM-yyyy HH:mm ") : '--'}
                                                          </td>
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {data?.EWT !== undefined && data?.EWT !== null && !Number.isNaN(data?.EWT) && data?.EWT !== 0 ? (
                                                              data?.EWT < 0 ?
                                                                `Late by ${Math.abs(data?.EWT)}` :
                                                                `Early by ${data?.EWT}`
                                                            ) : '--'}
                                                          </td>
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {data?.CO2 || '--'}
                                                          </td>
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {data?.SOx || '--'}
                                                          </td>
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {data?.NOx || '--'}
                                                          </td>
                                                          <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            {data?.totalConsumption || '--'}
                                                          </td>
                                                        </tr>
                                                      ))}

                                                    
                                                    {/* </tbody> */}
                                                  </table>
                                                ) : (
                                                  <div style={{ textAlign: 'center', marginTop: '20px', color: 'gray', fontSize: '16px' }}>
                                                    Vessel Type is Container Ship / Car Carrier , So no emission data available .
                                                  </div>
                          )}
                                              </div>
                                            )}
                                        </Collapse>
                                      </TableCell>
                                    </TableRow>
                                  )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                    </table>
                </div>
                {/* <TablePagination
                  component="div"
                  count={dataCount}
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowsPerPageChange}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                /> */}
              </React.Fragment>
            // </Scrollbar>
          )}
        </React.Fragment>
      {/* )} */}
    </div>
  );
};


// VoyageTabel.propTypes = {
//   data: PropTypes.array.isRequired,
//   dataCount: PropTypes.number.isRequired,
//   onPageChange: PropTypes.func,
//   onRowsPerPageChange: PropTypes.func,
//   page: PropTypes.number.isRequired,
//   rowsPerPage: PropTypes.number.isRequired,
//   isLoading: PropTypes.bool.isRequired,
//   openDialog: PropTypes.func,
//   openETB: PropTypes.func,
//   openRemoveDialog: PropTypes.func
// };



// VoyageTabel.propTypes = {
//   selectedVessel: PropTypes.shape({
//     SpireTransportType: PropTypes.string,
//     AIS: PropTypes.shape({
//       NAME: PropTypes.string,
//       IMO: PropTypes.string,
//       CALLSIGN: PropTypes.string,
//       SPEED: PropTypes.number,
//       DESTINATION: PropTypes.string,
//       SpireTransportType: PropTypes.string,
//       LATITUDE: PropTypes.number,
//       LONGITUDE: PropTypes.number,
//       HEADING: PropTypes.number,
//       ETA: PropTypes.string,
//     }),
//   })
// };

export default VoyageTabel;
