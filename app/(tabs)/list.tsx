import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { Stack, useFocusEffect } from 'expo-router';
import MainHeader from '@/components/MainHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from "@/components/ErrorScreen";
import { useWords } from '@/contexts/WordsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { isLoaded } from 'expo-font';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
type RootStackParamList = {
  '(cards)/view': { idProp: number },
};
type ListWordsScreenNavigationProp = StackNavigationProp<RootStackParamList, '(cards)/view'>;

const ListWords = () => {
  const navigation = useNavigation<ListWordsScreenNavigationProp>();
  const { allWords, fetchWords, shouldRefetch, triggerLoading, resetLoading, isLoading} = useWords();
  
  useEffect(() => {
    triggerLoading();
    if (shouldRefetch) {
      fetchWords();
    }
    resetLoading();
  }, [shouldRefetch])

  const handleViewWord = (wordId: number) => {
    navigation.push('(cards)/view', { idProp: wordId });
  };

  const showWords = () => {
    if (allWords.length > 0) {
      return allWords.map((word, index) => {
        return(
          <LinearGradient colors={Colors.cardGradient} key={index} style={styles.cardContainer}>
            {/* Text portion of the card w/ the word and headers */}
            <View style={styles.wordContainer}>
              <View style={styles.wordHeaderContainer}>
                {word.language ? (
                  <Text style={styles.wordHeader}>{word.language}</Text>
                ) :(
                  <Text style={styles.wordHeader}>No Language</Text>
                )}
                <Text style={[styles.wordHeader, {paddingHorizontal: 8}]}>  
                  <Ionicons name="ellipse" size={4} color={Colors.textActive} />
                </Text>
                {word.partOfSpeech ? (
                  <Text style={styles.wordHeader}>{word.partOfSpeech}</Text>
                ) : (
                  <Text style={styles.wordHeader}>None</Text>
                )}      
              </View>
              <Text style={styles.word}>{word.word}</Text>
            </View>
  
            {/* Button for editing a word */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleViewWord(word.id)}
            >
              <Ionicons name="open" size={36} color={Colors.textActive} />
            </TouchableOpacity>
          </LinearGradient>        
        )
      });
    } 

    return (
      <View style={styles.emptyScreenContainer}>
        {isLoading ? (
          <LoadingScreen />
        ):(
          <View style={styles.dashedBorderContainer}>
            <Text style={styles.emptyScreenTxt}>No words just yet!</Text>
            <Text style={styles.emptyScreenTxt}>Click the </Text>
            <Ionicons name="add-circle" size={36} color={Colors.tertiary} />
            <Text style={styles.emptyScreenTxt}> below to add a new word</Text>
          </View>
        )}
      </View>
    )
  };

  return (
    <View style={{
      flex: 1,
    }}>
      <ScrollView style={styles.formScrollView}>
        <SafeAreaView style={styles.view}>

          <Stack.Screen 
            options = {{
              header: () => <MainHeader title={"Words"} />
            }}
            />

          <View>
            <View style={styles.container}>
              {showWords()}
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: Colors.primary,
    height: "100%",
    minHeight: "100%",
  },

  // for unsort button
  unsortButton: {
    position: 'absolute',
    bottom: 4,            
    right: 24,  
    zIndex: 1000,          
    backgroundColor: Colors.cardColor,
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },

  // for each word
  cardContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.cardColor,
    width: screenWidth-48,
    borderRadius: 8,
    paddingLeft: 8,
  },
  // for each word contianer in card
  wordContainer:{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: 12,
    paddingBottom: 4,
    gap: -8,
  },
  wordHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  wordHeader: {
    color: Colors.textActive,
    fontFamily: "inter-el",
  },
  word: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
    margin: 8,
    color: Colors.textActive,
    fontFamily: "inter-sm",
    fontSize: 24,
  },
  // for each button in card
  button: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    height: "100%",
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  
  // for each word container
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 16,
  },

  // for text on no word screen
  emptyScreenContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: screenHeight-200,
  },
  dashedBorderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.secondary,
    paddingVertical: 24,
    paddingHorizontal: 62,
  },
  emptyScreenTxt: {
    fontSize: 16,
    fontFamily: "inter-r",
    color: Colors.tertiary,
  },

  // For scroll view
  formScrollView: {
    backgroundColor: Colors.primary,
    marginTop: Platform.OS === 'ios' ? 0 : 60,
  },
})

export default ListWords;