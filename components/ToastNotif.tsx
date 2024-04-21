import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/build/Ionicons';
import Colors from '@/constants/Colors';

const screenWidth = Dimensions.get('window').width;

export default function ToastNotif({message, type}: {message: string, type: string}) {
  const icon = type === "success" ? "checkmark-circle" : "alert-circle";
  const backgroundColor = type === "success" ? Colors.successColor : Colors.deleteColor
  const text = type === "success" ? "Success!" : "Error";

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={
        [
          styles.toast,
          {backgroundColor}
        ]
      }
    >
      <Ionicons name={icon} size={40} color={Colors.textActive}/>
      <View>
        <Text style={[styles.text, styles.headerText]}>{text}</Text>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toast: {
    width: screenWidth - 48,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  text: {
    color: Colors.textActive,
    fontFamily: "inter-r",
    marginLeft: 16,
    fontSize: 12,
  },
  headerText: {
    fontFamily: "inter-sm",
    fontSize: 16,
  }
})