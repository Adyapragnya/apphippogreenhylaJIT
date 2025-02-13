// src/components/SearchBar.js
import React from 'react';
import { useSearch } from '../contexts/SearchContext';

const SearchBar = () => {
  const { searchQuery, handleSearchChange } = useSearch();

  return (
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={handleSearchChange}
    />
  );
};

export default SearchBar;
