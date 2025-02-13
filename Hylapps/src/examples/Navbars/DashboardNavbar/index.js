import { useState, useEffect, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge"; // Import Badge component
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import Typography from "@mui/material/Typography";
import {Select, FormControl, InputLabel, Autocomplete } from '@mui/material';

import Box from "@mui/material/Box";
import ArgonInput from "components/ArgonInput";
import Breadcrumbs from "examples/Breadcrumbs";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationItem from "examples/Items/NotificationItem";
import './style.css';
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import {
  useArgonController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import Swal from 'sweetalert2';
import team2 from "assets/images/team-2.jpg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";

import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from 'axios';
import { AuthContext } from "../../../AuthContext";

function DashboardNavbar({ absolute, light, isMini, showButton, dropdownOptions, vesselEntries }) {
  // console.log(vesselEntries);
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [satValues, setSatValues] = useState({});
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const { role, id, loginEmail } = useContext(AuthContext);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget); // Set the popover anchor
  };

  const handleClose = () => {
    setAnchorEl(null); // Close the popover
  };

  const isOpen = Boolean(anchorEl); // Determine if popover is open
  const popoverId = isOpen ? "user-account-popover" : undefined;
  
  const [selectedOrgId, setSelectedOrgId] = useState('');

  // Handle change in the selected organization from dropdown
  const handleOrgSelect = (event, newValue) => {
    setSelectedOrgId(newValue ? newValue.orgId : ''); // If null, set to empty string
  };


  // Function to filter organizations if one is selected
  const filteredData = selectedOrgId
  ? { [selectedOrgId]: satValues[selectedOrgId] }
  : satValues;

   // Fetch NAVSTAT intervals on mount
  //  useEffect(() => {
  //   const fetchSatIntervals = async () => {
  //     try {

  //       const baseURL = process.env.REACT_APP_API_BASE_URL;
    
       
  //       const response = await axios.get(`${baseURL}/api/sat-intervals`);
  //       const intervals = response.data;
  //       setSatValues({
  //         sat0: intervals.sat0 / 1000 / 60,
  //         sat1a: intervals.sat1a / 1000 / 60,
  //         sat1b: intervals.sat1b / 1000 / 60,
  //       });
  //     } catch (error) {
  //       console.error('Error fetching SAT intervals:', error);
  //     }
  //   };

  //   fetchSatIntervals();
  // }, []);


  // Fetch the SAT intervals (sat0, sat1a, sat1b) for all organizations
useEffect(() => {
  const fetchSatIntervals = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseURL}/api/sat-intervals`);
      const satData = await response.json();
      
      if (response.ok) {
        setOrganizations(satData); // Store the SAT data for each organization
        const initialSatValues = {};
        
        // Populate initial SAT values for each organization from the fetched data
        satData.forEach((org) => {
          initialSatValues[org.orgId] = {
            companyName: org.companyName,
            sat0: org.sat0 / (1000 * 60),  // Convert milliseconds to minutes
            sat1a: org.sat1a / (1000 * 60), // Convert milliseconds to minutes
            sat1b: org.sat1b / (1000 * 60), // Convert milliseconds to minutes
          };
        });

        setSatValues(initialSatValues);
      } else {
        console.error('Failed to fetch SAT intervals');
      }
    } catch (error) {
      console.error('Error fetching SAT intervals:', error);
    }
  };

  if (openSettingsDialog) {
    fetchSatIntervals(); // Fetch data when the dialog is open
  }
}, [openSettingsDialog]);


// Handler to update SAT values for each organization
const handleSatChange = (e, orgId, satType) => {
  const updatedSatValues = { ...satValues };
  updatedSatValues[orgId][satType] = e.target.value;
  setSatValues(updatedSatValues);
};



  // // Handle organization selection
  // const handleOrgSelect = (e) => {
  //   setSelectedOrg(e.target.value);
  // };


  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  // useEffect(() => {
  //   setFilteredOptions(
  //     dropdownOptions.filter(option =>
  //       option.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //   );
  // }, [searchTerm, dropdownOptions]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  const handleDropdownClick = (event) => {
    setDropdownAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setDropdownAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSettingsOpen = () => {
    setOpenSettingsDialog(true);
  };

  const handleSettingsClose = () => {
    setOpenSettingsDialog(false);
  };



  // const handleSatChange = (sat) => (event) => {
  //   setSatValues({ ...satValues, [sat]: event.target.value });
  // };

  const handleFormSubmit = async () => {

// 
try {
  const updatedSatValues = organizations.map((org) => ({
    orgObjectId: org.orgObjectId,
    orgId: org.orgId,
    companyName: org.companyName,
    sat0: satValues[org.orgId]?.sat0 * 1000 * 60,
    sat1a: satValues[org.orgId]?.sat1a * 1000 * 60,
    sat1b: satValues[org.orgId]?.sat1b * 1000 * 60,
  }));
  
  // Call API to update SAT values in database
  await updateSatIntervals(updatedSatValues);
} catch (error) {
  console.error('Error updating SAT intervals:', error);
}
};

const updateSatIntervals = async (updatedSatValues) => {

  const baseURL = process.env.REACT_APP_API_BASE_URL;
const response = await fetch(`${baseURL}/api/update-sat-intervals`, {
  method: 'POST',
  body: JSON.stringify({ updatedSatValues }),
  headers: { 'Content-Type': 'application/json' },
});

if (response.ok) {
  handleSettingsClose();
  // Show success alert using SweetAlert2
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'SAT intervals updated successfully!',
  confirmButtonText: 'OK',
});
} else {
  console.error('Error updating SAT intervals:', error);
  // Show error alert using SweetAlert2
Swal.fire({
 icon: 'error',
 title: 'Error',
 text: 'Failed to update SAT intervals. Please try again.',
 confirmButtonText: 'OK',
});
}

  };



  const validateInputs = () => {
    for (const sat in satValues) {
      if (satValues[sat] < 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          text: `${sat.toUpperCase()} must be 0 or greater.`,
        });
        return false; // Return false if validation fails
      }
    }
    return true; // Return true if validation passes
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      handleFormSubmit(); // Call the original submit function if validation passes
    }
  };

  const renderMenu = () => {
    const vesselEntriesArray = Array.isArray(vesselEntries)
      ? vesselEntries
      : Object.keys(vesselEntries).map((key) => ({ name: key, ...vesselEntries[key] }));
  
    return (
      <Menu
        anchorEl={openMenu}
        anchorReference={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={Boolean(openMenu)}
        onClose={handleCloseMenu}
        sx={{ mt: 2 }}
      >
        {vesselEntriesArray.length ? (
          vesselEntriesArray.map((vessel, index) => (
            <NotificationItem
              key={index}
              image={<DirectionsBoatIcon />}  // Use ship icon here
              title={vessel.name || "Unnamed Vessel"}
              date={vessel.entryTime || "No entry time available"}
              geofenceName={vessel.geofence || "No geofence name"}  // Add geofenceName
              onClick={handleCloseMenu}
            />
          ))
        ) : (
          <MenuItem disabled>No vessels available</MenuItem>
        )}
      </Menu>     
    );
  };

  const renderDropdown = () => (
    <Menu
      anchorEl={dropdownAnchorEl}
      anchorReference="anchorEl"
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(dropdownAnchorEl)}
      onClose={handleDropdownClose}
      sx={{ mt: 2, padding: 2, minWidth: 200 }}  // Add padding and minWidth for better layout
    >
      <MenuItem>
        <ArgonInput 
          placeholder="Search..." 
          fullWidth 
          onChange={handleSearchChange}
          value={searchTerm}
        />
      </MenuItem>

      {/* Dropdown options from props */}
      {filteredOptions.length ? (
        filteredOptions.map((option, index) => (
          <MenuItem key={index} onClick={() => {
            // Handle option selection if needed
            handleDropdownClose();
          }}>
            {option}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No options available</MenuItem>
      )}
    </Menu>
  );

  
  return (
    <><AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
      style={{ marginTop: '-30px' }}
    >
    
        <Toolbar sx={(theme) => navbarContainer(theme, { navbarType })}>
          <ArgonBox
            color={light && transparentNavbar ? "white" : "dark"}
            mb={{ xs: 1, md: 0 }}
            sx={(theme) => navbarRow(theme, { isMini })}
          >
            <Breadcrumbs
              icon="home"
              title={route[route.length - 1]}
              route={route}
              light={transparentNavbar ? light : false} />
            <Icon fontSize="medium" sx={navbarDesktopMenu} onClick={handleMiniSidenav}>
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </ArgonBox>

          {isMini ? null : (
            <>
              <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>
                <ArgonBox color={light ? "white" : "inherit"} display="flex" alignItems="center">

                  <IconButton
                    size="small"
                    color={light && transparentNavbar ? "white" : "dark"}
                    sx={navbarMobileMenu}
                    onClick={handleMiniSidenav}
                  >
                    <Icon>{miniSidenav ? "menu_open" : "menu"}</Icon>
                  </IconButton>

           
            {/* Tooltip and IconButton */}
            
        <IconButton
          size="small"
          color="inherit"
          onClick={handleIconClick}
          sx={{
            padding: "2px", // Fixed padding to prevent resizing
            transition: "none", // Disable animations during interaction
            "&:hover": {
              backgroundColor: "transparent", // Optional: keep background unchanged
            },
            "&:active": {
              transform: "none", // Prevent movement on click
            },
          }}
        >
          <AccountCircleIcon />
        </IconButton>
    
     

      {/* Styled Popover */}
      <Popover
  id={popoverId}
  open={isOpen}
  anchorEl={anchorEl}
  onClose={handleClose}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "center", // Default horizontal alignment
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "center", // Default transform origin
  }}
  sx={{
    "& .MuiPopover-paper": {
      background: "#fff", // Enforce white background
      color: "#000", // Ensure text is visible
      borderRadius: "8px", // Rounded corners
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
      minWidth: "160px", // Set a small width
      marginTop: "5px" ,
      marginRight: "5px",
      padding: "4px", // Add some padding
      "@media (max-width: 767px)": {
        marginTop: "0px" ,
        marginLeft: "8px",
        minWidth: "150px", 
      },
    },
  }}
>
  <Typography
    sx={{
      textAlign: "center",
      fontSize: "14px",
      fontWeight: 500,
    }}
  >
    {loginEmail || "No Email Provided"}
  </Typography>
</Popover>

      
         
                  {(role === "hyla admin" ) && (
                    <IconButton
                      size="small"
                      color={light && transparentNavbar ? "white" : "dark"}
                      sx={navbarIconButton}
                      onClick={handleSettingsOpen} // Open settings dialog on click
                    >
                      <Icon>settings</Icon>
                    </IconButton>
                  )}

                  <IconButton
                    size="small"
                    color={light && transparentNavbar ? "white" : "dark"}
                    sx={navbarIconButton}
                    aria-controls="notification-menu"
                    aria-haspopup="true"
                    variant="contained"
                    onClick={handleOpenMenu}
                  >
                    <Badge
                      badgeContent={Object.keys(vesselEntries).length}
                      // color="secondary"
                      sx={{
                        "& .MuiBadge-dot": {
                          backgroundColor: light ? "white" : "black",
                        },
                        "& .MuiBadge-badge": {
                          right: 0, // Adjust badge position horizontally
                          top: -3, // Adjust badge position vertically
                          padding: '0 4px', // Smaller padding
                          fontSize: '0.75rem', // Smaller font size
                          minWidth: '16px', // Smaller minimum width
                          height: '16px', // Smaller height
                          borderRadius: '50%', // Fully rounded badge
                          display: 'flex', // Center text horizontally and vertically
                          alignItems: 'center', // Center text vertically
                          justifyContent: 'center', // Center text horizontally
                          backgroundColor: 'red'
                        },
                      }}
                    >
                      <Icon>notifications</Icon>
                    </Badge>
                  </IconButton>
                </ArgonBox>
              </ArgonBox></>

          )}
        </Toolbar>
        {renderDropdown()}
        {renderMenu()}
        {/* Settings Dialog for NAVSTAT Input */}
      
        <Dialog
      open={openSettingsDialog}
      onClose={handleSettingsClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>
        UPDATE SAT INTERVALS (In Minutes)
      </DialogTitle>

      <DialogContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '20px',
        }}
      >
        {/* Dropdown to select organization */}
        <FormControl fullWidth style={{ marginBottom: '5px' }}>
  <Autocomplete
    value={organizations.find((org) => org.orgId === selectedOrgId) || null}
    onChange={handleOrgSelect}
    options={organizations}
    getOptionLabel={(option) => option.companyName}
    isOptionEqualToValue={(option, value) => option.orgId === value?.orgId}
    disableClearable={false}
    clearOnEscape
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder="Choose Organization"
        variant="outlined" // Outlined style for input box
        InputLabelProps={{
          shrink: true, // Keep the label floating above when focused
        }}
        InputProps={{
          ...params.InputProps,
          style: {
            backgroundColor: 'white', // White background inside the input
            border: '1px solid rgba(0, 0, 0, 0.23)', // 4-sided border
            paddingLeft: '14px', // Padding to prevent the text from touching the left side
            paddingRight: '14px', // Padding to prevent the text from touching the right side
          },
        }}
        style={{
          width: '100%', // Ensure input field spans full width
          '& .MuiInputLabel-root': {
            fontSize: '1rem', // Adjust label font size
            color: '#999', // Light gray color for the label
          },
        }}
      />
    )}
    renderOption={(props, option) => (
      <li {...props} key={option.orgId}>
        {option.companyName}
      </li>
    )}
  />
</FormControl>




        {/* Render SAT input fields for selected or all organizations */}
        {Object.keys(filteredData).map((orgId) => (
          <div
            key={orgId}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '10px',
              background: '#f9f9f9',
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              {`Organization: ${filteredData[orgId].companyName}`}
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
              <div style={{ width: '30%' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#555' }}>SAT 0</label>
                <TextField
                  type="number"
                  value={filteredData[orgId].sat0 || ''}
                  onChange={(e) => handleSatChange(e, orgId, 'sat0')}
                  variant="outlined"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </div>

              <div style={{ width: '30%' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#555' }}>SAT 1a</label>
                <TextField
                  type="number"
                  value={filteredData[orgId].sat1a || ''}
                  onChange={(e) => handleSatChange(e, orgId, 'sat1a')}
                  variant="outlined"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </div>

              <div style={{ width: '30%' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#555' }}>SAT 1b</label>
                <TextField
                  type="number"
                  value={filteredData[orgId].sat1b || ''}
                  onChange={(e) => handleSatChange(e, orgId, 'sat1b')}
                  variant="outlined"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </div>
            </div>
          </div>
        ))}
      </DialogContent>

      <DialogActions style={{ justifyContent: 'flex-end', padding: '10px' }}>
        <Button
          onClick={handleSettingsClose}
          color="secondary"
          variant="outlined"
          style={{ fontSize: '12px', padding: '6px 12px', marginRight: '10px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>

      </AppBar></>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: true,
  isMini: false,
  showButton: false,
  dropdownOptions: [],
  vesselEntries: [],
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  showButton: PropTypes.bool,
  dropdownOptions: PropTypes.arrayOf(PropTypes.string),
  vesselEntries: PropTypes.arrayOf(PropTypes.object), // Add prop validation for notifications
};

export default DashboardNavbar;

