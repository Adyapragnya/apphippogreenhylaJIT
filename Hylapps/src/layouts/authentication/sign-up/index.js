import { useState, useContext, useEffect } from "react"; // Import useContext
import { Link, useNavigate } from "react-router-dom";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";
import Swal from "sweetalert2";
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from "../../../AuthContext"; // Adjusted import path
import axios from "axios";
import {CircularProgress, Box, Typography } from "@mui/material";


const bgImage = "/HYLA-LBackground.png";
const logoImage = "/Hyla-logo.png"; // Replace with the path to your logo image

function Illustration() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmittingLoader, setIsSubmittingLoader] = useState(false); // For disabling the button

  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { setRole, setId, setIsAuthenticated,loginEmail, setLoginEmail,adminId, setAdminId } = useContext(AuthContext); // Get setRole and setIsAuthenticated from AuthContext

  const handleSetRememberMe = () => setRememberMe(!rememberMe);



  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validate input

    if (!firstName ) {
      Swal.fire({
        title: "Error!",
        text: "First Name is required.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }

    if (!lastName ) {
      Swal.fire({
        title: "Error!",
        text: "Last Name is required.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }

    if (!email ) {
      Swal.fire({
        title: "Error!",
        text: "Email is required.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }
  
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        title: "Error!",
        text: "Please enter a valid email address.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm User Creation',
      text: 'Do you want to save this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {

      setIsSubmittingLoader(true);

      const userData = {
        orgId: null,
        userType: 'guest',
        selectedOrganization: null,
        address: null,
        contactEmail: null, // Encrypting the contactEmail
        userFirstName : firstName,
        userLastName : lastName,
        userEmail: email, // Encrypting the userEmail
   
       
      };

  
    // // Send credentials to backend
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // console.log(baseURL);
      const response = await fetch(`${baseURL}/api/users/create-guest-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData ),
      });
    
 
  
      // console.log(data);
    if (response.ok) {
             Swal.fire('Welcome to HYLA!', 'Your Account Details has been sent to Mail.', 'success');
             resetForm();
           } else {
               // Extract error message from the response body
             const errorData = await response.json();
             const errorMessage = errorData?.message || 'Failed to save user data.';
             throw new Error(errorMessage);
            
           }


    } catch (error) {
            Swal.fire('Error', error.message, 'error');
          }finally {
          setIsSubmittingLoader(false); // Re-enable the submit button after submission
          // setLoading(false); // Hide loader when submission is complete
        }

  }
  };
  
  
  return (
<div>

    {isSubmittingLoader && (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="rgba(255, 255, 255, 0.5)"
        display="flex"
        flexDirection="column-reverse"  // Reverses the order of the spinner and text
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
      >
         <Typography 
          variant="h6" 
          align="center" 
          gutterBottom 
          mt={2} // Adds a margin-top to the Typography for better spacing
          aria-live="polite"
        >
          Please wait! Creating User...
        </Typography>
        <CircularProgress color="primary" size={60} />
       
      </Box>
    )}

    <IllustrationLayout
      logo={logoImage} // Pass the logo prop
      title={<ArgonTypography variant="h3" color="white">HYLA</ArgonTypography>}
      description={<ArgonTypography variant="h6" color="white">Create New Account</ArgonTypography>}
      illustration={{
        image: bgImage,
      }}
    >
      <ArgonBox component="form" role="form" onSubmit={handleSubmit}>

      <ArgonBox mb={2}>
          <ArgonInput
            type="text"
            placeholder="First Name"
            size="large"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="text"
            placeholder="Last Name"
            size="large"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </ArgonBox>

        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ArgonBox>
      
       
        <ArgonBox mt={4} mb={1}>
          <ArgonButton color="info" size="large" fullWidth type="submit">
            Sign Up
          </ArgonButton>
        </ArgonBox>
        <ArgonBox mt={0} textAlign="center">
          <ArgonTypography variant="button" color="text" fontWeight="regular">
            Already have an account?{" "}
            <ArgonTypography
              component={Link}
              to="/"
              variant="button"
              color="info"
              fontWeight="bold"
            >
           <u>  Sign in </u> 
            </ArgonTypography>
          </ArgonTypography>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>

    </div>
  );
}

export default Illustration;





