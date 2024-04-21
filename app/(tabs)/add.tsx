import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import { Stack } from 'expo-router'
import MainHeader from '@/components/MainHeader'

const Add = () => {
  return (
    <View style={styles.view}>
      <Stack.Screen 
        options = {{
          header: () => <MainHeader title={"Add"} />
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: Colors.primary,
    height: "100%",
    minHeight: "100%"
  },
  links: {
    color: Colors.textActive
  }
})

export default Add;