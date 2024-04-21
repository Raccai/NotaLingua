import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, StatusBar, Platform } from 'react-native'
import React, { useRef, useState } from 'react'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import Colors from '@/constants/Colors'
import { useNavigation } from '@react-navigation/native';
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useToast } from '@/contexts/ToastContext';
import { useExportType } from '@/contexts/ExportTypeContext';
import { useWords } from '@/contexts/WordsContext';
import db from '@/database/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function MainHeader({ title }:{title: string}) {
  const { currentExportType } = useExportType();
  const showToast = useToast();
  const navigation = useNavigation<any>();
  const { isSorted } = useWords();
  const color = isSorted === true ? Colors.editColor : Colors.secondary;

  const handleExport = async ({ showToast }: { showToast: (message: string, type: string) => void }) => {
    if (Platform.OS === "android") {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const dbPath = FileSystem.documentDirectory + 'SQLite/words.db';
        let exportFileName;
        let mimeType;
        let fileContent: any;
  
        switch(currentExportType) {
          case "CSV":
            fileContent = await convertDatabaseToCSV(dbPath);
            exportFileName = "words.csv";
            mimeType = "text/csv";
            break;
          case "DB":
          default:
            // Read the file directly as binary data without encoding
            fileContent = await FileSystem.readAsStringAsync(dbPath, { encoding: FileSystem.EncodingType.UTF8 });
            exportFileName = "words.db";
            mimeType = "application/vnd.sqlite3";
            break;
        }
  
        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, exportFileName, mimeType)
          .then(async (uri) => {
            // Write the file directly as binary data without encoding
            await FileSystem.writeAsStringAsync(uri, fileContent, { encoding: FileSystem.EncodingType.UTF8 });
            showToast("Successfully exported database!", "success");
          })
          .catch((e) => {
            console.log(e);
            showToast("Failed to export file.", "fail");
          });
      } else {
        showToast("Permission not granted.", "fail");
      }
    } else {
      // For non-Android platforms, share the database file
      const dbPath = FileSystem.documentDirectory + 'SQLite/words.db';
      await Sharing.shareAsync(dbPath);
    }
  }  
  
  // The CSV conversion function
  function arrayToCSV(objArray: any) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}` + '\r\n';

    return array.reduce((str: string, next: { [s: string]: unknown; } | ArrayLike<unknown>) => {
        str += `${Object.values(next).map(value => `"${value}"`).join(",")}` + '\r\n';
        return str;
    }, str);
  }

  async function convertDatabaseToCSV(dbPath: string) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
              "SELECT * FROM words",
              [],
              (_, result) => {
                  const rows = [];
                  for (let i = 0; i < result.rows.length; i++) {
                      rows.push(result.rows.item(i));
                  }
                  try {
                      const csvString = arrayToCSV(rows);
                      resolve(csvString);
                  } catch (error) {
                      reject("Error parsing CSV: " + error);
                  }
              },
              (_, error) => {
                  reject("SQL Error: " + error);
                  return true;
              }
          );
      });
    });
  }

  const handleSortModal = () => {
    navigation.navigate("(modals)/sort");
  }
  
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary, paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight}}>
        <View style={styles.container}>
          <View style={styles.actionRow}>
            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/Logo.png")} style={styles.logo}/>
              <Text style={{ color: Colors.textActive, fontFamily: "inter-sm", fontSize: 24}}>{title}</Text>
            </View>
            <View style={styles.iconsContainer}>
              {title === "Words" &&
                <TouchableOpacity 
                  style={styles.settingsBtn}
                  onPress={handleSortModal}
                >
                  <Ionicons name="funnel" size={32} color={color}/>
                </TouchableOpacity>
              }
              {(title === "Data" || title === "Words") &&
                <TouchableOpacity
                  style={styles.settingsBtn}
                  onPress={() => handleExport(showToast)}
                >
                  <Ionicons name="download" size={32} color={Colors.secondary} />
                </TouchableOpacity>
              }
              {(title !== "Delete Multiple" && title !== "Settings") && 
                <TouchableOpacity 
                  style={styles.settingsBtn}
                  onPress={() => navigation.navigate("(cards)/settings")}
                >
                  <Ionicons name="settings" size={32} color={Colors.secondary}/>
                </TouchableOpacity>
              }
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors.primary,
      height: 90
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.primary,
      gap: 14
    },
    settingsBtn: {
      padding: 10,
    },
    logo: {
      width: 44,
      height: 44,
    },
    iconsContainer: {
      display: "flex",
      flexDirection: "row",
      gap: -4,
    }
})