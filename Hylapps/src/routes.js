import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';

import ArgonBox from "components/ArgonBox";
import { AuthContext } from "./AuthContext"; // Import AuthContext to get the role
import Dashboard from "layouts/dashboard";
import Dashboardcopy from "layouts/dashboardcopy";
import Geofence from "layouts/geofence";
import Alerts from "layouts/Alerts";
import Organization from "layouts/Organization";
import CreateUsers from "layouts/Users";
import Services from "layouts/services";
import ResetPassword from "layouts/authentication/ResetPassword";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ISMOrganization from "layouts/ISMOrganization"

import Operations from "layouts/operations_dashboard"
import VesselTracker from "layouts/VesselsTracker"
import { Route } from "react-router-dom";
import SalesRadar from "layouts/SalesRadar"
import ShipRADAR from "layouts/ShipRADAR"
import ModifyGeofence from "layouts/ModifyGeofence";

import Dashboardemission from "layouts/newemission";
// import Dashboardemission from "layouts/dashboardemission";

// Define all routes
const allRoutes = [


  // {
  //   type: "route",
  //   name: "Emission Dashboard-2",
  //   key: "emission-dashboard-2",
  //   route: "/emission-dashboard-2",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sliders" />,
  //   element: <Dashboardemission2 />,
  // },

  {
    type: "route",
    name: "Dashboard",
    key: "HYLA",
    route: "/HYLA",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-house-laptop" />,
    element: <Dashboardcopy />, // Changed from component to element
  },

  
  {
    type: "route",
    name: "JIT Optimizer",
    key: "jit-optimizer",
    route: "/jit-optimizer",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-gauge" />,
    element: <Dashboardemission />,
  },

  {
    type: "route",
    name: "Sales RADAR",
    key: "SalesRadar",
    route: "/SalesRadar",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sliders" />,
    element: <SalesRadar />,
  },
  {
    type: "route",
    name: "Ops RADAR",
    key: "OpsRadar",
    route: "/OpsRadar",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-satellite" />,
    element: <ShipRADAR />,
  },
  {
    type: "route",
    name: "Ship Dashboard",
    key: "dashboard",
    route: "/dashboard/:vesselId",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa fa-ship" />,
    element: <Dashboard />, // Changed from component to element
  },
  {
    type: "route",
    name: "Geofence",
    key: "Geofence",
    route: "/Geofence",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-compass-drafting" />,
    element: <Geofence />, // Changed from component to element
  },
  {
    type: "route",
    name: "Modify Geofence",
    key: "modify-geofence",
    route: "/modify-geofence",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-pen-to-square" />,
    element: <ModifyGeofence />, // Changed from component to element
  },
  {
    type: "route",
    name: "Alerts & Notifications",
    key: "alerts",
    route: "/alerts",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa-solid fa-envelope-open-text" />,
    element: <Alerts />, // Changed from component to element
  },
  {
    type: "route",
    name: "Fleet Managers",
    key: "fleet-managers",
    route: "/fleet-managers",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-people-roof" />,
    element: <ISMOrganization />, // Changed from component to element
  },

  {
    type: "route",
    name: "Create Organization",
    key: "create-organization",
    route: "/create-organization",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sitemap" />,
    element: <Organization />, // Changed from component to element
  },
  {
    type: "route",
    name: "Create Users",
    key: "create-users",
    route: "/create-users",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa fa-users" />,
    element: <CreateUsers />, // Changed from component to element
  },

  // {
  //   type: "route",
  //   name: "Operations Dashboard",
  //   key: "operation-dashboard",
  //   route: "/operation-dashboard",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sliders" />,
  //   element: <Operations />,
  // },
  // {
  //   type: "route",
  //   name: "Vessel Tracker",
  //   key: "vessel-tracker",
  //   route: "/vessel-tracker",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-map-location-dot" />,
  //   element: <VesselTracker />,
  // },
  // {
  //   type: "route",
  //   name: "Reports",
  //   key: "Reports",
  //   route: "/HYLA",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-chart-simple" />,
  //   element: <Dashboardcopy />, // Changed from component to element
  // },
  // {
  //   type: "route",
  //   name: "Managed Services",
  //   key: "Managed Service",
  //   route: "/managed-services",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa fa-database" />,
  //   element: <Services />,
  // },
  {
    type: "route",
    name: "Reset Password",
    key: "reset-password",
    route: "/authentication/reset-password",
    icon: <ArgonBox component="i" color="info" fontSize="14px" className="fa-solid fa-key" />,
    element: <ResetPassword />, // Changed from component to element
  },
  {
    type: "route",
    name: "Signup",
    key: "sign-up",
    route: "/signup",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-right-from-bracket" />,
    element: <SignUp />, // Changed from component to element
  },
  {
    type: "route",
    name: "Logout",
    key: "sign-in",
    route: "/",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-right-from-bracket" />,
    element: <SignIn />, // Changed from component to element
  },
 
];

