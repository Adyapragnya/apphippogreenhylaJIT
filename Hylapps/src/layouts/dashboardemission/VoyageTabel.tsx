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
  TextField,
  Paper,
} from "@mui/material";
// import { format } from "date-fns";
import {  isValid } from "date-fns";
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

 const VoyageTabel = () => {
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
      virtualNORTenderedDate: Date | null;
      timeTenderedAt: Date | null;
      ETB: Date | null;
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
      ETA: Date | string ,
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
    virtualNORTenderedDate: null as Date | null,
    timeTenderedAt: null as Date | null,
    ETB: null as Date | null
  });

  const [isEmissionFormOpen, setIsEmissionFormOpen] = useState(false);

  const [data, setData] = useState([]);
  const [ports, setPorts] = useState([]);


  

  
  useEffect(() => {
    fetchVoyages();
  }, []);

  const fetchVoyages = async () => {
    try {

      const baseURL = process.env.REACT_APP_API_BASE_URL;
 
      const response = await axios.get(`${baseURL}/api/get-voyages`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching voyages:', error);
    }
  };


  useEffect(() => {
    fetchPorts();
  }, []);

  const fetchPorts = async () => {
    try {

      const baseURL = process.env.REACT_APP_API_BASE_URL;
 
      const response = await axios.get(`${baseURL}/api/get-ports`);
      setPorts(response.data);
    } catch (error) {
      console.error('Error fetching ports:', error);
    }
  };






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
      virtualNORTenderedDate: null,
      timeTenderedAt: null,
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

    if (!emissionForm.virtualNORTenderedDate || !emissionForm.timeTenderedAt || !emissionForm.ETB) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (emissionForm.timeTenderedAt > emissionForm.virtualNORTenderedDate) {
      toast.error(
        "Time Tendered At Date should be less than to virtual NOR Tendered Date."
      );
      return;
    }

    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(
        `${baseURL}/api/${row.transport.imoNumber}/${emissionForm.timeTenderedAt}`,
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

    // time diffrence TIMESTAMP-timeTenderedAt
    const timeTenderedAt = new Date(emissionForm.timeTenderedAt);

    const aisTimestamp = new Date(latestAISData?.TIMESTAMP);

    // const ETB = new Date(row.ETB);
    const ETB = new Date(emissionForm.ETB);


    const timeDifferenceInMilliseconds_CurrentVsTimeTenderAt =
      aisTimestamp.getTime() - timeTenderedAt.getTime();

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
      positionReportedAt: new Date(latestAISData?.TIMESTAMP),
      currentETA: latestAISData?.ETA ? formatDate(latestAISData?.ETA): null ,
      currentSpeed: latestAISData?.SPEED,
      ETB: emissionForm?.ETB,

      // ETB: row?.ETB,
    };

    const updatedEmissionForm = {
      ...emissionForm,
      ...additionalData,
    };
    setSubmittedData(updatedEmissionForm );

    // let obj = {};
   
    // let report = [];
  


    let report: ReportData[] = [];
    if (transportData && latestAISData) {
      // transportData?.SOFC_map_array.map((data: any, index: any) => {
      // transportData?.map((data: any, index: any) => {

        // let totalH = distance / data.speed;
    
        let totalH = distance / latestAISData?.SPEED ;


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
          // ((data.loadFactor * transportData?.ME_kW_used * data.sofc) /
          // ((transportData.loadFactor * transportData.ME_kW_used * data.sofc) /
          ((transportData?.Loadfactor_ds * transportData?.ME_kW_used * 191 ) /
            10 ** 6) *
          24;
        MTD = parseFloat(MTD.toFixed(2));
        let actualCons = MTD * (totalH / 24);
        actualCons = parseFloat(actualCons.toFixed(2));

        let obj: ReportData = {
     
          speed: latestAISData?.SPEED ,

          totalH: totalH,
          ETA: formattedDate,
          EWT: timeDifferenceInHours,
          MTD: MTD,
          actualCons: actualCons,
          FOconsatanchorage: 0,
          totalConsumption: 0,
          CO2: 0,
          SOx: 0,
          NOx: 0,
          loadFactor: transportData?.Loadfactor_ds,
          anchorageTime: 0,
        };


       
        report.push({ ...obj });
        // console.log(report);
       
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
        fo = (4 * 24) / data.anchorageTime;

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
        nox =
          (transportData?.ME_kW_used *
            // transportData?.NOx_g_kwh *

             3.4 *
            lastTotalH *
            data.loadFactor) /
          1000000;
        data.NOx = parseFloat(nox.toFixed(2));
      });
      setEReport(report);
      
    }


    const speedsForAssumption = [8, 9, 10, 11.5, 12.5, 13, 13.5, 14, 14.2, 14.5];

    // let objAssumtion = {};
    // let reportAssumption = [];

    let reportAssumption: ReportData[] = [];


    speedsForAssumption.forEach((speed) => {
      let totalH = distance / speed;
      let totalD = totalH / 24;
      let timestampInMillis = new Date(latestAISData?.TIMESTAMP).getTime();
      let newTimestampInMillis = timestampInMillis + totalD * 24 * 60 * 60 * 1000;
      let newTimestampDate = new Date(newTimestampInMillis);
      let formattedDate = newTimestampDate.toLocaleString();

      
      let rowETBDate: Date = ETB;
      

      let timeDifferenceInMilliseconds: number = rowETBDate.getTime() - newTimestampDate.getTime();
      let timeDifferenceInHours: number = timeDifferenceInMilliseconds / (1000 * 60 * 60);
      timeDifferenceInHours = parseFloat(timeDifferenceInHours.toFixed(1));

      let MTD = ((transportData?.Loadfactor_ds * transportData?.ME_kW_used * 191 ) / 10 ** 6) * 24;
      MTD = parseFloat(MTD.toFixed(2));
      let actualCons = MTD * (totalH / 24);
      actualCons = parseFloat(actualCons.toFixed(2));

      let objAssumption: ReportData = {

        speed: speed,
        totalH: totalH,
        ETA: formattedDate,
        EWT: timeDifferenceInHours,
        MTD: MTD,
        actualCons: actualCons,
        FOconsatanchorage: 0,
        totalConsumption: 0,
        CO2: 0,
        SOx: 0,
        NOx: 0,
        loadFactor: transportData?.Loadfactor_ds,
        anchorageTime: 0,
      };

      reportAssumption.push({ ...objAssumption });
      // console.log(reportAssumption);
    });

   


    if (reportAssumption.length > 0) {
      let lastTotalH = reportAssumption[reportAssumption.length - 1].totalH;
      reportAssumption.forEach((data) => {

        let currentTotalH = data.totalH;
        let anchorageTime = lastTotalH - currentTotalH;
        let formattedAnchorageTime = parseFloat(anchorageTime.toFixed(2));

        data.anchorageTime = formattedAnchorageTime;
        let fo: number;
        fo = (4 * 24) / data.anchorageTime;

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
        nox =
          (transportData?.ME_kW_used *
            // transportData?.NOx_g_kwh *

             3.4 *
            lastTotalH *
            data.loadFactor) /
          1000000;
        data.NOx = parseFloat(nox.toFixed(2));
      });
      setEReportAssumption(reportAssumption);
      
    }


  };



