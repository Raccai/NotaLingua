import Colors from '@/constants/Colors'
import MainHeader from '@/components/MainHeader'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  View, 
  Platform,
} from 'react-native'
import { Stack } from 'expo-router';
import { Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LoadingScreen from '@/components/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { useWords } from '@/contexts/WordsContext';
import Popup from '@/components/Popup';

const screenWidth = Dimensions.get('window').width;
type RootStackParamList = {
    '(cards)/edit': { idProp: number }; // Define params expected by the edit screen
};
type EditScreenRouteProp = RouteProp<RootStackParamList, '(cards)/edit'>;
type EditScreenScreenNavigationProp = StackNavigationProp<RootStackParamList, '(cards)/edit'>;

export default function ViewScreen() {
    const route = useRoute<EditScreenRouteProp>();
    const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false);
    const [wordID, setWordID] = useState(0);
    const [word, setWord] = useState<string | null>("");
    const [pronunciation, setPronunciation] = useState<string | null>("");
    const [language, setLanguage] = useState<string | null>("");
    const [plural, setPlural] = useState<string | null>("");
    const [thematicGroup, setThematicGroup] = useState<string | null>("");
    const [partOfSpeech, setPartOfSpeech] = useState<string | null>("");
    const [meaning, setMeaning] = useState<string | null>("");
    const [etymology, setEtymology] = useState<string | null>("");
    const navigation = useNavigation<EditScreenScreenNavigationProp>();
    const { showToast } = useToast();
    const { 
        triggerRefetch, deleteWord, fetchWordDetails, selectedWord, 
        isLoading, triggerLoading, resetLoading 
    } = useWords();

    const singleLines = [
        { label: 'Pronunciation', value: pronunciation },
        { label: 'Language', value: language },
        { label: 'Plural', value: plural },
        { label: 'Part of Speech', value: partOfSpeech },
        { label: 'Thematic Group', value: thematicGroup },
    ];

    const multiLines = [
        { label: 'Meaning', value: meaning },
        { label: 'Etymology', value: etymology },
    ];

    useEffect(() => {
        async function fetchData() {
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
            }
        }
        fetchData();
    }, [route.params?.idProp, selectedWord]);

    const handleDeleteWord = () => {
        deleteWord(wordID);
        triggerRefetch();
        triggerLoading()
        showToast("Successfully deleted word!", "success")
        navigation.goBack();
    }

    const handleEditWord = () => {
        triggerLoading()
        navigation.push('(cards)/edit', { idProp: wordID });
    };
    
    const toggleDeletePopup = () => {
        setDeletePopupVisible(!deletePopupVisible);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
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
                        header: () => <MainHeader title={"Word Details"} /> 
                    }}
                />

                {isLoading ? (
                    <LoadingScreen />
                ): (
                    <ScrollView style={styles.formScrollView}>
                        {/* Single lines */}
                        <View>
                            <View style={styles.oneLineSectionContainer}>
                                <View style={styles.wordLabelContainer}>
                                    <Text style={styles.wordTextLabel}>{word}</Text>
                                </View>
                            </View>
                        </View>
                        {singleLines.map((field, index) => (
                            <View key={index}>
                                <View style={styles.oneLineSectionContainer}>
                                    <View style={styles.oneLineLabelContainer}>
                                        <Text style={styles.textLabel}>{field.label}</Text>
                                    </View>
                                    <View style={styles.oneLineTextContainer}>
                                        {field.value ? (
                                            <Text style={styles.oneLineTextBody}>
                                                {field.value}
                                            </Text>
                                        ): (
                                            <Text style={[styles.oneLineTextBody, styles.null]}>
                                                null
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}

                        
                        {/* Multilines */}
                        {multiLines.map((field, index) => (
                            <View key={index}>
                                <View style={styles.multiLineSectionContainer}>
                                    <View style={styles.multiLineLabelContainer}>
                                        <Text style={styles.textLabel}>{field.label}</Text>
                                    </View>
                                    <View style={styles.multiLineTextContainer}>
                                        {field.value ? (
                                            <Text style={styles.multiTextBody}>
                                                {field.value}
                                            </Text>
                                        ): (
                                            <Text style={[styles.multiTextBody, styles.null]}>
                                                You have not added a meaning to this word yet...
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.rowBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="backspace" size={32} color={Colors.secondary}/>
                            <Text style={styles.text}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rowBtn} onPress={toggleDeletePopup}>
                            <Ionicons name="trash" size={32} color={Colors.deleteColor}/>
                            <Text style={styles.text}>Delete Word</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rowBtn} onPress={() => handleEditWord()}>
                            <Ionicons name="create" size={32} color={Colors.secondary}/>
                            <Text style={styles.text}>Edit</Text>
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

    // for buttons
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
    
    textLabel: {
        fontFamily: "inter-sm",
        color: Colors.textActive,
    },

    // for word as title
    wordLabelContainer: {
        backgroundColor: Colors.primary,
        width: screenWidth-48,
    },
    wordTextLabel: {
        color: Colors.textActive,
        fontFamily: "inter-sm",
        fontSize: 60,
    },
    
    // for short one line texts except the word
    // (pronunciation, language, plural, thematic group, part of speech)
    oneLineSectionContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 32,
        marginBottom: 20,
        marginHorizontal: 24,
        width: screenWidth-48,
    },
    oneLineLabelContainer: {
        width: 150,
        backgroundColor: Colors.secondary,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 4,
    },
    oneLineTextContainer: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    oneLineTextBody: {
        color: Colors.textActive,
        width: 150,
        fontSize: 16,
        fontFamily: "inter-el",
    },

    // for multi-line texts (etymology, meaning)
    multiLineSectionContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 12,
        marginBottom: 20,
        marginHorizontal: 24,
        width: screenWidth-48,
    },
    multiLineLabelContainer: {
        backgroundColor: Colors.secondary,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        width: screenWidth-48,
    },
    multiLineTextContainer: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderColor: Colors.tertiary,
        borderWidth: 2,
        borderStyle: "dashed",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    multiTextBody: {
        color: Colors.textActive,
        fontSize: 16,
        fontFamily: "inter-el",
    },

    // null text when there is no data for a line
    null: {
        fontFamily: "inter-eli",
    },
  
    // for scroll view
    formScrollView: {
        marginTop: Platform.OS === 'ios' ? 0 : 80,
    },
})