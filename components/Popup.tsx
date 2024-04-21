import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'

type PopupProps = {
  visible: boolean,
  onPrimary: () => void,
  onSecondary: () => void,
  primary: string,
  secondary: string,
  primaryColor: string,
  secondaryColor: string,
  header: string,
  body: string,
  children?: React.ReactNode
}

const Popup: React.FC<PopupProps> = ({
  visible, 
  onPrimary, 
  onSecondary, 
  header, 
  body, 
  primary, 
  secondary,
  primaryColor,
  secondaryColor, 
  children
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onSecondary}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTextHeader}>{header}</Text>
          <Text style={styles.modalTextBody}>{body}</Text>
          <View style={styles.buttonsContainer}>
            {children}
            <TouchableOpacity onPress={onPrimary} style={[styles.buttonPrimary, {backgroundColor: primaryColor}]}>
              <Text style={styles.buttonText}>{primary}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSecondary} style={[styles.buttonSecondary, {borderColor: secondaryColor}]}>
              <Text style={styles.buttonText}>{secondary}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary80,
    zIndex: 1000,
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.cardColor,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTextHeader: {
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: Colors.textActive,
    fontFamily: "inter-sm",
  },
  modalTextBody: {
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.textActive,
    fontFamily: "inter-el",
    fontSize: 16,
    paddingHorizontal: 28,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  buttonPrimary: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  buttonText: {
    fontFamily: "inter-sm",
    fontSize: 16,
    color: Colors.textActive,
  },
});

export default Popup;