const handleSaveJITReport = async (voyageId: any, voyageName : string) => {
  console.log(voyageId);
  console.log(voyageName);
  
  // Ensure that submittedData and EReport are available and in the correct format
  if (!submittedData || EReport.length === 0) {
    alert("Please make sure all necessary data is provided.");
    return;
  }
  
  // Map your data to the backend format
  const reportData = {
    VoyageId: voyageId,
    VoyageName: voyageName, // You can adjust this based on your requirement
    CalculatedData: {
      virtualNORTenderedDate: submittedData.virtualNORTenderedDate,
      timeTenderedAt: submittedData.timeTenderedAt,
      ETB: submittedData.ETB,
      currentDTG: submittedData.currentDTG,
      positionReportedAt: submittedData.positionReportedAt,
      currentETA: submittedData.currentETA ? submittedData.currentETA : null,
      currentSpeed: submittedData.currentSpeed,
      dtgAtVirtualNOR: submittedData.dtgAtVirtualNOR,
      speedToMaintainETB: submittedData.speedToMaintainETB
    },
    EmissionData: {
      speed: EReport[0].speed,  // Assuming you are sending data for the first entry of the EReport array
      ETA: EReport[0].ETA,
      EWT: EReport[0].EWT,
      CO2: EReport[0].CO2,
      SOx: EReport[0].SOx,
      NOx: EReport[0].NOx,
      totalConsumption: EReport[0].totalConsumption
    }
  };

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
        Swal.fire('Error', 'Failed to save JIT Report data. ')
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
        virtualNORTenderedDate: null,
        timeTenderedAt: getLocalDateTime(),  // Set to local time
        ETB: null
      });
      return newState;
    });
    setSelectedTransportId(rowId);
  };

  // const [csvData, setCSVData] = useState([]);

  // const exportableColumns_2 = [
  //   { label: "Speed", key: "speed" },
  //   { label: "ETA", key: "ETA" },
  //   { label: "EWT", key: "EWT" },
  //   { label: "CO2", key: "CO2" },
  //   { label: "SOx", key: "SOx" },
  //   { label: "NOx", key: "NOx" },
  //   {
  //     label: "totalConsumption",
  //     key: "totalConsumption",
  //   },
  // ];

  // Helper function to render list items
  const renderListItem = (label: any, value : any) => (
    <Grid item xs={12} sm={4}>
      <List>
        <ListItem>
          <ListItemText>
            <Typography
              variant="subtitle2"
              style={{ fontWeight: "bold", color: "dark" }}
            >
              {label} :{" "}
            </Typography>
            <Typography variant="body1">
              {isDateField(label)
                ? isValid(new Date(value))
                  ? format(new Date(value), "dd-MM-yyyy hh:mm a")
                  : "--"
                : value !== undefined && value !== null
                ? String(value)
                : "--"}
            </Typography>
          </ListItemText>
        </ListItem>
      </List>
    </Grid>
  );

  const isDateField = (fieldName: any) => {
    const dateFields = [
      "Virtual NOR Tendered Date",
      "Time Tendered At",
      "ETB",
      "Position Reported At",
    ];
    return dateFields.includes(fieldName);
  };

  return (
    <div style={{marginLeft:"15%"}}>
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
                <Table style={{height:"20px", width:"1000px", marginTop:"10px", textAlign:"center"}}>
                  <TableHead style={{height:"60px", width:"200px"}}>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>AIS ETA</TableCell>
                      <TableCell>PortName</TableCell>
                      <TableCell>TransportName</TableCell>
                     
                      <TableCell>BerthName</TableCell>
                      <TableCell>ATB</TableCell>
                      <TableCell>ActualBerth</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Emission</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody> 
                    {data.map((data: any) => {
                      return (
                        <React.Fragment key={data._id}>
                          <TableRow>
                            <TableCell>{data?.name}</TableCell>
                            <TableCell>
                            {data?.AISETA}
                              {/* {isValid(new Date(data?.AISETA))
                                ? format(
                                    new Date(data?.AISETA),
                                    "dd-MM-yyyy hh:mm a"
                                  )   
                                : "--"}  */}
                            </TableCell>
                            <TableCell>
                              {data?.port?.name}
                            </TableCell>
                            <TableCell>
                              {data?.transport?.transportName}
                            </TableCell>
                           

                            <TableCell>{data?.BerthName}</TableCell>
                            <TableCell>
                              {isValid(new Date(data?.ATB))
                                ? format(
                                    new Date(data?.ATB),
                                    "dd-MM-yyyy hh:mm a"
                                  )
                                : "--"}
                            </TableCell>

                            <TableCell>
                              {data && data.A_Berth ? data.A_Berth : "--"}
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="JIT Report">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleEmissionIconClick(data._id)
                                  }
                                >
                                  <SummarizeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <CSVLink
                                data={EReport}
                                headers={[
                                  { label: "Speed", key: "speed" },
                                  { label: "ETA", key: "ETA" },
                                  { label: "EWT", key: "EWT" },
                                  { label: "CO2", key: "CO2" },
                                  { label: "SOx", key: "SOx" },
                                  { label: "NOx", key: "NOx" },
                                  {
                                    label: "totalConsumption",
                                    key: "totalConsumption",
                                  },
                                ]}
                                filename={`emission_report_${data._id}.csv`}
                                style={{ textDecoration: "none" }}
                              >
                                <Tooltip title="Download JIT Report">
                                  <IconButton size="small">
                                    <CloudDownloadIcon />
                                  </IconButton>
                                </Tooltip>
                              </CSVLink>
                            </TableCell>
                            <TableCell align="right">
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
                            </TableCell>
                          </TableRow>
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
                                          Virtual Tendered NOR Date & Time
                                        </Typography>
                                                           
                                        <DateTimePicker
                                          onChange={(date) =>
                                            setEmissionForm({
                                              ...emissionForm,
                                              virtualNORTenderedDate: date,
                                            })
                                          }
                                          value={
                                            emissionForm.virtualNORTenderedDate
                                          }
                                          clearIcon={<ClearIcon />}
                                          calendarIcon={<EventIcon />}
                                          format="dd-MM-y hh:mm a"
                                          disableClock={true}
                                        />
                                      </Grid>
                                                          
                                      <Grid item xs={12} md={4}>
                                        <Typography
                                          variant="subtitle2"
                                          style={{ fontSize: "12px" }}
                                        >
                                          Actual Tendered NOR Date & Time
                                        </Typography>
                                        <DateTimePicker
                                          onChange={(date) =>
                                            setEmissionForm({
                                              ...emissionForm,
                                              timeTenderedAt: date,
                                            })
                                          }
                                          value={emissionForm.timeTenderedAt}
                                          clearIcon={<ClearIcon />}
                                          calendarIcon={<EventIcon />}
                                          format="dd-MM-y hh:mm a"
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
                                          format="dd-MM-y hh:mm a"
                                          disableClock={true}
                                        />
                                      </Grid>

                                      {/* end  */}
                                      <Grid item xs={12} md={4}>
                                        <Tooltip title="Submit">
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => {
                                              handleSubmitEmissionForm(data);
                                            }}
                                          >
                                            <SendIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Reset">
                                          <IconButton
                                            size="small"
                                            onClick={handleReset}
                                          >
                                            <ClearIcon />
                                          </IconButton>
                                        </Tooltip>

                                       { showSaveButton && 
                                       <button>
                                       <Tooltip title="Save">
                                          <IconButton
                                            size="small"
                                            onClick={() =>handleSaveJITReport(data._id,data.name)}
                                          >
                                           Save
                                          </IconButton>
                                        </Tooltip>
                                        </button>
                                         }
                                      </Grid>
                                    </Grid>


{submittedData && Object.keys(submittedData).length > 0 && (
  <div style={{ padding: '20px', margin: '20px', border: '1px solid lightgray', borderRadius: '8px' }}>
    <h3 style={{ marginBottom: '15px' }}>Calculated Data</h3>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Field</th>
          <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'Virtual Tendered NOR Date & Time', value: submittedData.virtualNORTenderedDate },
          { label: 'Actual Tendered NOR Date & Time', value: submittedData.timeTenderedAt },
          { label: 'ETB', value: submittedData.ETB },
          { label: 'Current DTG', value: submittedData.currentDTG },
          { label: 'Position Reported At', value: submittedData.positionReportedAt },
          { label: 'Current ETA', value: submittedData.currentETA },
          { label: 'Current Speed', value: submittedData.currentSpeed },
          { label: 'DTG At Virtual NOR', value: submittedData.dtgAtVirtualNOR },
          { label: 'Speed To Maintain ETB', value: submittedData.speedToMaintainETB },
        ].map((data, index) => (
          <tr key={index}>
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
        <thead>
          <tr>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Speed <sub>(knots)</sub></th>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>ETA</th>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Estimated Waiting Time (hrs)</th>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>CO<sub>2</sub> (MT)</th>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>SO<sub>x</sub> (MT)</th>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>NO<sub>x</sub> (MT)</th>
            <th style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>Fuel Consumption (MT)</th>
          </tr>
        </thead>

        {/* <tbody> */}
          {EReport.map((data, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                {data.speed}
              </td>
              <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                {isValid(new Date(data?.ETA)) ? format(new Date(data?.ETA), "dd-MM-yyyy hh:mm a") : '--'}
              </td>
              <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                {data?.EWT || '--'}
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

          {EReportAssumption.map((data, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                {data.speed}
              </td>
              <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                {isValid(new Date(data?.ETA)) ? format(new Date(data?.ETA), "dd-MM-yyyy hh:mm a") : '--'}
              </td>
              <td style={{ border: '1px solid lightgray', padding: '8px', textAlign: 'center' }}>
                {data?.EWT || '--'}
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
        
        {/* </tbody> */}
      </table>
    ) : null}
  </div>
)}

                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
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

export default VoyageTabel;
