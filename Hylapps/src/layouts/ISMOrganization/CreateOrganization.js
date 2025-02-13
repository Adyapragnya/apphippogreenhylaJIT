import React, { useState } from 'react';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import './Organization.css';
import {CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Icon, Modal, Box, Typography } from "@mui/material";

// import Mailloader from './mailloader';
// import './mailloader.css';

const CreateOrganization = () => {
  const [companyTitle, setCompanyTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
 
  const [files, setFiles] = useState([]);
  const [isSubmittingLoader, setIsSubmittingLoader] = useState(false); // For disabling the button
  // const [loading, setLoading] = useState(false); // State for showing the loader

  const encryptionKey = 'mysecretkey';


  const handleCompanyTitleChange = (e) => {
    const input = e.target.value;

    // Allow only alphabets and limit the length to 5
    if (/^[a-zA-Z]*$/.test(input) && input.length <= 6) {
      setCompanyTitle(input);
    }
  };

  const handleViewFile = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmittingLoader(true);
    

    const formData = new FormData();
    formData.append('companyTitle', companyTitle);
    formData.append('companyName', companyName);
    formData.append('address', address);

 

    try {
       // Log formData entries for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseURL}/api/ism-organizations/create`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Success', 'Fleet organization created !', 'success');
        
        // Reset the form data after successful submission
        setCompanyTitle('');
        setCompanyName('');
        setAddress('');
        

      } else {
        Swal.fire('Error', data.message || 'Failed to create organization', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to save Fleet organization. Please try again later.', 'error');
    } finally {
      setIsSubmittingLoader(false); // Re-enable the submit button after submission
      // setLoading(false); // Hide loader when submission is complete
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, go back!',
      customClass: {
        popup: 'custom-swal',
      },
    });

    if (result.isConfirmed) {
      setCompanyTitle('');
      setCompanyName('');
      setAddress('');
      setContactEmail('');
      setAdminFirstName('');
      setAdminLastName('');
      setAdminEmail('');
      setAdminContactNumber('');
      setAssignShips('');
      setFiles([]);

      Swal.fire({
        title: 'Cancelled!',
        text: 'Your action has been cancelled.',
        icon: 'info',
        customClass: {
          popup: 'custom-swal',
        },
      });
    }
  };


  return (
    <div>

      
            {/* Full-page Loading Spinner Overlay */}
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
      Please wait! Creating Fleet Organization...
    </Typography>
    <CircularProgress color="primary" size={60} />
   
  </Box>
)}


    <div className="alert-form-container">


       {/* {loading && <Mailloader />} Show loader only when loading state is true */}
      <form className="alert-form" onSubmit={handleSubmit}>
        <h2 className="text-center" style={{ color: '#0F67B1' }}>Create Fleet organization</h2>
        <hr />


  <div className="two-column">
     <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          Company Title:
   
        </span>
    <input
      type="text"
      value={companyTitle}
      onChange={handleCompanyTitleChange}
      placeholder="Enter up to 6 uppercase letters"
      maxLength="6" // HTML validation (optional but helpful)
      style={{ marginTop: '5px' }} // Optional: Add spacing between helper text and input
    />
  </label>

  <label>
            Company Name:
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter Company Name" />
          </label>
</div>


        <div className="two-column">
          <label>
            Address:
            <textarea 
              value={address} 
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 150) {
                  setAddress(value);
                  console.log(address);
                }
              }} 
              placeholder="Enter Address" 
              rows={1}
            />
          </label>

        </div>

        <hr />

        <div className="form-buttons button-group">
          <button type="submit" disabled={isSubmittingLoader}>
            {isSubmittingLoader ? 'Creating...' : 'Create'}
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default CreateOrganization;
