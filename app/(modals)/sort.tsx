import { Dimensions, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Stack } from 'expo-router';
import MainHeader from '@/components/MainHeader';
import Ionicons from '@expo/vector-icons/build/Ionicons'
import thematicGroups from "@/database/thematicGroups";
import partsOfSpeech from "@/database/partsOfSpeech";
import { useToast } from '@/contexts/ToastContext';
import { useNavigation } from 'expo-router';
import Colors from '@/constants/Colors';
import Picker from 'react-native-picker-select';
import { useWords } from '@/contexts/WordsContext';

const screenWidth = Dimensions.get("window").width;

export default function Sort() {
    const [word, setWord] = useState<string>("");
    const [language, setLanguage] = useState<string>("");
    const [thematicGroup, setThematicGroup] = useState<string>("");
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const { showToast } = useToast();
    const navigation = useNavigation();
    const { sortWords, fetchWords } = useWords();

    const handleSort = async () => {
        try {
            await sortWords({
                word: word ? "asc" : undefined,
                language: language ? "asc" : undefined,
                thematicGroup: thematicGroup ? "asc" : undefined,
                partOfSpeech: partOfSpeech ? "asc" : undefined,
            });
            await fetchWords({
                word: word, 
                language: language, 
                thematicGroup: thematicGroup, 
                partOfSpeech: partOfSpeech
            });
            showToast("Successfully sorted word list!", "success");
        } catch (error) {
            showToast("Failed to sort word list.", "error");
        }
        navigation.goBack();
    }
    
    const handleUnsort = async () => {
        try {
            await sortWords({
                word: undefined,
                language: undefined,
                thematicGroup: undefined,
                partOfSpeech: undefined,
            });
            await fetchWords({
                word: word, 
                language: language, 
                thematicGroup: thematicGroup, 
                partOfSpeech: partOfSpeech
            });
            showToast("Successfully reset word list!", "success");
        } catch (error) {
            showToast("Failed to reset word list.", "error");
        }
        navigation.goBack();
    }
    
    
    return (
        <View style={styles.safeAreaView}>
            <Stack.Screen 
                options = {{
                    header: () => <MainHeader title={"Sort Words"} />
                }}
            />
            
            <View style={styles.mainContainer}>
                <View style={styles.subContainer}>
                    {/* For input fields and picker */}
                    <View>
                        <View style={styles.formLineContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.textLabel}>Word</Text>
                            </View>
                            <TextInput 
                                placeholder='Word'
                                style={styles.textInput}
                                value={word}
                                onChangeText={setWord}
                            />
                        </View>
                        <View style={styles.formLineContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.textLabel}>Language</Text>
                            </View>
                            <TextInput 
                                placeholder='Language'
                                style={styles.textInput}
                                value={language}
                                onChangeText={setLanguage}
                            />
                        </View>
                        <View style={styles.formLineContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.textLabel}>Part Of Speech</Text>
                            </View>
                            <View style={styles.pickerStyle}>
                                <Picker 
                                    style={{
                                        inputIOS:{
                                            height: 40,
                                            fontSize: 16,
                                            paddingHorizontal: 12,
                                            marginLeft: -20,
                                            marginRight: -20,
                                            marginTop: -8
                                        },
                                        inputAndroid:{
                                            height: 40,
                                            fontSize: 16,
                                            paddingHorizontal: 12,
                                            marginLeft: -20,
                                            marginRight: -20,
                                            marginTop: -8
                                        }
                                    }}
                                    placeholder={{label: "Select", value: null}}
                                    value={partOfSpeech}
                                    onValueChange={(itemValue) => setPartOfSpeech(itemValue)}
                                    items={partsOfSpeech.map((group) => ({label: group, value: group}))}
                                />
                            </View>
                        </View>
                        <View style={styles.formLineContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.textLabel}>Thematic Group</Text>
                            </View>
                            <View style={styles.pickerStyle}>
                                <Picker 
                                    style={{
                                        inputIOS:{
                                            height: 40,
                                            fontSize: 16,
                                            marginLeft: -20,
                                            marginRight: -20,
                                            marginTop: -8
                                        },
                                        inputAndroid:{
                                            height: 40,
                                            fontSize: 16,
                                            marginLeft: -20,
                                            marginRight: -20,
                                            marginTop: -8
                                        }
                                    }}
                                    placeholder={{label: "Select", value: null}}
                                    value={thematicGroup}
                                    onValueChange={(itemValue) => setThematicGroup(itemValue)}
                                    items={thematicGroups.map((group) => ({label: group, value: group}))}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="backspace" size={32} color={Colors.secondary}/>
                                <Text style={styles.text}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.backBtn} onPress={handleUnsort}>
                                <Ionicons name="refresh-circle" size={32} color={Colors.secondary}/>
                                <Text style={styles.text}>Unsort</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSort}>
                                <Ionicons name="funnel" size={32} color={Colors.secondary}/>
                                <Text style={styles.text}>Sort</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        backgroundColor: Colors.primary,
        marginTop: Platform.OS === 'ios' ? 0 : 90,
    },
    mainContainer: {
        justifyContent: "space-between",
        flexDirection: "column",
        alignItems: "center", 
        height: "100%", 
    },
    subContainer: {
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        backgroundColor: Colors.primary,
        width: screenWidth,
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
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 0,
        marginBottom: 12,
        marginHorizontal: 24,
        width: screenWidth,
    },
    labelContainer: {
        display: "flex",
        flexDirection: "row",
        width: 150,
        height: 40,
        borderRadius: 8,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: 4,
    },
    textLabel: {
        fontFamily: "inter-sm",
        color: Colors.textActive,
        fontSize: 16,
    },
    textInput: {
        backgroundColor: Colors.textActive,
        color: Colors.primary,
        height: 40,
        fontSize: 16,
        borderRadius: 8,
        paddingHorizontal: 24,
        width: screenWidth-48,
        fontFamily: "inter-el"
    },

    // for multi select
    pickerStyle: {
        backgroundColor: Colors.textActive,
        color: Colors.primary,
        height: 40,
        fontSize: 16,
        borderRadius: 8,
        paddingHorizontal: 24,
        width: screenWidth-48,
        fontFamily: "inter-el"
    },
})