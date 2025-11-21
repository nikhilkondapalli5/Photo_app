import React, { createContext, useContext, useState, useMemo } from 'react'; 
import PropTypes from 'prop-types';

const AdvancedFeaturesContext = createContext();

export function AdvancedFeaturesProvider({ children }) {
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);

  const toggleAdvancedFeatures = () => {
    setAdvancedFeaturesEnabled(prev => !prev);
  };

  // Wrap the value object in useMemo
  const providerValue = useMemo(() => ({
    advancedFeaturesEnabled,
    toggleAdvancedFeatures
  }), [advancedFeaturesEnabled, toggleAdvancedFeatures]); // Add dependencies

  return (
    <AdvancedFeaturesContext.Provider 
      value={providerValue} // Use the memoized value
    >
      {children}
    </AdvancedFeaturesContext.Provider>
  );
}

// ... (rest of file)

AdvancedFeaturesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAdvancedFeatures() {
  const context = useContext(AdvancedFeaturesContext);
  if (!context) {
    throw new Error('useAdvancedFeatures must be used within AdvancedFeaturesProvider');
  }
  return context;
}