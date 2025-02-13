import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ViewUser = () => {
  const [users, setUsers] = useState([]); // State to hold all user data
  const [filteredUsers, setFilteredUsers] = useState([]); // State to hold filtered data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedUserType, setSelectedUserType] = useState(''); // State to hold selected userType

  // Fetch user data when the component mounts
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/users/getData`) // Adjust the URL to your API endpoint
      .then((response) => {
        setUsers(response.data); // Set the fetched user data
        setFilteredUsers(response.data); // Initially, set filteredUsers to all users
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        setError('Failed to load users'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, []);

  // Handle the change of user type selection in dropdown
  const handleUserTypeChange = (event) => {
    const value = event.target.value;
    setSelectedUserType(value); // Update selected user type

    // Filter users based on the selected user type
    if (value === '') {
      setFilteredUsers(users); // Show all users if no specific type is selected
    } else {
      setFilteredUsers(users.filter(user => user.userType === value)); // Filter by user type
    }
  };

  // Define the columns for organizational users
  const organizationalColumns = [
    { accessorKey: 'userType', header: 'Category' },
    { accessorKey: 'selectedOrganization', header: 'Organization' },
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'contactEmail', header: 'Contact Email' },
    { accessorKey: 'userFirstName', header: 'First Name' },
    { accessorKey: 'userLastName', header: 'Last Name' },
    { accessorKey: 'userEmail', header: 'Email' },
    { accessorKey: 'userContactNumber', header: 'Contact Number' },
  ];

  // Define the columns for guest users (without Organization, Address, and Contact Email)
  const guestColumns = [
    { accessorKey: 'userType', header: 'Category' },
    { accessorKey: 'userFirstName', header: 'First Name' },
    { accessorKey: 'userLastName', header: 'Last Name' },
    { accessorKey: 'userEmail', header: 'Email' },
    { accessorKey: 'userContactNumber', header: 'Contact Number' },
  ];

  // Select columns based on the selected user type
  const columns = selectedUserType === 'guest' ? guestColumns : organizationalColumns;

  return (
    <div className="alert-form-container">
      <h2 className="text-center" style={{ color: "#0F67B1", marginBottom: "15px" }}>View Users</h2>

      {/* Dropdown to filter by userType */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="userType" style={{ marginRight: '10px' }}>Filter by User Type:</label>
        <select
          id="userType"
          value={selectedUserType}
          onChange={handleUserTypeChange}
          style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All</option>
          <option value="organizational user">Organizational User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Display loading message */}
      {loading && <CircularProgress />}

      {/* Display error message if any */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Displaying the user data in a table */}
      {!loading && filteredUsers.length > 0 ? (
        <MaterialReactTable
          columns={columns} // Dynamically chosen columns based on user type
          data={filteredUsers} // Display filtered users
          initialState={{ pagination: { pageIndex: 0, pageSize: 10 },
          sorting: [{ desc: false }],
          density: 'compact', }}
          enableColumnFilter={false}
          enableFullScreenToggle={false}
          enableColumnSorting
          enableColumnResizing
          enableGrouping
          enablePagination
          enableColumnPinning
          enableColumnOrdering
          enableColumnDragging
          enableExport
          enableDensityToggle
          muiTableBodyRowProps={{ hover: true }}
          muiTableProps={{
            sx: {
              minHeight: 500, // Adjust the height of the table
              borderCollapse: 'collapse', // Optional for styling
            },
          }}
          renderTopToolbarCustomActions={() => (
            <div>
              <Typography variant="h6" color="primary">
                Total Users: {filteredUsers.length}
              </Typography>
            </div>
          )}
        />
      ) : (
        !loading && <Typography>No users found.</Typography>
      )}
    </div>
  );
};

// Prop validation using PropTypes
ViewUser.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userType: PropTypes.string.isRequired,
      selectedOrganization: PropTypes.string,
      address: PropTypes.string,
      contactEmail: PropTypes.string,
      userFirstName: PropTypes.string.isRequired,
      userLastName: PropTypes.string.isRequired,
      userEmail: PropTypes.string.isRequired,
      userContactNumber: PropTypes.string.isRequired,
    })
  ),
  selectedUserType: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  filteredUsers: PropTypes.array,
  handleUserTypeChange: PropTypes.func,
};

ViewUser.defaultProps = {
  users: [],
  selectedUserType: '',
  loading: true,
  error: null,
  filteredUsers: [],
  handleUserTypeChange: () => {},
};

export default ViewUser;
