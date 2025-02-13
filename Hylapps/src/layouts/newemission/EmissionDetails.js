import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Button, ButtonGroup } from '@mui/material';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import * as XLSX from 'xlsx';
import axios from 'axios';
import PropTypes from 'prop-types';
import { format} from 'date-fns-tz';



const EmissionDetails =  ({ selectedVessel, selectedPort })  => {
  // const [data, setData] = useState([
  //   {
  //     virtualNORTenderedDate: '2025-02-04',
  //     timeTenderedAt: '12:30 PM',
  //     etb: '2025-02-05 09:00 AM',
  //     currentDTG: '2025-02-04 12:00 PM',
  //     positionReportedAt: 'Near Port A',
  //     currentETA: '2025-02-06 08:00 AM',
  //     currentSpeed: '12 knots',
  //     dtgAtVirtualNOR: '2025-02-04 12:10 PM',
  //     speedToMaintainETB: '15 knots',
  //     parsedTree: [
  //       {
  //         speed: '12 knots',
  //         eta: '2025-02-06 08:00 AM',
  //         estimatedWaitingTime: '2 hrs',
  //         co2: '3.5 MT',
  //         sox: '0.1 MT',
  //         nox: '0.8 MT',
  //         fuelConsumption: '5 MT',
  //       },
  //     ],
  //     vesselName: 'Vessel A',
  //     voyageName: 'Voyage 101',
  //   },
  // ]);

 

  const [data, setData] = useState([]);

//   useEffect(()=>{

//     const fetchVessels = async () => {
// try{
//   const baseURL = process.env.REACT_APP_API_BASE_URL;
//   // Now fetch all vessels
 
//   const response = await axios.get(`${baseURL}/api/get-JITreport`);
  
//   const Data = response.data;
//     setData(Data);
//     console.log(Data);
  
// }
// catch (error) {
//   console.error("Error while fetching JIT report data", error);
//   toast.error('Failed to fetch emission data');
// }

//   }

//   fetchVessels();

//   },[])


  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        // Now fetch all vessels
        const response = await axios.get(`${baseURL}/api/get-JITreport`);
        
       

        let filteredData = response.data;

            // If selectedPort is provided, filter by port name
      if (selectedPort) {
        filteredData = filteredData.filter(vessel => vessel.port === selectedPort?.name);
      }

      // If selectedVessel is provided, filter by IMO after filtering by port
      if (selectedVessel) {
        filteredData = filteredData.filter(vessel => vessel.IMO === selectedVessel?.AIS?.IMO);
      }

  

           // Format the dates (JitEta, pointOfSpeedReduction, ETB)
      const formattedData = filteredData.map(vessel => ({
        ...vessel,

        createdAt: vessel.createdAt 
        ? format(new Date(vessel.createdAt ), 'dd-MM-yyyy HH:mm') 
        : '--',
        CalculatedData: {
          ...vessel.CalculatedData,
          JitEta: vessel.CalculatedData.JitEta 
            ? format(new Date(vessel.CalculatedData.JitEta), 'dd-MM-yyyy HH:mm') 
            : '--',
          pointOfSpeedReduction: vessel.CalculatedData.pointOfSpeedReduction 
            ? format(new Date(vessel.CalculatedData.pointOfSpeedReduction), 'dd-MM-yyyy HH:mm') 
            : '--',
          ETB: vessel.CalculatedData.ETB 
            ? format(new Date(vessel.CalculatedData.ETB), 'dd-MM-yyyy HH:mm') 
            : '--',
            positionReportedAt: vessel.CalculatedData.positionReportedAt 
            ? format(new Date(vessel.CalculatedData.positionReportedAt), 'dd-MM-yyyy HH:mm') 
            : '--',
            currentETA: vessel.CalculatedData.currentETA 
            ? format(new Date(vessel.CalculatedData.currentETA), 'dd-MM-yyyy HH:mm') 
            : '--'
        }
      }));


        setData(formattedData);  // Set filtered data to state
        console.log(formattedData);
      } catch (error) {
        console.error("Error while fetching JIT report data", error);
        toast.error('Failed to fetch emission data');
      }
    };
  
    fetchVessels();
  }, [selectedVessel, selectedPort]);  // Adding selectedVessel as a dependency to re-run the effect when selectedVessel changes
  
 
  
