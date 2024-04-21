import Colors from '@/constants/Colors'
import MainHeader from '@/components/MainHeader'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import Picker from 'react-native-picker-select';
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput,
  TouchableOpacity,
  View, 
  Platform,
} from 'react-native'
import { Stack } from 'expo-router';
import { Dimensions } from 'react-native';
import thematicGroups from "@/database/thematicGroups";
import partsOfSpeech from "@/database/partsOfSpeech";
import LoadingScreen from '@/components/LoadingScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from '@/contexts/ToastContext';
import { useWords } from '@/contexts/WordsContext';
import Popup from '@/components/Popup';

type RootStackParamList = {
  '(cards)/edit': { idProp: number };
  '(tabs)': undefined;
};
const screenWidth = Dimensions.get('window').width;
type EditScreenRouteProp = RouteProp<RootStackParamList, '(cards)/edit'>;
type NavigationType = StackNavigationProp<RootStackParamList>;

export default function EditScreen() {
  const route = useRoute<EditScreenRouteProp>();
  const [goBackPopupVisible, setgoBackPopupVisible] = useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false);
  const [wordID, setWordID] = useState(0);
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [language, setLanguage] = useState("");
  const [plural, setPlural] = useState("");
  const [thematicGroup, setThematicGroup] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [meaning, setMeaning] = useState("");
  const [etymology, setEtymology] = useState("");
  const navigation = useNavigation<NavigationType>();
  const { showToast } = useToast();
  const { 
    triggerRefetch, deleteWord, updateWord, fetchWordDetails, 
    selectedWord, isLoading, triggerLoading, resetLoading
  } = useWords();

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
  
  useEffect(() => {
    if (route.params?.idProp) {
        fetchWordDetails(route.params.idProp);
        setWordID(selectedWord?.id || 0);
        setWord(selectedWord?.word || "");
        setPronunciation(selectedWord?.pronunciation || "");
        setLanguage(selectedWord?.language || "");
        setPlural(selectedWord?.plural || "");
        setThematicGroup(selectedWord?.thematicGroup || "");
        setPartOfSpeech(selectedWord?.partOfSpeech || "");
        setMeaning(selectedWord?.meaning || "");
        setEtymology(selectedWord?.etymology || "");
        triggerRefetch();
    }
  }, []);

  const handleUpdateWord = () => {
    updateWord({
      word: word,
      pronunciation: pronunciation,
      language: language,
      plural: plural,
      partOfSpeech: partOfSpeech,
      thematicGroup: thematicGroup,
      meaning: meaning,
      etymology: etymology,
      params: route.params?.idProp as any,
    })

    showToast("Successfully updated word!", "success");
    triggerRefetch();
    triggerLoading()
    navigation.goBack(); // Go back to previous screen after saving
  }

  const handleDeleteWord = () => {
    deleteWord(wordID);
    triggerRefetch();
    triggerLoading()
    showToast("Successfully deleted word!", "success")
    navigation.navigate("(tabs)");
  }

  const toggleGoBackPopup = () => {
    setgoBackPopupVisible(!goBackPopupVisible);
  };

  const toggleDeletePopup = () => {
    setDeletePopupVisible(!deletePopupVisible);
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
  }

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
      <Popup
        visible={deletePopupVisible}
        onPrimary={toggleDeletePopup}
        onSecondary={handleDeleteWord}
        header="Delete Word?"
        body="Are you sure you want to delete this word?"
        primary="Nope"
        secondary="Delete Word"
        primaryColor={Colors.tertiary}
        secondaryColor={Colors.deleteColor}
      />

      <View style={styles.container}>
        <Stack.Screen 
          options = {{
            header: () => <MainHeader title={"Edit Word"} /> 
          }}
        />

        {/* Form */}
        {isLoading ? (
          <LoadingScreen />
        ) : (
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
        )}
        
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rowBtn} onPress={toggleGoBackPopup}>
              <Ionicons name="backspace" size={32} color={Colors.secondary}/>
              <Text style={styles.text}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowBtn} onPress={toggleDeletePopup}>
              <Ionicons name="trash" size={32} color={Colors.deleteColor}/>
              <Text style={styles.text}>Delete Word</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowBtn} onPress={handleUpdateWord}>
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
  rowBtn: {
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
