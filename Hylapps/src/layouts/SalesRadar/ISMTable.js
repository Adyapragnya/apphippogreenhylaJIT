import { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, MenuItem, ListItemIcon } from '@mui/material';
import { AccountCircle, Send } from '@mui/icons-material';
import { MaterialReactTable } from 'material-react-table';
import { AuthContext } from "../../AuthContext";


const ISMTable = ({ rows = [], onRowClick }) => {
  const { role, id } = useContext(AuthContext);

  // Sort rows: SalesQuotationNumber should be considered, prioritize rows with non-empty SalesQuotationNumber
  const sortedRows = useMemo(() => {
    return rows.sort((a, b) => {
      const aHasQuotation = a.SalesQuotationNumber && a.SalesQuotationNumber !== '-';
      const bHasQuotation = b.SalesQuotationNumber && b.SalesQuotationNumber !== '-';
      if (aHasQuotation && !bHasQuotation) return 1; // a comes first
      if (!aHasQuotation && bHasQuotation) return -1;  // b comes first
      return 0;  // if both are the same, keep the original order
    });
  }, [rows]);


  const columns = useMemo(() => [

    {
      header: 'Sales Qutation No',
      accessorKey: 'SalesQuotationNumber',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'Customer Owner',
      accessorKey: 'CompanyTitle',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Vessel Name',
      accessorKey: 'vesselname',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'Vessel Type',
      accessorKey: 'vesseltype',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'IMO',
      accessorKey: 'IMO',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },


    {
      header: 'Destination',
      accessorKey: 'AIS.DESTINATION',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'ETA',
      accessorKey: 'AIS.ETA',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
     {
      header: 'Speed',
      accessorKey: 'AIS.SPEED',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'Heading',
      accessorKey: 'AIS.HEADING',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'DTG',
      accessorKey: 'AIS.DISTANCE_REMAINING',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

   
    {
      header: 'Region Name',
      accessorKey: 'AisPullGfType',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Gross Weight',
      accessorKey: 'GrossTonnage',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Current Flag',
      accessorKey: 'CurrentFlag',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Current Class',
      accessorKey: 'CurrentClass',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Management Office',
      accessorKey: 'ManagementOffice',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
  ], []);

  const renderRowActionMenuItems = ({ closeMenu, row }) => [
    <MenuItem
      key={0}
      onClick={() => {
        closeMenu();
        onRowClick(row.original); // Trigger row click event
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon>
        <AccountCircle />
      </ListItemIcon>
      View Vessel Details
    </MenuItem>,
    <MenuItem
      key={1}
      onClick={() => {
        closeMenu();
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon>
        <Send />
      </ListItemIcon>
      Send Alert
    </MenuItem>,
  ];

  return (
    <div className="geofence-histories">
      {sortedRows.length === 0 ? (
        <p>No data to display</p>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={sortedRows} // Use the sorted rows
          enableColumnResizing
          enableGrouping
          enablePagination
          enableColumnPinning
          enableColumnOrdering
          enableColumnDragging
          enableExport
          enableDensityToggle
          enableRowActions
          renderRowActionMenuItems={renderRowActionMenuItems}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ desc: false }],
            density: 'compact',
          }}
          muiTableHeadCellProps={{
            style: { fontWeight: 'bold', padding: '8px', textAlign: 'center', color:'#0F67B1' },
          }}
          muiTableBodyCellProps={({ cell }) => {
            const pointerColor = cell.row.original.pointerColor; // Get the pointerColor from the row

            // Set text color based on pointerColor value
            let textColor = '#80AF81';
            if (pointerColor === '#80AF81') {
              textColor = ''; // Blue text
            } else if (pointerColor === '#ffff') {
              textColor = '#ffff'; // Green text
            }

            return {
              style: {
                backgroundColor: textColor, // Apply color to the text of each cell
                textAlign: 'center',
              },
            };
          }}
        />
      )}
    </div>
  );
};

ISMTable.propTypes = {
  rows: PropTypes.array.isRequired,  // Expecting the rows prop to be passed in
  onRowClick: PropTypes.func.isRequired,
};

export default ISMTable;
