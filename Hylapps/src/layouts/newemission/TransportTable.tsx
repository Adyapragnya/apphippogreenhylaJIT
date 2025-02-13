import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Menu,
  MenuItem,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControlLabel,
  Grid,
  ButtonGroup,
  ListItemText,
  ListItem,
  List,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
// import ReactDatePicker from "react-datepicker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { DateTimePicker }  from "react-datetime-picker";

import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";
// import { Scrollbar } from "../scrollbar";

import { toast } from "react-hot-toast";

const EmissionDataFake = [
  {
    speed: "14.5",
    time: "124.1",
    distance: "1800",
    ETA: "Oct-09 16:08",
    EWT: "43.9",
    "cons. MTD": "88.7",
    "Actual cons.": "458.6",
    "nav cons. (MT/nm)": "0.2548",
    "anchorage time": "100.9",
    "FO cons at anchorage": "16.8",
    total_consumption: "475.5",
    CO2: "1492.9",
    SOX: "4.6",
    NOX: "33.4",
    "co2 reduction": "",
    "voyage cons. MT/nm)": "0.2641",
    "CO2 emissions/nm": "0.8294",
    "": "",
  },
  {
    speed: "14.3",
    time: "125.9",
    ETA: "Oct-09 20:34",
    EWT: "39.4",
    distance: "1800",
    "cons. MTD": "82.0",
    "Actual cons.": "430.1",
    "nav cons. (MT/nm)": "0.2390",
    "anchorage time": "99.1",
    "FO cons at anchorage": "16.5",
    total_consumption: "446.6",
    CO2: "1402.4",
    SOX: "4.4",
    NOX: "32.1",
    "co2 reduction": "6%",
    "voyage cons. MT/nm)": "0.2481",
    "CO2 emissions/nm": "0.7791",
    "": "",
  },
  {
    speed: "14.0",
    time: "128.6",
    distance: "1800",
    EWT: "29.5",
    ETA: "Oct-10 6:27",
    "cons. MTD": "77.0",
    "Actual cons.": "412.4",
    "nav cons. (MT/nm)": "0.2291",
    "anchorage time": "96.4",
    "FO cons at anchorage": "16.1",
    total_consumption: "428.5",
    CO2: "1345.4",
    SOX: "4.2",
    NOX: "31.1",
    "co2 reduction": "10%",
    "voyage cons. MT/nm)": "0.2380",
    "CO2 emissions/nm": "0.7475",
    "": "",
  },
  {
    speed: "13.5",
    time: "133.3",
    distance: "1800",
    EWT: "18.0",
    ETA: "Oct-10 18:00",
    "cons. MTD": "66.6",
    "Actual cons.": "370.2",
    "nav cons. (MT/nm)": "0.2057",
    "anchorage time": "91.7",
    "FO cons at anchorage": "15.3",
    total_consumption: "385.5",
    CO2: "1210.4",
    SOX: "3.8",
    NOX: "28.7",
    "co2 reduction": "19%",
    "voyage cons. MT/nm)": "0.2142",
    "CO2 emissions/nm": "0.6725",
    "": "",
  },
  {
    speed: "13.0",
    time: "138.5",
    distance: "1800",
    ETA: "Oct-11 7:38",
    "cons. MTD": "62.1",
    EWT: "4.4",
    "Actual cons.": "358.5",
    "nav cons. (MT/nm)": "0.1992",
    "anchorage time": "86.5",
    "FO cons at anchorage": "14.4",
    total_consumption: "372.9",
    CO2: "1170.9",
    SOX: "3.6",
    NOX: "27.9",
    "co2 reduction": "22%",
    "voyage cons. MT/nm)": "0.2072",
    "CO2 emissions/nm": "0.6505",
    "": "",
  },
  {
    speed: "12.5",
    time: "144.0",
    distance: "1800",
    ETA: "Oct-12 00:00",
    EWT: "-12.0",
    "cons. MTD": "58.3",
    "Actual cons.": "349.9",
    "nav cons. (MT/nm)": "0.1944",
    "anchorage time": "81.0",
    "FO cons at anchorage": "13.5",
    total_consumption: "363.4",
    CO2: "1140.9",
    SOX: "3.6",
    NOX: "27.1",
    "co2 reduction": "24%",
    "voyage cons. MT/nm)": "0.2019",
    "CO2 emissions/nm": "0.6338",
    "": "",
  },
  {
    speed: "11.5",
    time: "156.5",
    distance: "1800",
    "cons. MTD": "50.8",
    ETA: "Oct-12 20:00",
    EWT: "-32.0",
    "Actual cons.": "331.2",
    "nav cons. (MT/nm)": "0.1840",
    "anchorage time": "68.5",
    "FO cons at anchorage": "11.4",
    total_consumption: "342.6",
    CO2: "1075.8",
    SOX: "3.3",
    NOX: "25.2",
    "co2 reduction": "28%",
    "voyage cons. MT/nm)": "0.1903",
    "CO2 emissions/nm": "0.5977",
    "": "",
  },
  {
    speed: "10.0",
    time: "180.0",
    distance: "1800",
    ETA: "Oct-13 21:00",
    EWT: "-57.0",
    "cons. MTD": "42.8",
    "Actual cons.": "320.8",
    "nav cons. (MT/nm)": "0.1782",
    "anchorage time": "45.0",
    "FO cons at anchorage": "7.5",
    total_consumption: "328.3",
    CO2: "1030.8",
    SOX: "3.2",
    NOX: "24.2",
    "co2 reduction": "31%",
    "voyage cons. MT/nm)": "0.1824",
    "CO2 emissions/nm": "0.5726",
    "": "",
  },
  {
    speed: "9.0",
    time: "200.0",
    distance: "1800",
    "cons. MTD": "34.4",
    ETA: "Oct-14 16:08",
    EWT: "-58.5",
    "Actual cons.": "286.6",
    "nav cons. (MT/nm)": "0.1592",
    "anchorage time": "25.0",
    "FO cons at anchorage": "4.2",
    total_consumption: "290.8",
    CO2: "913.1",
    SOX: "2.8",
    NOX: "21.5",
    "co2 reduction": "39%",
    "voyage cons. MT/nm)": "0.1615",
    "CO2 emissions/nm": "0.5073",
    "": "",
  },
  {
    speed: "8.0",
    time: "225.0",
    distance: "1800",
    ETA: "Oct-14 20:10",
    EWT: "-60.9",
    "cons. MTD": "25.9",
    "Actual cons.": "243.1",
    "nav cons. (MT/nm)": "0.1351",
    "anchorage time": "0.0",
    "FO cons at anchorage": "0.0",
    total_consumption: "243.1",
    CO2: "763.3",
    SOX: "2.4",
    NOX: "18.1",
    "co2 reduction": "49%",
    "voyage cons. MT/nm)": "0.1351",
    "CO2 emissions/nm": "0.4241",
    "": "",
  },
];

