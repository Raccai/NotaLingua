import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ExportTypeContext = createContext({ currentExportType: "CSV", setCurrentExportType: (type: any) => {} });

export const ExportTypeProvider = ({ children }: { children: any}) => {
    const [currentExportType, setCurrentExportType] = useState('CSV'); // Default to 'DB'
  
    // Load the export type from AsyncStorage when the app starts
    useEffect(() => {
      const loadExportType = async () => {
        try {
          const storedExportType = await AsyncStorage.getItem('exportType');
          if (storedExportType) {
            setCurrentExportType(storedExportType);
          }
        } catch (error) {
          console.error('Failed to load export type from storage', error);
        }
      };
  
      loadExportType();
    }, []);
  
    // Save the export type to AsyncStorage whenever it changes
    useEffect(() => {
      const saveExportType = async () => {
        try {
          await AsyncStorage.setItem('exportType', currentExportType);
        } catch (error) {
          console.error('Failed to save export type to storage', error);
        }
      };
  
      saveExportType();
    }, [currentExportType]);
  
    return (
      <ExportTypeContext.Provider value={{ currentExportType, setCurrentExportType }}>
        {children}
      </ExportTypeContext.Provider>
    );
  };
  
  export const useExportType = () => useContext(ExportTypeContext);