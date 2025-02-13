import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [vesselResults, setVesselResults] = useState([]);
  const [isInputVisible, setIsInputVisible] = useState(1);
  const navigate = useNavigate();

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term) {
      setFilteredResults([]);
      setVesselResults([]);
      return;
    }

    // Filter links based on search term
    const links = document.querySelectorAll('a');
    const results = [];

    links.forEach((link, index) => {
      const textContent = link.textContent || link.innerText;

      if (textContent && textContent.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          id: index,
          content: textContent.trim(),
          href: link.href,
        });
      }
    });

    setFilteredResults(results);

    // Fetch vessel data from the API based on search term
    fetchVesselData(term);
  };

  const fetchVesselData = async (term) => {
    try {

      const baseURL = process.env.REACT_APP_API_BASE_URL;
      
      const response = await axios.get(`${baseURL}/api/get-tracked-vessels`); 
      const vessels = response.data;
    
      console.log(vessels);
  
      // Filter vessel results based on the search term
      const vesselResults = vessels.filter((vessel) =>
        vessel.AIS?.NAME?.toLowerCase().includes(term.toLowerCase()) ||
        vessel.IMO?.toString().includes(term) ||
        vessel.FLAG?.toLowerCase().includes(term.toLowerCase())
      );
      console.log(vesselResults);
      setVesselResults(vesselResults);
    } catch (error) {
      console.error('Error fetching tracked vessels:', error);
    }
  };

  // Handle search result click
  const handleResultClick = (href) => {
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.location.href = href;
    }

    setSearchTerm('');
    setFilteredResults([]);
    setVesselResults([]);
  };

  // Handle vessel result click
  const handleVesselClick = (vessel) => {
    // Implement navigation logic for vessel results if needed
    console.log('Vessel clicked:', vessel);
    setSearchTerm('');
    setFilteredResults([]);
    setVesselResults([]);
  };

  // Toggle visibility of the search input box
  const handleSearchClick = () => {
    setIsInputVisible(!isInputVisible);
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchWrapper}>
        <FaSearch size={20} style={styles.searchIcon} onClick={handleSearchClick} />

        {/* Only show input if isInputVisible is true */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search anything..."
          style={{
            ...styles.input,
            opacity: isInputVisible ? 1 : 0,
            transform: isInputVisible ? 'translateX(0)' : 'translateX(-100%)',
            visibility: isInputVisible ? 'visible' : 'hidden',
          }}
        />
      </div>

      {/* Search results dropdown */}
      {filteredResults.length > 0 || vesselResults.length > 0 ? (
        <ul style={styles.resultsList}>
          {/* Render filtered links */}
          {filteredResults.map((result) => (
            <li
              key={result.id}
              onClick={() => handleResultClick(result.href)}
              style={styles.resultItem}
            >
              {result.content}
            </li>
          ))}

          {/* Render vessel search results */}
          {vesselResults.map((vessel) => (
           
              <a href="/dashboard/${vessel.AIS.NAME}"
                key={vessel.transportName}
              onClick={() => handleVesselClick(vessel)}
              style={styles.resultItem}>
              {vessel.transportName} (Vessel: {vessel.AIS.NAME})
              </a>
           
          ))}
        </ul>
      ) : null}

      {filteredResults.length === 0 && vesselResults.length === 0 && searchTerm && (
        <p style={styles.noResults}>No results found for {searchTerm}</p>
      )}
    </div>
  );
};

// Inline styling for the component
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    textAlign: 'center',
    paddingTop: '20px',
  },
  searchWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    borderRadius: '5px',
    width: '100%',
    maxWidth: '450px', // Restrict maximum width for better alignment
    margin: '0 auto', // Center align the search bar on the page
  },
  searchIcon: {
    marginRight: '10px',
    color: '#0F67B1',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    outline: 'none',
    transition: 'transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
  },
  resultsList: {
    listStyleType: 'none',
    padding: '0',
    margin: '10px auto 0',
    width: '100%',
    maxWidth: '450px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '5px',
    maxHeight: '250px',
    overflowY: 'auto',
    position: 'absolute',
    zIndex: 9999, // Ensure results stay above other content (e.g., map)
    boxSizing: 'border-box',
  },
  resultItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
    transition: 'background-color 0.3s ease',
  },
  resultItemHover: {
    backgroundColor: '#f1f1f1',
  },
  noResults: {
    textAlign: 'left',
    color: '#ffff',
    marginTop: '10px',
    fontSize: '16px',
  },
};

export default GlobalSearch;