interface Transport {
    imoNumber: number;
    transportName: string;
    transportCategory: string;
    transportSubCategory: string;
    SpireTransportType: string;
    buildYear: number;
    // You can add any other necessary fields here
  }
  

  
interface TransportTableProps {
    // transports: Transport[];
    handleRemoveFromTable: (imoNumber: number) => void;  // assuming you're removing by imoNumber
    handleSelectTransport: (selectedIds: (string | number)[]) => void;  // assuming selectedIds can be a string or number
  }
  
const TransportTable: React.FC<TransportTableProps> = ({
    // transports,
    handleRemoveFromTable,
    handleSelectTransport,
  }) => {
  const [columns, setColumns] = useState([
    { field: "transportName", headerName: "Transport Name" },
    { field: "imoNumber", headerName: "IMO Number" },
    { field: "transportCategory", headerName: "Category" },
    { field: "transportSubCategory", headerName: "SubCategory" },
    { field: "SpireTransportType", headerName: "SpireTransportType" },
    { field: "buildYear", headerName: "buildYear" },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (row : any) => (
        <>
          <Tooltip title="Remove">
            <IconButton
            //  onClick={() => handleRemoveFromTable(row)} 
            size="small">
              <RemoveCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Emission Visibility">
            <IconButton
              size="small"
              onClick={() => handleEmissionIconClick(row._id)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ]);
  const [filteredAndSortedTransports, setFilteredAndSortedTransports] = useState<Transport[]>([]);

    const [selectedTransportId, setSelectedTransportId] = useState<string | number | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [selectAll, setSelectAll] = useState(false);



  const [transports, setTransports] = useState<Transport[]>([]);

useEffect(() => {
  const fetchTransports = async () => {
    try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;

      

      const response = await fetch(`${baseURL}/api/get-tracked-vessels-emission`);
      const data = await response.json();
      setTransports(data); // Set the fetched data into state
    } catch (error) {
      console.error('Error fetching transport data:', error);
    }
  };

  fetchTransports();
}, []);


  interface EmissionForm {
    virtualNORTenderedDate: Date | null;
    timeTenderedAt: Date | null;
    ETB: Date | null;
    berthName: null | string;
    dtgAtVirtualNOR: number;
    speedToMaintainETB: number;
    currentDTG: number;
    positionReportedAt: string;
    currentETA: string;
    currentTime: string;
    currentSpeed: number;
  }
  const [submittedData, setSubmittedData] = useState<EmissionForm | null>(null);

  const [emissionForm, setEmissionForm] = useState({
    virtualNORTenderedDate: null as Date | null,
    timeTenderedAt: null as Date | null ,
    ETB: null as Date | null ,
    berthName: null as string | null,
  });
  const [isEmissionFormOpen, setIsEmissionFormOpen] = useState(false);

  const handleEmissionIconClick = (rowId: any) => {
    setIsEmissionFormOpen((prevIsOpen) => {
      console.log("Previous State:", prevIsOpen);
      const newState = !prevIsOpen;
      console.log("New State:", newState);
      return newState;
    });
    setSelectedTransportId(rowId);
  };



  const handleSubmitEmissionForm = (row:any) => {
    if (
      !emissionForm.virtualNORTenderedDate ||
      !emissionForm.timeTenderedAt ||
      !emissionForm.ETB
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // if (emissionForm.virtualNORTenderedDate >= emissionForm.ETB) {
    //   toast.error(
    //     "Virtual NOR Tendered Date should be less than or equal to ETB."
    //   );
    //   return;
    // }

    // if (emissionForm.timeTenderedAt > emissionForm.virtualNORTenderedDate) {
    //   toast.error(
    //     "Time Tendered At Date should be less than to virtual NOR Tendered Date."
    //   );
    //   return;
    // }

    // if (emissionForm.timeTenderedAt > emissionForm.ETB) {
    //   toast.error("Time Tendered At Date should be less than to ETB.");
    //   return;
    // }

    const additionalData = {
        dtgAtVirtualNOR: 150,
        speedToMaintainETB: 10,
        currentDTG: 120,
        positionReportedAt: "Oct-14 12:34",
        currentETA: "Oct-15 12:34",
        currentTime: "Oct-16 12:34",
        currentSpeed: 15,
      };
      
      const updatedEmissionForm: EmissionForm = {
        ...emissionForm,
        ...additionalData,
      };

    console.log("Emission Form Values:", updatedEmissionForm);
    setSubmittedData(updatedEmissionForm);
  };

  const handleFilterClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };



  const originalColumnsOrder = columns.map((col) => col.field);
  const initiallyHiddenColumns = [
    "transportSubCategory",
    "SpireTransportType",
    "buildYear",
    "Category",
  ];

  const [hiddenColumns, setHiddenColumns] = useState(initiallyHiddenColumns);
  const [visibleColumnsOrder, setVisibleColumnsOrder] = useState(
    originalColumnsOrder.filter(
      (field) => !initiallyHiddenColumns.includes(field)
    )
  );

  const handleColumnToggle = (field: any) => {
    if (field !== "actions") {
      const updatedHiddenColumns = [...hiddenColumns];
      const updatedVisibleColumnsOrder = [...visibleColumnsOrder];

      if (updatedHiddenColumns.includes(field)) {
        updatedHiddenColumns.splice(updatedHiddenColumns.indexOf(field), 1);
        if (!updatedVisibleColumnsOrder.includes(field)) {
          const originalIndex = originalColumnsOrder.indexOf(field);
          updatedVisibleColumnsOrder.splice(originalIndex, 0, field);
        }
      } else {
        updatedHiddenColumns.push(field);
        updatedVisibleColumnsOrder.splice(
          updatedVisibleColumnsOrder.indexOf(field),
          1
        );
      }

      setHiddenColumns(updatedHiddenColumns);
      setVisibleColumnsOrder(updatedVisibleColumnsOrder);
    }
  };

  const handleSelectAllChange = () => {
    if (!selectAll) {
      const allTransportIds = transports.map((row:any) => getRowId(row));
      setSelectedRows(allTransportIds);
      setSelectedIds(allTransportIds);

      handleSelectTransport(allTransportIds);
    } else {
      setSelectedRows([]);
      setSelectedIds([]);
      handleSelectTransport([]);
    }

    setSelectAll(!selectAll);
  };

  interface Row {
    // Assuming each row has at least an ID, you can expand this based on your row structure.
    id: string | number;
    // other properties of a row...
  }

  const handleCheckboxChange = (rowId: string | number) => {
    const updatedSelectedRows = [...selectedRows];
    const index = updatedSelectedRows.indexOf(rowId );

    if (index === -1) {
      updatedSelectedRows.push(rowId);
    } else {
      updatedSelectedRows.splice(index, 1);
    }

    setSelectedRows(updatedSelectedRows);
    setSelectedTransportId(rowId);

    const selectedTransportIds = updatedSelectedRows.map((id) => id);
    setSelectedIds(selectedTransportIds);

    handleSelectTransport(selectedTransportIds);
  };

  const isSortColumn = (field: any) => columns[0].field === field;

  const getRowId = (row: any) => row._id;

  const handleSortChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSearch = () => {
    const transportNames = new Set(
        searchTerm
          .split(",")
          .map((name) => name.trim().toLowerCase())
      );

 
   // Convert the Set to an array using Array.from()
   const transportNamesArray = Array.from(transportNames);

   // Filter the transports based on whether any transport name matches
   const filteredTransports = transports.filter((row) => {
     const transportName = row?.transportName || "";
     // Check if transportName includes any of the transportNames from the search term
     return transportNamesArray.some((name) => transportName.includes(name));
   });
 

   const sortedTransports = [...filteredTransports].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.transportName.localeCompare(b.transportName); // or another field
    } else {
      return b.transportName.localeCompare(a.transportName);
    }
  });
  

    setFilteredAndSortedTransports(sortedTransports);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setFilteredAndSortedTransports(transports);
  };

  useEffect(() => {
    setFilteredAndSortedTransports(transports);
  }, [transports]);

  return (
    <div>
      <div style={{ display: "flex", marginBottom: 16, alignItems: "center" }}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: 16 }}
          placeholder="Enter transport names separated by commas"
        />
        <IconButton onClick={handleSearch} aria-label="search">
          <SearchIcon />
        </IconButton>
        <Tooltip title="Reset">
          <IconButton onClick={handleResetSearch} aria-label="reset">
            <ClearIcon />
          </IconButton>
        </Tooltip>
        <IconButton
          aria-controls="column-filter-menu"
          aria-haspopup="true"
          onClick={handleFilterClick}
          style={{ marginLeft: "auto" }}
        >
          <FilterListIcon />
        </IconButton>
      </div>

      {filteredAndSortedTransports.length > 0 && (
        <>
          <Menu
            id="column-filter-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
          >
            {columns.map(
              (column) =>
                column.field !== "actions" && (
                  <MenuItem key={column.field}>
                    <Checkbox
                      checked={!hiddenColumns.includes(column.field)}
                      onChange={() => handleColumnToggle(column.field)}
                    />
                    <Typography variant="body2">{column.headerName}</Typography>
                  </MenuItem>
                )
            )}
          </Menu>
          {/* <Scrollbar> */}
            <div>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                  <TableRow>
  <TableCell>
    <FormControlLabel
      control={
        <Checkbox
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
      }
      label="Show on Map"
    />
  </TableCell>
  {visibleColumnsOrder.map((field) => {
    // Find the column once
    const column = columns.find((col) => col.field === field);

    // If the column is not found, return null to skip this TableCell
    if (!column) return null;

    return (
      <TableCell key={field}>
        {!hiddenColumns.includes(field) && (
          <>
            {column.headerName} {/* Display the column header name */}
            {isSortColumn(field) && (
              <IconButton
                onClick={() => handleSortChange()} // Pass the field to handleSortChange
                size="small"
                style={{ marginLeft: 4 }}
              >
                {sortOrder === "asc" ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )}
              </IconButton>
            )}
          </>
        )}
      </TableCell>
    );
  })}
</TableRow>

                  </TableHead>
                  <TableBody>
                    {filteredAndSortedTransports.map((row: any) => (
                        
                        
                        <React.Fragment key={row._id}>
                        <TableRow>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(getRowId(row))}
                              onChange={() =>
                                handleCheckboxChange(getRowId(row))
                              }
                            />
                          </TableCell>
                          {visibleColumnsOrder
                            .filter((field) => !hiddenColumns.includes(field))
                            .map((field) => (
                                <TableCell key={field}>
                                {(() => {
                                  const column = columns.find((col) => col.field === field);
                                  if (column) {
                                    // Check if the column has a renderCell function, and call it if so
                                    return column.renderCell ? column.renderCell(row) : row[field];
                                  }
                                  // Fallback in case the column is not found (e.g., undefined field)
                                  return row[field];
                                })()}
                              </TableCell>
                              
                            ))}
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={visibleColumnsOrder.length + 1}>
                            <Collapse
                              in={
                                isEmissionFormOpen &&
                                selectedTransportId === row._id
                              }
                            >
                              <Box p={3}>
                                <Grid container spacing={4} alignItems="center">
                                  <Grid item xs={12} md={3}>
                                    <Typography
                                      variant="subtitle1"
                                      style={{ fontSize: "12px" }}
                                    >
                                      Virtual NOR Tendered Date
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
                                      format="dd-MM-y HH:mm"
                                      disableClock={true}
                                      clearIcon={<ClearIcon />}
                                      calendarIcon={<EventIcon />}
                                      
                                    //   renderInput={(props) => (
                                    //     <TextField {...props} fullWidth />
                                    //   )}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Typography
                                      variant="subtitle2"
                                      style={{ fontSize: "12px" }}
                                    >
                                      Time Tendered At
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
                                      format="dd-MM-y HH:mm"
                                      disableClock={true}
                                    //   renderInput={(props) => (
                                    //     <TextField {...props} fullWidth />
                                    //   )}
                                    />
                                  </Grid>

                                  <Grid item xs={12} md={3}>
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
                                      format="dd-MM-y HH:mm"
                                      disableClock={true}
                                    //   renderInput={(props) => (
                                    //     <TextField {...props} fullWidth />
                                    //   )}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <TextField
                                      label="Berth Name"
                                      value={emissionForm.berthName}
                                      onChange={(e) =>
                                        setEmissionForm({
                                          ...emissionForm,
                                          berthName: e.target.value,
                                        })
                                      }
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Tooltip title="Submit">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleSubmitEmissionForm(row)
                                        }
                                      >
                                        <SendIcon />
                                      </IconButton>
                                    </Tooltip>
                                    {/* <Tooltip title="Reset">
                                      <IconButton
                                        variant="outlined"
                                        // onClick={handleResetForm}
                                      >
                                        <ClearIcon />
                                      </IconButton>
                                    </Tooltip> */}
                                  </Grid>
                                </Grid>
                              </Box>

                              {submittedData && (
                                <Box p={3}>
                                  <Typography variant="h6">
                                    Calculated Data
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <List>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              Virtual NOR Tendered Date :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.virtualNORTenderedDate?.toLocaleString()}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              Time Tendered At :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.timeTenderedAt?.toLocaleString()}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              ETB :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.ETB?.toLocaleString()}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              Berth Name :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.berthName}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              Current DTG :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.currentDTG}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              Position Reported At :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {
                                                submittedData?.positionReportedAt
                                              }
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              current ETA :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.currentETA}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                      </List>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <List>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              DTG At Virtual NOR :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {submittedData?.dtgAtVirtualNOR}
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                          <ListItemText>
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                fontWeight: "bold",
                                                color: "dark",
                                              }}
                                            >
                                              Speed To Maintain ETB :{" "}
                                            </Typography>
                                            <Typography variant="body1">
                                              {
                                                submittedData?.speedToMaintainETB
                                              }
                                            </Typography>
                                          </ListItemText>
                                        </ListItem>
                                      </List>
                                    </Grid>
                                  </Grid>

                                  <Box mt={2}>
                                    <Typography variant="h6">
                                      Emission Data Tabel
                                    </Typography>
                                    <TableContainer
                                      component={Paper}
                                      style={{
                                        border: "1px solid lightgray",
                                        marginTop: "10px",
                                      }}
                                    >
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              Speed <sub>(knots)</sub>
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              Time
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              ETA
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              CO<sub>2</sub> (in MT)
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              SO<sub>x</sub> (in MT)
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              NO<sub>x</sub> (in MT)
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              style={{
                                                border: "1px solid lightgray",
                                              }}
                                            >
                                              Estimated Fuel Consumption (in MT)
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>

                                        <TableBody>
                                          {EmissionDataFake.map(
                                            (data, index) => (
                                              <TableRow
                                                key={index}
                                                style={{
                                                  borderBottom:
                                                    "1px solid lightgray",
                                                }}
                                              >
                                                <TableCell
                                                  align="center"
                                                  style={{
                                                    borderRight:
                                                      "1px solid lightgray",
                                                  }}
                                                >
                                                  {data.speed}
                                                </TableCell>
                                                <TableCell
                                                  align="center"
                                                  style={{
                                                    borderRight:
                                                      "1px solid lightgray",
                                                  }}
                                                >
                                                  {data.time}
                                                </TableCell>
                                                <TableCell
                                                  align="center"
                                                  style={{
                                                    borderRight:
                                                      "1px solid lightgray",
                                                  }}
                                                >
                                                  {data.ETA}
                                                </TableCell>
                                                <TableCell
                                                  align="center"
                                                  style={{
                                                    borderRight:
                                                      "1px solid lightgray",
                                                  }}
                                                >
                                                  {data.CO2}
                                                </TableCell>
                                                <TableCell
                                                  align="center"
                                                  style={{
                                                    borderRight:
                                                      "1px solid lightgray",
                                                  }}
                                                >
                                                  {data.SOX}
                                                </TableCell>
                                                <TableCell
                                                  align="center"
                                                  style={{
                                                    borderRight:
                                                      "1px solid lightgray",
                                                  }}
                                                >
                                                  {data.NOX}
                                                </TableCell>
                                                <TableCell align="center">
                                                  {data.total_consumption}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Box>
                                </Box>
                              )}
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          {/* </Scrollbar> */}
        </>
      )}

      {filteredAndSortedTransports.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          No transports found.
        </Typography>
      )}
    </div>
  );
};

export default TransportTable;
