import ToastNotif from '@/components/ToastNotif';
import { Dimensions, StyleSheet, View } from 'react-native';
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({
    show: false,
    message: "",
    type: "success",
    showToast: (message: string, type: string) => {},
    hideToast: () => {}
});

const screenWidth = Dimensions.get('window').width;
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: {children: any}) => {
  const [toast, setToast] = useState({ show: false, message: "", type: "success"});

  const showToast = useCallback((message: any, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type});
    }, 2000); // Adjust duration as needed
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: "success"});
  }, []);

  return (
    <ToastContext.Provider value={{ ...toast, showToast, hideToast }}>
        {children}
        {toast.show && (
            <View style={styles.container}>
                <ToastNotif message={toast.message} type={toast.type} /> 
            </View>
        )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: screenWidth,
        paddingTop: 40,
    },
})