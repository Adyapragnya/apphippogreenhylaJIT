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
import { BorderColor } from "@mui/icons-material";


const bgImage = "/HYLA-LBackground.png";
const logoImage = "/Hyla-logo.png"; // Replace with the path to your logo image

function Illustration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { setRole, setId, setIsAuthenticated,loginEmail, setLoginEmail,adminId, setAdminId } = useContext(AuthContext); // Get setRole and setIsAuthenticated from AuthContext

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // Log loginEmail whenever it updates
  useEffect(() => {
    // console.log('Updated loginEmail:', loginEmail);

  }, [loginEmail]);

  useEffect(() => {




    const fetchTrackedVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        // console.log(response);
       return response.data
        
      } catch (error) {
        console.error("Error fetching tracked vessels :", error);
        return [];
      }
    };

    fetchTrackedVessels();

}, []);


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validate input
    if (!email || !password) {
      Swal.fire({
        title: "Error!",
        text: "Email and password are required.",
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
  
    // // Send credentials to backend
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // console.log(baseURL);
      const response = await fetch(`${baseURL}/api/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      // console.log('eeeeeemail',email);
      // console.log('pppppassword',password);

      // console.log(response);
  
      const data = await response.json();
  
      // console.log(data);
      if (response.ok) {
        // Decode token to extract role
       

        const decodedToken = jwtDecode(data.token);
        const userRole = decodedToken.role; // Extract role
        const ID = decodedToken.id; // Extract userloginid
        const userEmail =  decodedToken.email;
        const adminId =  decodedToken.AdminId;
        setRole(userRole); // Update role in AuthContext
        // console.log("User role:", userRole); // Check role in console

        setId(ID);
        // console.log("User role:", ID); 

        setLoginEmail(userEmail);
        // console.log('user email',loginEmail);

        setAdminId(adminId);
       
        await Swal.fire({
          title: "Success!",
          text: data.message || "You have successfully signed in.",
          icon: "success",
          confirmButtonText: "OK",
        });
        
        // Store token
        localStorage.setItem("token", data.token);
        
        // Update authentication state
        setIsAuthenticated(true); // Ensure the state reflects authentication status
        
        navigate("/HYLA"); // Redirect
        // console.log("Token stored:", data.token);
        // console.log("User role:", userRole); // Check role in console
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message || "Invalid email or password.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  
  
  return (
    <IllustrationLayout
      logo={logoImage} // Pass the logo prop
      title={<ArgonTypography variant="h3" color="white">HYLA</ArgonTypography>}
      description={<ArgonTypography variant="h6" color="white">Sign in with your email and password.</ArgonTypography>}
      illustration={{
        image: bgImage,
      }}
    >
      <ArgonBox component="form" role="form" onSubmit={handleSubmit}>
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mb={0}>
          <ArgonInput
            type="password"
            placeholder="Password"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ArgonBox>

       

        <ArgonBox mt={2} mb={0} display="flex" justifyContent="space-between" width="100%">
  <ArgonButton color="info" size="large" type="submit" sx={{ width: "48%", whiteSpace: "nowrap"  }}>
    <i className= 
    'fa-solid fa-sign-in'></i> &nbsp; 
    Sign In
  </ArgonButton>

  <ArgonButton 
   component={Link}
    to="/signup"
  size="large" 
  color= "info"

  sx={{ 
    width: "48%", 
    whiteSpace: "nowrap", 
    backgroundColor: "rgba(0, 0, 0, 0)",  // Transparent background
    border: "0.5px solid white", 
    
    // Optional: Define border color
    boxShadow: "none" , // Optional: Remove any box shadow
    "&:hover": {
      border: "none"  // Remove the border on hover
    }
  }}
>
<i className= 
    'fa-solid fa-user-plus'></i> &nbsp; 
  Sign Up
</ArgonButton>
</ArgonBox>

<ArgonBox mt={2} textAlign="center">
          <ArgonTypography variant="button" color="white" fontWeight="regular">
            {/* Forgot your password?{" "} */}
            <ArgonTypography
              component={Link}
              to="/authentication/reset-password"
              variant="button"
              color="white" 
              fontWeight="bold"
            >
           <b><u> Forgot Password</u>  <i className="fa-solid fa-unlock-keyhole"></i></b> 
            </ArgonTypography>
          </ArgonTypography>
        </ArgonBox>

        {/* <ArgonBox mt={0} textAlign="center">
          <ArgonTypography variant="button" color="text" fontWeight="regular">
            Don&apos;t have an account?{" "}
            <ArgonTypography
              component={Link}
              to="/signup"
              variant="button"
              color="white"
              fontWeight="bold"
            >
          <u>  Sign Up </u>  
            </ArgonTypography>
          </ArgonTypography>
        </ArgonBox> */}

       
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default Illustration;
