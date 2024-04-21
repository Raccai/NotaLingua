import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions 
} from 'react-native'
import React, { useState } from 'react'
import Colors from '@/constants/Colors'
import { useNavigation } from 'expo-router';
import { useToast } from '@/contexts/ToastContext';
import { useWords } from '@/contexts/WordsContext';
import Popup from './Popup';

const screenWidth = Dimensions.get('window').width;

export default function Button({btnType, deleteAll, btnText}: {btnType: string, deleteAll:boolean, btnText: string}) {
  const navigation = useNavigation<any>();
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false);
  const { showToast } = useToast();
  const { triggerRefetch, deleteAllWords } = useWords();

  const handleDeleteAllWords = () => {
    deleteAllWords();
    triggerRefetch();
    showToast("Deletes all words from database.", "success")
    navigation.goBack();
  }

  const deleteSomeWords = () => {
    navigation.navigate("(cards)/deleteMultiple");
  }

  const toggleDeletePopup = () => {
    setDeletePopupVisible(!deletePopupVisible);
  }
  
  return ( 
    <View>
      <Popup
        visible={deletePopupVisible}
        onPrimary={toggleDeletePopup}
        onSecondary={handleDeleteAllWords}
        header="Delete Word?"
        body="Are you sure you want to delete all the words in your database?"
        primary="Nope"
        secondary="Delete All Words"
        primaryColor={Colors.tertiary}
        secondaryColor={Colors.deleteColor}
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={btnType === "primary" ? styles.primary : styles.secondary}
          onPress={
            deleteAll===true ? 
            toggleDeletePopup :
            deleteSomeWords
            }
        >
          <Text style={styles.text}>{btnText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth-48,
    marginLeft: 24,
  },
  primary: {
    backgroundColor: Colors.deleteColor,
    fontFamily: "inter-r",
    color: Colors.textActive,
    borderRadius: 8,
    height: 44,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  secondary: {
    borderColor: Colors.deleteColor,
    borderWidth: 2,
    backgroundColor: "transparent",
    borderRadius: 8,
    height: 44,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "inter-r",
    color: Colors.textActive,
    fontSize: 16,
  }
})