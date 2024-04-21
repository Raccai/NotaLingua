import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/build/Ionicons'

export default function ErrorScreen() {
    return (
        <View style={styles.view}>
          <View style={styles.container}>
            <Ionicons name="bug" size={32} color={Colors.secondary} />
            <Text style={styles.error}>Oops! There seems to be an error D:</Text>
          </View>
        </View>
      )
    }
    
    const styles = StyleSheet.create({
      view: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        height: "100%",
        minHeight: "100%",
      },
      container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 80,
      },
      error: {
        color: Colors.textActive,
        fontFamily: "inter-sm",
        fontSize: 16,
      } 
    })