import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useFocusEffect } from "expo-router";
import Colors from '@/constants/Colors';
import MainHeader from '@/components/MainHeader';
import db from "@/database/database"
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Circle, useFont } from '@shopify/react-native-skia';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { useToast } from '@/contexts/ToastContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useWords } from '@/contexts/WordsContext';

Animated.addWhitelistedNativeProps({text: true});
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type ChartData = {
  wordCount: number,
  dateAdded: string | number;
}

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return (
    <Circle cx={x} cy={y} r={8} color={Colors.editColor} />
  )
}

const Index = () => {
  const { state, isActive } = useChartPressState({ x: "", y: { wordCount: 0 } });
  const [totalToday, setTotalToday] = useState(0);
  const [totalThisYear, setTotalThisYear] = useState(0);
  const [totalLastWeek, setTotalLastWeek] = useState(0);
  const [totalLastMonth, setTotalLastMonth] = useState(0);
  const [isError, setIsError] = useState(false);
  const [newTableData, setNewTableData] = useState<ChartData[]>([]);
  const inter = require("@/assets/fonts/Inter-Regular.ttf");
  const font = useFont(inter, 12);
  const currentYear = new Date().getFullYear();
  const { showToast } = useToast();
  const { isLoading, triggerLoading, resetLoading } = useWords();

  useFocusEffect(
    React.useCallback(() => {
      fetchTableData();
      getTotalToday();
      getTotalLastWeek();
      getTotalLastMonth();
      getTotalThisYear();
    }, [])
  );

  useEffect(() => {
    fetchTableData(); // Fetch data when component mounts
  }, []);

  const fetchTableData = () => {
    const endDate = new Date(); // Today
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // One week ago
    const newData: { dateAdded: string; wordCount: number }[] = [];
  
    db.transaction(tx => {
      tx.executeSql(
        `
        SELECT DATE(dateAdded) AS date, COUNT(*) as wordCount
        FROM (
          SELECT dateAdded FROM words
          UNION ALL
          SELECT dateAdded FROM words_archive
        )
        WHERE dateAdded >= ? AND dateAdded <= ?
        GROUP BY date
        `,
        [startDate.toISOString(), endDate.toISOString()],
        (tx, { rows }) => {
          const dateCountsMap = new Map(); // Store word counts for each date
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
            dateCountsMap.set(formattedDate, 0);
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
          }
  
          // Populate word counts for existing dates
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            const date = new Date(row.date); // Parse the date
            if (!isNaN(date.getTime())) { // Check if the date is valid
              const formattedDate = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
              dateCountsMap.set(formattedDate, row.wordCount);
            }
          }
  
          // Convert map to array of objects
          dateCountsMap.forEach((wordCount, dateAdded) => {
            newData.push({ dateAdded, wordCount });
          });
  
          setNewTableData(newData);
          setIsError(false);
          resetLoading();
        },
        (tx, error) => {
          console.log('Error fetching data:', error);
          showToast("Could not fetch words from database.", "fail")
          resetLoading();
          setIsError(true);
          return true;
        }
      );
    });
  };  

  const getTotalToday = () => {
    const today = new Date();
    const todayString = today.toISOString();

    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as totalRows 
        FROM (
          SELECT dateAdded FROM words
          UNION ALL
          SELECT dateAdded FROM words_archive
        ) 
        WHERE DATE(dateAdded) = DATE(?)`,
        [todayString],
        (tx, { rows }) => {
          const totalRows = rows.item(0).totalRows;
          setTotalToday(totalRows);
          console.log("Successfully obtained total words added today!");
        }, (tx, error) => {
          console.log("Could not get total words added today: ", error);
          showToast("Could not fetch total words added today.", "fail");
          return true;
        }
      )
    })
  }

  const getTotalLastWeek = () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    const diffToMonday = (endDate.getDay() - 1 + 7) % 7;
    endDate.setDate(endDate.getDate() - diffToMonday);
    startDate.setDate(startDate.getDate() - 6);

    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as totalRows
        FROM (
          SELECT dateAdded FROM words
          UNION ALL 
          SELECT dateAdded FROM words_archive
        ) 
        WHERE dateAdded >= ? AND dateAdded <= ?
        `,
        [startDate.toISOString(), endDate.toISOString()],
        (tx, { rows }) => {
          const totalRows = rows.item(0).totalRows;
          setTotalLastWeek(totalRows);
          console.log("Successfully obtained words from past week!");
        }, (tx, error) => {
          console.log("Could not get words from past week: ", error);
          showToast("Could not fetch total words added last week.", "fail");
          return true
        }
      )
    })
  }

  const getTotalLastMonth = () => {
    const currentDate = new Date();
    const prevMonthDate = new Date(currentDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const startDate = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, '0')}-01`;
    const endDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-01`;

    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as totalRows
        FROM (
          SELECT dateAdded FROM words
          UNION ALL 
          SELECT dateAdded FROM words_archive
        )  
        WHERE dateAdded >= ? AND dateAdded < ?`,
        [startDate, endDate],
        (tx, { rows }) => {
          const totalRows = rows.item(0).totalRows;
          setTotalLastMonth(totalRows);
          console.log("Successfully obtained words for previous month!");
        }, (tx, error) => {
          console.log("Could not fetch words for previous month: ", error);
          showToast("Could not fetch total words added last month.", "fail");
          return true
        }
      )
    })
  }

  const getTotalThisYear = () => {
    const startDate = `${currentYear}-01-01`; 
    const endDate = `${currentYear + 1}-01-01`;
    
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as totalRows
        FROM (
          SELECT dateAdded FROM words
          UNION ALL 
          SELECT dateAdded FROM words_archive
        )  
        WHERE dateAdded >= ? AND dateAdded < ?`, 
        [startDate, endDate],
        (tx, { rows }) =>  {
          const totalRows = rows.item(0).totalRows;
          setTotalThisYear(totalRows);
          console.log("Fetched words for the year!");
        },
        (tx, error) => {
          console.log("Could not fetch Words for the year:", error);
          showToast("Could not fetch total words added last year.", "fail");
          return true;
        }
      );
    });
  }

  const animatedDateText = useAnimatedProps(() => {
    const [month, day] = state.x.value.value.split("/").map(Number);
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, month-1, day);
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    return {
      text: formattedDate,
      defaultValue: "xxx",
    }
  })

  const animatedWordCountText = useAnimatedProps(() => {
    return {
      text: `${state.y.wordCount.value.value} words added`,
      defaultValue: "xxx words added",
    }
  })

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScrollView style={styles.mainView}>
        {/* for MainHeader */}
        <Stack.Screen 
          options = {{
            header: () => <MainHeader title={"Data"} />
          }}
        />

        {isError ? (
          <ErrorScreen />
        ) : (
          // {/* for the main content */}
          <View style={styles.contentContainer}>
            {/* For the chart */}
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <View style={{ height: 280 }}>
                {!isActive && (
                  <View style={[styles.cardContainer, styles.cardContainerTwo]}>
                    <Text style={styles.cardHeaderTxt}>Today</Text>
                    <Text style={styles.cardMainTxt}>{totalToday} words added</Text>
                  </View>
                )}
                {isActive && (
                  <View style={[styles.cardContainer, styles.cardContainerTwo]}>
                    <AnimatedTextInput 
                      editable={false}
                      underlineColorAndroid={"transparent"}
                      style={styles.cardHeaderTxt}
                      animatedProps={animatedDateText}
                    />
                    <AnimatedTextInput 
                      editable={false}
                      underlineColorAndroid={"transparent"}
                      style={styles.cardMainTxt}
                      animatedProps={animatedWordCountText}
                    />
                  </View>
                )}
                <CartesianChart
                  data={newTableData}
                  xKey="dateAdded"
                  yKeys={["wordCount"]}
                  axisOptions={{ 
                    font, 
                    labelColor: Colors.textActive,
                    lineColor: Colors.secondary,
                    labelOffset: 12
                  }}
                  chartPressState={state}
                >
                  {({ points }) => (
                    <>
                      <Line 
                        points={points.wordCount} 
                        color={Colors.tertiary} 
                        strokeWidth={3} 
                        animate={{ type: "timing", duration: 300 }}
                      />
                      {isActive && (
                        <ToolTip x={state.x.position} y={state.y.wordCount.position} />
                      )}
                    </>
                  )}
                </CartesianChart>
              </View>
            )}

            {/* For the data words this year, previous month */}
            <View style={styles.dataContainer}>
              {/* For the past week */}
              <LinearGradient colors={Colors.cardGradient} style={styles.cardContainer}>
                <Text style={styles.cardHeaderTxt}>Added last week</Text>
                <Text style={styles.cardMainTxt}>{totalLastWeek} words</Text>
              </LinearGradient>
              {/* For the year */}
              <LinearGradient colors={Colors.cardGradient} style={styles.cardContainer}>
                <Text style={styles.cardHeaderTxt}>Added last month</Text>
                <Text style={styles.cardMainTxt}>{totalLastMonth} words</Text>
              </LinearGradient>
              {/* For the prev month */}
              <LinearGradient colors={Colors.cardGradient} style={styles.cardContainer}>
                <Text style={styles.cardHeaderTxt}>Added in {currentYear}</Text>
                <Text style={styles.cardMainTxt}>{totalThisYear} words</Text>
              </LinearGradient>
            </View>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: Colors.primary,
    height: "100%",
    minHeight: "100%"
  },

  contentContainer: {
    marginTop: Platform.OS === 'ios' ? 0 : 90,
    paddingHorizontal: 24,
    color: Colors.textActive,
    fontFamily: "inter-r",
    gap: 24,
  },

  dataContainer: {
    gap: 16,
  },
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    height: 84,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: -4,
  },
  cardContainerTwo: {
    backgroundColor: Colors.primary,
    paddingTop: -16,
  },
  cardHeaderTxt: {  
    color: Colors.textActive,
    fontSize: 16,
    fontFamily: "inter-el",
  },
  cardMainTxt: {
    color: Colors.textActive,
    fontSize: 28,
    fontFamily: "inter-sm",
  }
})

export default Index;