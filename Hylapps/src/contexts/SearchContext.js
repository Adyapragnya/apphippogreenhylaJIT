// src/contexts/SearchContext.js
import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({  }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <SearchContext.Provider value={{ searchQuery, handleSearchChange }}>
      {children}
    </SearchContext.Provider>
  );
};
