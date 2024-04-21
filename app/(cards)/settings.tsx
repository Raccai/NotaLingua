import { ScrollView, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Colors from '@/constants/Colors'
import MainHeader from '@/components/MainHeader'
import { Stack } from 'expo-router'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { useNavigation } from '@react-navigation/native';
import DeleteButton from '@/components/DeleteButton'
import Picker from 'react-native-picker-select';
import { useExportType } from '@/contexts/ExportTypeContext'

const screenWidth = Dimensions.get('window').width;
const exportTypes = ["CSV", "DB"];

export default function settings() {
  const { currentExportType, setCurrentExportType } = useExportType();
  const navigation = useNavigation();
  
  return (
    <View style={styles.view}>
      <Stack.Screen 
        options={{
          header: () => <MainHeader title={"Settings"} />
        }}
      />

      <View style={styles.container}>
        {/* Add content here */}
        <View>
          {/* Export type section */}
          <View style={styles.section}>
            <View style={styles.textContainer}>
              <Text style={[
                styles.text,
                styles.textHeader,
              ]}>
                Export Type
              </Text>
              <Text style={[styles.text, {color: Colors.textActive, fontSize: 16}]}>
                Select the export type for the database:
              </Text>
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
                value={currentExportType}
                onValueChange={(itemValue) => setCurrentExportType(itemValue)}
                items={exportTypes.map((part) => ({label: part, value: part}))}
              />
            </View>
          </View>
          
          {/* Delete buttons section */}
          <View style={styles.section}>
            <View style={styles.deleteBtn}>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.text,
                  styles.textHeader,
                ]}>
                  Delete Words
                </Text>
                <Text style={[styles.text, {color: Colors.textActive, fontSize: 16}]}>
                  Delete selected words or all words from the database:
                </Text>
              </View>
              <DeleteButton 
                btnType="primary" 
                deleteAll={false}
                btnText="Delete Multiple Words"
              />
              <DeleteButton 
                btnType="secondary" 
                deleteAll={true}
                btnText="Delete All Words"
              />
            </View>
          </View>
        </View>

        {/* Thank you section */}
        <View style={[
          styles.section,
          {
            backgroundColor: Colors.secondary,
            paddingVertical: 28,
            borderRadius: 8,
          }
        ]}>
          <View style={styles.textContainer}>
            <Text style={[
              styles.text,
              styles.textHeader,
            ]}>
              Thank you!
            </Text>
            <Text style={[
              styles.text, 
              {
                color: Colors.textActive, 
                fontSize: 16,
              }
            ]}>
              This is a work in progress. 
              I enjoyed working on this so any 
              feedback for improving NotaLingua is greatly appreciated!
            </Text>
          </View>
        </View>
      </View>
      
      {/* Bottom container for buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.rowBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="backspace" size={32} color={Colors.secondary}/>
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: Colors.primary,
    marginTop: Platform.OS === 'ios' ? 0 : 90,
    flex: 1,
  },

  // for content (not bottom nav)
  container: {
    flex: 1,
  },
  deleteBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },

  // for nav buttons
  buttonContainer: {
    backgroundColor: Colors.primary,
    paddingBottom: 8,
    paddingHorizontal: 40,
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
    lineHeight: 28,
  },

  // for sections like export selection, etc.
  section: {
    display: "flex", 
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 40,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 8,
    marginLeft: 24,
    width: screenWidth-48,
  },
  textHeader: {
    color: Colors.textActive, 
    fontFamily: "inter-sm",
    fontSize: 28,
  },
  pickerStyle: {
    backgroundColor: Colors.textActive,
    color: Colors.primary,
    height: 40,
    width: 160,
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 24,
    marginHorizontal: 24,
    fontFamily: "inter-el"
  },
});