import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import MainHeader from '@/components/MainHeader'
import Colors from '@/constants/Colors'
import Checkbox from 'expo-checkbox'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { useNavigation } from 'expo-router'
import { useToast } from '@/contexts/ToastContext'
import { useWords } from '@/contexts/WordsContext'
import Popup from '@/components/Popup'

const screenWidth = Dimensions.get("window").width;

export default function DeleteMultiple () {
    const [selectedIDs, setSelectedIDs] = useState<number[]>();
    const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false);
    const navigation = useNavigation();
    const { showToast } = useToast();
    const { triggerRefetch, deleteMultipleWords, fetchWordsForDelete, allWords } = useWords();

    useEffect(() => {
        fetchWordsForDelete();
    }, [])

    const handleCheckbox = (id: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedIDs(prevSelectedIDs => [...(prevSelectedIDs || []), id]);
        } else {
            setSelectedIDs(prevSelectedIDs => prevSelectedIDs?.filter(wordID => wordID !== id));
        }
    }

    const deleteWords = () => {
        deleteMultipleWords(selectedIDs);
        triggerRefetch();
        showToast("Deleted select words from database.", "success");
        navigation.goBack();
    }

    const toggleDeletePopup = () => {
        setDeletePopupVisible(!deletePopupVisible);
    }

    return (
        <View style={styles.view}>
            <Popup
                visible={deletePopupVisible}
                onPrimary={toggleDeletePopup}
                onSecondary={deleteWords}
                header="Delete Words?"
                body="Are you sure you want to delete the selected words?"
                primary="Nope"
                secondary="Delete Words"
                primaryColor={Colors.tertiary}
                secondaryColor={Colors.deleteColor}
            />
            <Stack.Screen 
                options = {{
                    header: () => <MainHeader title={"Delete Multiple"} />
            }}
            />

            {/* For the words */}
            <ScrollView>
                <View style={styles.container}>
                    {allWords.map((word, index) => {
                        return (
                            <View key={index} style={styles.cardContainer}>
                                <View style={styles.wordContainer}>
                                    <View style={styles.wordHeaderContainer}>
                                        {word.language ? (
                                            <Text style={styles.wordHeader}>{word.language}</Text>
                                        ) :(
                                            <Text style={styles.wordHeader}>No Language</Text>
                                        )}
                                            <Text style={styles.wordHeader}>  |  </Text>
                                        {word.partOfSpeech ? (
                                            <Text style={styles.wordHeader}>{word.partOfSpeech}</Text>
                                        ) : (
                                            <Text style={styles.wordHeader}>None</Text>
                                        )}      
                                    </View>
                                    <Text style={styles.wordLabel}>{word.word}</Text>
                                </View>
                                <View>
                                    <Checkbox 
                                        value={selectedIDs?.includes(word.id)}
                                        onValueChange={() => handleCheckbox(word.id, !selectedIDs?.includes(word.id))} 
                                        style={styles.checkbox}
                                        color={Colors.successColor}
                                    />
                                </View>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="backspace" size={32} color={Colors.secondary}/>
                        <Text style={styles.text}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={toggleDeletePopup}>
                        <Ionicons name="trash" size={32} color={Colors.deleteColor}/>
                        <Text style={styles.text}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: Colors.primary,
        height: "100%",
        minHeight: "100%",
    },
    container: {
        marginTop: Platform.OS === 'ios' ? 0 : 90,
        marginLeft: 24,
        width: screenWidth-48,
        gap: 16,
    },

    // for everything in each card
    cardContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.cardColor,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    // word group in each card
    wordHeaderContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    wordHeader: {
        color: Colors.textActive,
        fontFamily: "inter-el",
    },
    wordLabel: {
        color: Colors.textActive,
        fontFamily: "inter-sm",
        fontSize: 24,
    },
    wordContainer: {
        // dunno what to add here 
    },
    // checkbox in each card
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        padding: 12,
    },

    // for buttons in button nav at bottom of screen
    buttonContainer: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    backBtn: {
        padding: 12,
        alignItems: "center",
    },
    deleteBtn: {
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
})