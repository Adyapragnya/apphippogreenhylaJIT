/**
=========================================================
* Argon Dashboard 2 MUI - v3.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-material-ui
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";
import GlobalSearch from "layouts/GlobalSearch";
// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI example components
import SidenavItem from "examples/Sidenav/SidenavItem";
import SidenavFooter from "examples/Sidenav/SidenavFooter";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Argon Dashboard 2 MUI context
import { useArgonController, setMiniSidenav } from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useArgonController();
  const [isGlobal, setIsGlobal] = useState(true);
  const { miniSidenav, darkSidenav, layout } = controller;
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate(); 
  const itemName = pathname.split("/").slice(1)[0];

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
   
  };

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(({ type, name, icon, key, route }) => {
    let returnValue;

    if (type === "route") {
      if (key === "sign-in") {
        returnValue = (
          <NavLink to={route} key={key} onClick={handleLogout}>
            <SidenavItem name={name} icon={icon} active={key === itemName} />
          </NavLink>
        );
      } else {
        returnValue = (
          <NavLink to={route} key={key}>
            <SidenavItem name={name} icon={icon} active={key === itemName} />
          </NavLink>
        );
      }
    } else if (type === "title") {
      returnValue = (
        <ArgonTypography
          key={key}
          color={darkSidenav ? "white" : "dark"}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          opacity={0.6}
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </ArgonTypography>
      );
    } else if (type === "divider") {
      returnValue = <Divider key={key} light={darkSidenav} />;
    }

    return returnValue;
  });

   // Global search change handler
   const handleGlobalSearchChange = (term) => {
    setSearchTerm(term);
  };

  
  return (
    <SidenavRoot {...rest} variant="permanent" ownerState={{ darkSidenav, miniSidenav, layout }}>
      <ArgonBox pt={3} pb={1} px={4} textAlign="center">
        <ArgonBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <ArgonTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </ArgonTypography>
        </ArgonBox>
        <ArgonBox component={NavLink} to="/" display="flex" justifyContent="center" alignItems="center">
          {brand && (
            <ArgonBox
              component="img"
              src="/NEW_LOGO.png"
              alt="Hyla"
              id="hyla"
              // Adjust the width dynamically based on the miniSidenav state
              sx={{
                width: miniSidenav ? "4rem" : "8rem", // Bigger size when not collapsed, smaller when collapsed
                height: "auto", // Maintain aspect ratio
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth transition with easing
              }}
              mr={0}
            />
          )}
           
          <ArgonBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <ArgonTypography
              component="h6"
              variant="button"
              fontWeight="bold"
              color={darkSidenav ? "white" : "dark"}
            >
              {/* <h2> HYLA </h2> */}
            </ArgonTypography>
          </ArgonBox>
        </ArgonBox>
      </ArgonBox>

      {/* <ArgonBox sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}>
      <ArgonBox 
       display="flex" alignItems="center" justifyContent="center">
        <GlobalSearch onSearchChange={handleGlobalSearchChange} /> 
      </ArgonBox>
    </ArgonBox> */}
    
      <Divider darkblue={darkSidenav} />
      <List>{renderRoutes}</List>

      <ArgonBox pt={1} mt="auto" mb={2} mx={2}>
        <SidenavFooter />
      </ArgonBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