// Function to get company title from backend
const getCompanyTitle = async (orgId) => {
  try {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
   
    const response = await fetch(`${baseURL}/api/organizations/get-companyTitle/${orgId}`);
    const data = await response.json();
    return data.organizationTitle; // Returning companyTitle from backend
  } catch (error) {
    console.error("Error fetching company title:", error);
    return null;
  }
};





// Function to filter routes based on role
const getFilteredRoutes = (role, id, companyTitle,salesOrgId) => {

  
   // Update the Dashboard name with companyTitle if available
   const updatedRoutes = allRoutes.map((route) => {
    if (route.key === "HYLA" && companyTitle) {
      return { ...route, name: `${companyTitle} Dashboard` }; // Replace orgId with companyTitle
    }
    return route;
  });


   // Ensure 'sign-up' route is always included for guests or non-logged-in users
   if (!role ) {
    return updatedRoutes.filter((route) =>
      ["sign-in", "reset-password", "sign-up"].includes(route.key)
    );
  }



  if (role === "hyla admin") {
    // Return all routes for HYLA Admin
    return updatedRoutes.filter((route) =>
      ["sign-in", "reset-password", "HYLA","jit-optimizer","emission-dashboard-2", "dashboard", "alerts","create-organization", "create-users", "Geofence", "modify-geofence" , "OpsRadar",  "SalesRadar", "fleet-managers" ].includes(route.key)


    );
  }  else if (role === "organization admin") {
    return updatedRoutes.filter((route) =>
      ["sign-in", "reset-password", "HYLA","jit-optimizer","emission-dashboard-2", "dashboard", "alerts", "create-users", "Geofence", "modify-geofence" ,"OpsRadar",  "SalesRadar" ].includes(route.key)


    );
  } 

  else if (role === "organizational user" && id.includes(salesOrgId)) {
    return updatedRoutes.filter((route) =>
      ["sign-in", "reset-password", "HYLA" ,"emission-dashboard-2", "dashboard", "OpsRadar", "SalesRadar" ].includes(route.key)
    );
  } else if (role === "organizational user") {
    return updatedRoutes.filter((route) =>
      ["sign-in", "reset-password", "HYLA", "dashboard", "OpsRadar"].includes(route.key)
    );
  }

  else if (role === "guest" && id === "HYLA121_GUEST70") {
    // Return empty array or a default route for guest users
    return allRoutes.filter((route) => ["sign-in" ,"reset-password" , "HYLA" , "Geofence", "modify-geofence"].includes(route.key));
  } 
  

  else if (role === "guest") {
    // Return empty array or a default route for guest users
    return allRoutes.filter((route) => ["sign-in" ,"reset-password" , "HYLA", "dashboard", "OpsRadar"].includes(route.key));
  } 
  

  else  {
    // Return empty array or a default route for guest users
    return allRoutes.filter((route) => ["sign-up","reset-password" ].includes(route.key));
  }
 
};

// Routes component where routes are filtered based on role
const Routes = () => {
  const { role, id } = useContext(AuthContext); // Get the role and id from AuthContext
  const [companyTitle, setCompanyTitle] = useState("null"); // State to store companyTitle
  const navigate = useNavigate();
  const [salesOrgId,setSalesOrgId] = useState("");
  const [opsOrgId,setOpsOrgId] = useState("");
  const [mainDashboardOrgId,setMainDashboardOrgId] = useState("");

  useEffect(() => {
    const fetchOrgIds = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseURL}/api/get-routes-menu-enabling-ids`); // Await the fetch call
        const document = await response.json(); // Parse JSON data
  
        setSalesOrgId(document.salesOrgId);
        setOpsOrgId(document.opsOrgId);
        setMainDashboardOrgId(document.mainDashboardOrgId);
  
        console.log("Sales Org ID:", document.salesOrgId);
      } catch (error) {
        console.error("Error fetching orgIds:", error);
      }
    };
  
    fetchOrgIds(); // Call the function inside useEffect
  }, [id]);
  

  useEffect(() => {
    const fetchCompanyTitle = async () => {

      const orgId = id ? (id.includes("_") ? id.split("_")[1] : id.split("_")[0]) : null;

      if (orgId) {
        const title = await getCompanyTitle(orgId);
        setCompanyTitle(title); // Set companyTitle once fetched
       
      }
    };

    fetchCompanyTitle(); // Fetch companyTitle on component mount
  }, [id]);

  // Get filtered routes based on role and companyTitle using useMemo for performance
  const filteredRoutes = useMemo(() => getFilteredRoutes(role, id, companyTitle,salesOrgId), [role, id, companyTitle]);

  return filteredRoutes;
  // Render the filtered routes
 
};

export default Routes;