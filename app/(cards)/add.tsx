import Colors from '@/constants/Colors'
import MainHeader from '@/components/MainHeader'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import Picker from 'react-native-picker-select';
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput,
  TouchableOpacity,
  View, 
  Platform,
  Dimensions,
} from 'react-native'
import { Stack } from 'expo-router';
import thematicGroups from "@/database/thematicGroups";
import partsOfSpeech from "@/database/partsOfSpeech";
import { useToast } from '@/contexts/ToastContext';
import { useWords } from '@/contexts/WordsContext';
import Popup from '@/components/Popup';

const screenWidth = Dimensions.get('window').width;

export default function AddScreen() {
  const [word, setWord] = useState<string>("");
  const [pronunciation, setPronunciation] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [plural, setPlural] = useState<string>("");
  const [thematicGroup, setThematicGroup] = useState<string>("");
  const [partOfSpeech, setPartOfSpeech] = useState<string>("");
  const [meaning, setMeaning] = useState<string>("");
  const [etymology, setEtymology] = useState<string>("");
  const [goBackPopupVisible, setgoBackPopupVisible] = useState<boolean>(false);
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { triggerRefetch, saveWord } = useWords();

  const singleLineFields = [
    { label: 'Word', value: word, setter: setWord },
    { label: 'Pronunciation', value: pronunciation, setter: setPronunciation },
    { label: 'Language', value: language, setter: setLanguage },
    { label: 'Plural', value: plural, setter: setPlural },
  ];
  
  const pickerFields = [
    { label: 'Part of Speech', value: partOfSpeech, setter: setPartOfSpeech, data: partsOfSpeech },
    { label: 'Thematic Group', value: thematicGroup, setter: setThematicGroup, data: thematicGroups },
  ];

  const multiLineFields = [
    { label: 'Meaning', value: meaning, setter: setMeaning },
    { label: 'Etymology', value: etymology, setter: setEtymology },
  ];

  const handleSaveWord = () => {
    saveWord({
      word: word,
      pronunciation: pronunciation,
      language: language,
      plural: plural,
      partOfSpeech: partOfSpeech,
      thematicGroup: thematicGroup,
      meaning: meaning,
      etymology: etymology,
    })
    showToast("Successfully added word to database!", "success")
    triggerRefetch();
    navigation.goBack(); // Go back to previous screen after saving
  }; 

  // Function to handle setting each state
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
  };

  const toggleGoBackPopup = () => {
    setgoBackPopupVisible(!goBackPopupVisible);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
      <Popup
        visible={goBackPopupVisible}
        onPrimary={toggleGoBackPopup}
        onSecondary={() => navigation.goBack()}
        header="Go back without saving?"
        body="Are you sure you want to go back without saving your data?"
        primary="Stay"
        secondary="Go Back"
        primaryColor={Colors.tertiary}
        secondaryColor={Colors.tertiary}
      />
      
      <View style={styles.container}>
        <Stack.Screen 
          options = {{
            header: () => <MainHeader title={"Add"} /> 
          }}
        />

        {/* Form */}
        <ScrollView style={styles.formScrollView}>
          <View>
            {/* For single line text input fields */}
            {singleLineFields.map((field, index) => (
              <View style={styles.formLineContainer} key={index}>
                <View style={styles.labelContainer}>
                  <Text style={styles.textLabel}>{field.label}</Text>
                </View>
                <TextInput 
                  style={styles.textInput}
                  value={field.value}
                  onChangeText={text => handleChange(field.setter, text)}
                />
              </View>
            ))}

            {/* For pickers */}
            {pickerFields.map((field, index) => (
              <View style={styles.formLineContainer} key={index}>
                <View style={styles.labelContainer}>
                  <Text style={styles.textLabel}>{field.label}</Text>
                </View>
                <View style={styles.pickerStyle}>
                  <Picker 
                    style={{
                      inputIOS:{
                        height: 40,
                        width: 150,
                        fontSize: 16,
                        paddingHorizontal: 12,
                        marginLeft: -20,
                        marginTop: -8
                      },
                      inputAndroid:{
                        height: 40,
                        width: 150,
                        fontSize: 16,
                        paddingHorizontal: 12,
                        marginLeft: -20,
                        marginTop: -8
                      }
                    }}
                    placeholder={{label: "Select", value: null}}
                    value={field.value}
                    onValueChange={(itemValue) => field.setter(itemValue)}
                    items={field.data.map((part) => ({label: part, value: part}))}
                  />
                </View>
              </View>
            ))}

            {/* For multiline text input */}
            {multiLineFields.map((field, index) => (
              <View style={styles.formMultiLineContainer} key={index}>
                <View style={styles.centerLabel}>
                  <Text style={styles.centerTextLabel}>{field.label}</Text>
                </View>
                <TextInput 
                  multiline
                  placeholder='Meaning here...'
                  style={styles.centerTextInput}
                  value={field.value}
                  onChangeText={text => handleChange(field.setter, text)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
        
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.backBtn} onPress={toggleGoBackPopup}>
              <Ionicons name="backspace" size={32} color={Colors.secondary}/>
              <Text style={styles.text}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWord}>
              <Ionicons name="save" size={32} color={Colors.secondary}/>
              <Text style={styles.text}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.primary,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 12,
    alignItems: "center",
  },
  saveBtn: {
    padding: 12,
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
  },
  text: {
    color: Colors.textInactive,
    fontFamily: "inter-r",
    fontSize: 18,
  },
  
  // for one line inputs
  formLineContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  labelContainer: {
    display: "flex",
    flexDirection: "row",
    width: 150,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  textLabel: {
    fontFamily: "inter-sm",
    color: Colors.textActive,
  },
  textInput: {
    backgroundColor: Colors.textActive,
    color: Colors.primary,
    height: 40,
    width: 150,
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    marginHorizontal: 24,
    fontFamily: "inter-el"
  },

  // for multiline inputs
  centerLabel: {
    display: "flex",
    flexDirection: "row",
    width: screenWidth-48,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  centerTextLabel: {
    display: "flex",
    flexDirection: "row",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    color: Colors.textActive,
    fontFamily: "inter-sm"
  },
  centerTextInput: {
    width: screenWidth-48,
    height: 112,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 24,
    fontFamily: "inter-el",
    color: Colors.primary,
    backgroundColor: Colors.textActive,
  },
  formMultiLineContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 24,
    paddingHorizontal: 24,
  },

  // for multi select
  pickerStyle: {
    backgroundColor: Colors.textActive,
    color: Colors.primary,
    height: 40,
    width: 150,
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    marginHorizontal: 24,
    fontFamily: "inter-el"
  },

  formScrollView: {
    marginTop: Platform.OS === 'ios' ? 0 : 90
  },
})