// add dependency (or) ies

  const columns = useMemo(
    () => [
      { accessorKey: 'VesselName', header: 'Vessel Name' },
      { accessorKey: 'IMO', header: 'IMO' },
      { accessorKey: 'port', header: 'Port' },
      { accessorKey: 'createdAt', header: 'Saved At',  },
      { accessorKey: 'CalculatedData.JitEta', header: 'Virtual NOR Tendered Date'},
      { accessorKey: 'CalculatedData.pointOfSpeedReduction', header: 'Time Tendered At' },
      { accessorKey: 'CalculatedData.ETB', header: 'ETB' },
      { accessorKey: 'CalculatedData.currentDTG', header: 'Current DTG' },
      { accessorKey: 'CalculatedData.positionReportedAt', header: 'Position Reported At' },
      { accessorKey: 'CalculatedData.currentETA', header: 'Current ETA' },
      { accessorKey: 'CalculatedData.currentSpeed', header: 'Current Speed' },
      { accessorKey: 'CalculatedData.dtgAtVirtualNOR', header: 'DTG At Virtual NOR' },
      { accessorKey: 'CalculatedData.speedToMaintainETB', header: 'Speed To Maintain ETB' },
    ],
    []
  );




  const handleDownloadCSV = () => {
    // Check if the data array is empty or undefined
    if (!data || data.length === 0) {
      toast.error('No data available to download!');
      return;
    }
  
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const sheetNames = new Set(); // To track existing sheet names
  
    // Loop through the data to create a sheet for each vessel
    data.forEach((row) => {
      if (!row || !row.VesselName || !row.IMO || !row.CalculatedData || !row.EmissionData) {
        toast.error('Missing required data for vessel: ' + row?.VesselName);
        return;  // Skip this row if essential data is missing
      }
  
      // Prepare the Emission Details section (Main Vessel Data)
      const emissionDetails = [
        ['Emission Details'],  // Main Header for Emission Details
        ['Vessel Name', 'IMO', 'Voyage Name', 'Virtual NOR Tendered Date', 'Time Tendered At', 'ETB', 'Current DTG', 'Position Reported At', 'Current ETA', 'Current Speed', 'DTG At Virtual NOR', 'Speed To Maintain ETB'],
        [
          row.VesselName,
          row.IMO,
          row.VoyageName,
          row.CalculatedData.virtualNORTenderedDate,
          row.CalculatedData.timeTenderedAt,
          row.CalculatedData.ETB,
          row.CalculatedData.currentDTG,
          row.CalculatedData.positionReportedAt,
          row.CalculatedData.currentETA,
          row.CalculatedData.currentSpeed,
          row.CalculatedData.dtgAtVirtualNOR,
          row.CalculatedData.speedToMaintainETB,
        ],
        [],
      ];
  
      // Prepare the Calculated Data section (Emission Data)
      const calculatedData = [
        ['Calculated Data'],  // Main Header for Calculated Data
        ['Speed (knots)', 'ETA', 'Estimated Waiting Time (hrs)', 'CO2 (MT)', 'SOx (MT)', 'NOx (MT)', 'Fuel Consumption (MT)'],
        ...row.EmissionData.map((item) => [
          item.speed,
          item.ETA,
          item.EWT,
          item.CO2,
          item.SOx,
          item.NOx,
          item.totalConsumption
        ])
      ];
  
      // Merge both sections into one sheet for the vessel
      const mergedData = [...emissionDetails, ...calculatedData];
  
      // Create worksheet for the merged data
      const ws = XLSX.utils.aoa_to_sheet(mergedData);
  
      // Merge the header cells for "Emission Details" and "Calculated Data"
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },  // Merging the first row for "Emission Details"
        { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },   // Merging the first row for "Calculated Data"
      ];
  
      // Ensure the cells exist before applying styles
      ws['A1'] = ws['A1'] || {};  // Create the A1 cell if it doesn't exist
      ws['A4'] = ws['A4'] || {};  // Create the A4 cell if it doesn't exist
  
      // Define the style for bold, yellow font, centered text, and yellow background
      const headerStyle = {
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { patternType: 'solid', fgColor: { rgb: 'FFFF00' } }, // Yellow background
        font: { bold: true, color: { rgb: '000000' } }, // Bold and black font color
        border: {
          top: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
        },
      };
  
      // Apply style to the merged header cells
      ws['A1'].s = headerStyle;  // "Emission Details"
      ws['A4'].s = headerStyle;  // "Calculated Data"
  
      // Check if the vessel name already exists as a sheet name
      let vesselName = row.VesselName;
      let uniqueName = vesselName;
      let counter = 1;
  
      // If the sheet name already exists, modify the name by appending a number
      while (sheetNames.has(uniqueName)) {
        uniqueName = `${vesselName} (${counter++})`;
      }
  
      // Add the sheet to the workbook with the unique vessel name
      XLSX.utils.book_append_sheet(wb, ws, uniqueName);
      sheetNames.add(uniqueName);  // Track the sheet name to avoid future duplicates
    });
  
    // Write the workbook to a file and trigger the download
    XLSX.writeFile(wb, 'emission_data.xlsx');
  
    toast.success('Emission Report downloaded successfully!');
  };
  
  
  const handleDownloadPDF = () => {
    if (!data || data.length === 0) {
      toast.error('No data available to download!');
      return;
    }
  
    const doc = new jsPDF();
    doc.setFontSize(10); // Set font size for smaller tables
  
    // Title of the PDF
    doc.text('Emission Report', 14, 10);
  
    // Loop through each vessel
    data.forEach((row, index) => {
      if (!row || !row.VesselName || !row.IMO || !row.CalculatedData || !row.EmissionData) {
        toast.error('Missing required data for vessel: ' + row?.VesselName);
        return;  // Skip this row if essential data is missing
      }
  
      // Add a new page for each vessel (we're creating Excel-like separation)
      if (index > 0) {
        doc.addPage();
      }
  
      // Vessel details data
      const rowData = [
        ['Serial Number', index + 1],
        ['Vessel Name', row.VesselName],
        ['IMO', row.IMO],
        ['Voyage Name', row.VoyageName],
        ['Virtual NOR Date', row.CalculatedData.virtualNORTenderedDate],
        ['Time Tendered At', row.CalculatedData.timeTenderedAt],
        ['ETB', row.CalculatedData.ETB],
        ['Current DTG', row.CalculatedData.currentDTG],
        ['Position Reported At', row.CalculatedData.positionReportedAt],
        ['Current ETA', row.CalculatedData.currentETA],
        ['Current Speed', row.CalculatedData.currentSpeed],
        ['DTG At Virtual NOR', row.CalculatedData.dtgAtVirtualNOR],
        ['Speed To Maintain ETB', row.CalculatedData.speedToMaintainETB],
      ];
  
      // Create main table with vessel details
      autoTable(doc, {
        head: [['Attribute', 'Value']],
        body: rowData,
        startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 20,
        styles: { fontSize: 9 },
        margin: { top: 10, left: 10, right: 10, bottom: 10 },
        theme: 'grid',
      });
      
      // Loop through emission data and add sub-tables under the same vessel
      row.EmissionData.forEach((item, emissionIndex) => {
        const currentY = doc.lastAutoTable.finalY;
      
        // Emission data sub-table
        autoTable(doc, {
          head: [['Attribute', 'Value']],
          body: [
            ['Speed (knots)', item.speed],
            ['ETA', item.ETA],
            ['Estimated Waiting Time', item.EWT],
            ['CO2 (MT)', item.CO2],
            ['SOx (MT)', item.SOx],
            ['NOx (MT)', item.NOx],
            ['Fuel Consumption (MT)', item.totalConsumption],
          ],
          startY: currentY + 10, // Start position based on the last table's position
          styles: { fontSize: 8 },
          margin: { left: 15, right: 15 },
          theme: 'striped',
        });
  
        // Ensure we don't overlap too many sub-tables
        if (doc.lastAutoTable.finalY > 250) {
          doc.addPage();
        }
      });
    });
  
    // Save the PDF
    doc.save('emission_data.pdf');
  
    // Show success notification
    toast.success('PDF file downloaded successfully!');
  };
  
  return (
    <div>
      <ButtonGroup variant="contained" color="primary" aria-label="export actions" style={{ marginBottom: '10px' }}>
        <Button onClick={handleDownloadCSV} style={{ color: '#fff' }}>
          <i className='fa-solid fa-file-excel'></i>&nbsp;Download CSV
        </Button>
        <Button onClick={handleDownloadPDF} style={{ color: '#fff' }}>
          <i className='fa-solid fa-file-pdf'></i>&nbsp;Download PDF
        </Button>
      </ButtonGroup>

      <MaterialReactTable
        columns={columns}
        data={data}
        enableExpandingRows
        enableColumnResizing
        enableSorting
        enableGlobalFilter
        enableGrouping
        enablePagination
        initialState={{ density: 'compact' }}
        enableColumnFilters
        renderDetailPanel={({ row }) => (
          <div>
          {row.original.EmissionData && row.original.EmissionData.length > 0 ? (
            
          <div className="p-4 bg-gray-100">
            
            <h3 style={{ color: '#344767' }}>Calculated Data</h3>
            <div style={{ margin: '0 auto', maxWidth: '100%', overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: '10px',
                  border: '1px solid #ddd',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      Speed (knots)
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                     Calculated ETA
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      Estimated Waiting Time (hrs)
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      CO2 (MT)
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      SOx (MT)
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      NOx (MT)
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0F67B1',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      Fuel Consumption (MT)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {row.original.EmissionData.map((item, index) => (
                    <tr key={index}
                    style={{
                      backgroundColor:
                        index === 0
                          ? '#A9C46C'  // Default green for the first row
                          : index === 1 && row.original.EmissionData.length > 11
                          ? '#EB5A3C'  // Apply blue to the second row if length > 11
                          : '', // Default to no background color for other rows
                    }}
                    >
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                        {item.speed}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                           {item?.ETA ? format(item.ETA, 'dd-MM-yyyy HH:mm') : '--' }
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                        {item.EWT}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                        {item.CO2}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                        {item.SOx}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                        {item.NOx}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          textAlign: 'center',
                        }}
                      >
                        {item.totalConsumption}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>

              ) : (
          <div className="p-4 bg-gray-100">
                <p style={{ textAlign: 'center', color: '#EB5A3C', fontWeight: 'bold', marginTop: '10px' }}>
                  Emission Data Not Available
                </p>
            </div>

              )}
          </div>
        )}
      
        muiTableHeadCellProps={{
          style: {
            textAlign: 'center', // Align headers in the center
            height:"-20px"
          },
        }}
        muiTableBodyCellProps={{
          style: {
            textAlign: 'center', // Align data in the center
            padding: '40px', // Add padding for better readability
          },
        }}
/>

      <ToastContainer />
    </div>
  );
};


EmissionDetails.propTypes = {
  selectedVessel: PropTypes.shape({
    SpireTransportType: PropTypes.string,
    AIS: PropTypes.shape({
      NAME: PropTypes.string,
      IMO: PropTypes.string,
      CALLSIGN: PropTypes.string,
      SPEED: PropTypes.number,
      DESTINATION: PropTypes.string,
      SpireTransportType: PropTypes.string,
      LATITUDE: PropTypes.number,
      LONGITUDE: PropTypes.number,
      HEADING: PropTypes.number,
      ETA: PropTypes.string,
    }),
  }),

  selectedPort: PropTypes.shape({
    name: PropTypes.string,

  }),
};

export default EmissionDetails;