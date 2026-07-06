import React, { createContext, useContext, useState, useCallback } from 'react';

const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);

    const refreshCategories = useCallback((action = null, data = null) => {
        setRefreshTrigger(prev => prev + 1);
        setLastUpdate({ action, data, timestamp: Date.now() });
        console.log('🔄 Categories refreshed:', { action, data });
    }, []);

    return (
        <CategoryContext.Provider value={{ refreshTrigger, lastUpdate, refreshCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};