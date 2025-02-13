import React, { useRef } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import './PieChartComponent.css'; // Import the CSS file

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <span>{`${payload[0].name}: ${payload[0].value}`}</span>
      </div>
    );
  }
  return null;
};

// Prop types for the CustomTooltip component
CustomTooltip.propTypes = {
  active: PropTypes.bool,  // Indicates if the tooltip is active
  payload: PropTypes.array, // Data to be displayed in the tooltip
};

const PieChartComponent = ({ data }) => {
  const chartRef = useRef(null); // Create a ref to the chart container
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042','#7C00FE','#FF6600','#219C90','#FDDE55','#06D001','#008DDA','#E72929','#9195F6','#FFEB00','#FF77B7','#10375C','#229799','#2C4E80','#597E52','#674188','#FFC7ED','#050C9C','#640D5F','#874CCC','#C6E7FF','#FFB38E','#133E87','#FF9D3D','#FF4545','#3D0301','#00ADB5','#F9E400','#06D001','#26355D','#FF204E','#FF0080','#FFF455',
    '#B6FFFA','#6528F7','#39B5E0','#A555EC','#0F6292','#A149FA','#542E71','#7868E6','#52734D','#FDB827','#41AEA9','#6F4E37','#FF8000','#8174A0','#4335A7','#640D5F','#4C1F7A','#A888B5','#80C4E9','#219B9D','#D91656','#FF2929','#355F2E','#0A97B0','#0A5EB0','#F26B0F','#E73879','#7A1CAC','#135D66','#433D8B','#704264','#77B0AA','#D95F59','#8C3061','#3C0753','#52D3D8','#','#5D3587',
    '#190482','#FBD288','#CC2B52','#E85C0D','#2E073F','#AD49E1','#A04747','#0B2F9F','#40534C','#134B70','#8D493A','#508D4E','#478CCF','#E0A75E','#4C3BCF','#7776B3','#FFBF78','#C5FF95','#D20062','#FF204E','#430A5D','#5356FF','#378CE7','#FF8E8F','#FFB38E','#7469B6','#2D9596','#211C6A','#D24545','#6C22A6','#0F1035','#F6B17A','#EF4040','#7B66FF','#D0A2F7'];
  // Function to download the chart as a PNG
  const downloadChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current, { useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'pie_chart_report.png';
        link.click();
      });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Use flexbox to align button and heading */}
      <div className="header-container">
        <h4 style={{ color: "#344767", margin: 0 }}>Chart Data</h4>
        <button className="pie-chart-button" onClick={downloadChart}>
          <i className="fa fa-download"></i>&nbsp;Download
        </button>
      </div>
  
      {/* Wrap the chart and legends together */}
      <div ref={chartRef} className="chart-container">
        <div className="pie-chart-container">
          <PieChart width={400} height={400}> {/* Increased width and height */}
            <Pie
              data={data}
              cx={200} // Center x-coordinate adjusted
              cy={200} // Center y-coordinate adjusted
              labelLine={false} // Hide label lines
              outerRadius={130} // Increased outer radius
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
  
        {/* Render legends below the chart */}
        <h3>Total Ships in the region</h3>
        {/* <div className="legend-container">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="legend-item">
              <div
                className="legend-color-box"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
              <span>
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

// Add propTypes for validation
PieChartComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PieChartComponent;
