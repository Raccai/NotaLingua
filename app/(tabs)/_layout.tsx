import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const Layout = () => {
  return (
    <Tabs
      detachInactiveScreens
      screenOptions={{
        tabBarActiveTintColor: Colors.tertiary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          height: 88,
          borderTopColor: "transparent",
          gap: 8,
          paddingTop: 16
        },
        tabBarLabelStyle: {
          fontFamily: "inter-r",
          paddingTop: -7,
          paddingBottom: 8,
          fontSize: 16
        },
      }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          tabBarLabel: "Data",
          tabBarIcon: ({color}) => 
            <MaterialCommunityIcons name="chart-areaspline-variant" size={32} color={color} />
        }}
      />
      <Tabs.Screen 
        name="add"
        options={{
          tabBarLabel: "Add",
          tabBarIcon: ({color}) => 
            <MaterialCommunityIcons name="plus-circle" size={32} color={color} />
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("(cards)/add");
          },
        })}
      />
      <Tabs.Screen 
        name="list"
        options={{
          tabBarLabel: "List",
          tabBarIcon: ({color}) => 
            <MaterialCommunityIcons name="clipboard-list" size={32} color={color} />
        }}
      />
    </Tabs>
  );
};

export default Layout;
