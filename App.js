import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Button } from "react-native-elements";

// navigate between screens
const Stack = createNativeStackNavigator();

// questions
const sampleData = [
  {
    prompt: "What’s the only flying mammal?",
    type: "multiple-choice",
    choices: ["Eagle", "Bat", "Flying Squirrel", "Penguin"],
    correct: 1,
  },
  {
    prompt: "What are IKEA’s colors?",
    type: "multiple-answer",
    choices: ["Red", "Blue", "Yellow", "Green"],
    correct: [1, 2],
  },
  {
    prompt: "Is 2 + 2 = 4?",
    type: "true-false",
    choices: ["True", "False"],
    correct: 0,
  },
];

// export Question component
export const Question = ({ route, navigation }) => {
  const { data, index, answers } = route.params; //extract
  const question = data[index]; // current
  const [selectedIndexes, setSelectedIndexes] = useState([]); //selected answers

  const isMultipleAnswer = question.type === "multiple-answer"; // multiple answers or no

  //multiple or single
  function handleSelect(choiceIndex) {
    if (isMultipleAnswer) {
      if (selectedIndexes.includes(choiceIndex)) {
        setSelectedIndexes(selectedIndexes.filter((i) => i !== choiceIndex)); //deselection
      } else {
        setSelectedIndexes([...selectedIndexes, choiceIndex]); //select
      }
    } else {
      setSelectedIndexes([choiceIndex]); //single, only one choice
    }
  }

  //moving to the next screen
  function handleNext() {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = selectedIndexes; //stores answers

    //if there are more questions go to the question but if not go to summary
    if (index + 1 < data.length) {
      navigation.push("Question", {
        data: data,
        index: index + 1,
        answers: updatedAnswers,
      });
    } else {
      navigation.replace("Summary", {
        data: data,
        answers: updatedAnswers,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>{" "}
      {/* current question */}
      <View testID="choices">
        {question.choices.map((choice, i) => {
          const isSelected = selectedIndexes.includes(i); // is the current choice selected
          return (
            <Button
              key={i} //choice key
              title={choice} //button label
              type={isSelected ? "solid" : "outline"} //highlights
              onPress={() => handleSelect(i)} //when button is pressed
              buttonStyle={{ marginBottom: 8 }}
            />
          );
        })}
      </View>
      <Button
        title={index + 1 === data.length ? "Finish Quiz" : "Next Question"} //is it the last question?
        onPress={handleNext} //next button
        testID="next-question"
        buttonStyle={{ marginTop: 20 }}
      />
    </View>
  );
};

//Summary
export const Summary = ({ route }) => {
  const { data, answers } = route.params; //extract

  let totalScore = 0; //init

  //is the answer right
  function isAnswerCorrect(correctAnswer, userSelected) {
    if (Array.isArray(correctAnswer)) {
      // if multiple selection are they all right?
      if (correctAnswer.length !== userSelected.length) return false;
      for (let value of correctAnswer) {
        if (!userSelected.includes(value)) return false;
      } //all answers are correct
      return true; //answers correct
    } else {
      return userSelected[0] === correctAnswer;
    } // check if selected is there
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.map((question, index) => {
        const userSelected = answers[index] || []; //gets users selected answers
        const correctAnswer = question.correct; //correct answer
        const gotItRight = isAnswerCorrect(correctAnswer, userSelected); //checks

        if (gotItRight) {
          totalScore += 1; // +1 if right
        }

        return (
          <View key={index} style={styles.summaryBlock}>
            <Text style={styles.prompt}>{question.prompt}</Text>{" "}
            {/* question */}
            {question.choices.map((choice, i) => {
              const isSelected = userSelected.includes(i); //was it selected by the user
              const isCorrectChoice = Array.isArray(correctAnswer)
                ? correctAnswer.includes(i) //checks for multiple
                : i === correctAnswer;

              let style = {}; //styles
              if (isSelected && isCorrectChoice) {
                style = styles.correctAnswer; //correct & selected
              } else if (isSelected && !isCorrectChoice) {
                style = styles.incorrectAnswer; //not correct & selected
              } else if (!isSelected && isCorrectChoice) {
                style = styles.correctAnswer; //correct & not selected
              }

              return (
                <Text key={i} style={[styles.choice, style]}>
                  {choice} {/* displays */}
                </Text>
              );
            })}
            <Text
              style={gotItRight ? styles.correctText : styles.incorrectText}
            >
              {gotItRight ? "Correct" : "Incorrect"}
            </Text>
          </View>
        );
      })}

      <Text testID="total" style={styles.score}>
        Total Score: {totalScore}/{data.length}
      </Text>
    </ScrollView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ data: sampleData, index: 0, answers: [] }}
        />
        <Stack.Screen name="Summary" component={Summary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  prompt: {
    fontSize: 18,
    marginBottom: 12,
  },
  choice: {
    fontSize: 16,
    marginVertical: 2,
  },
  summaryBlock: {
    marginBottom: 24,
  },
  correctText: {
    color: "green",
    fontWeight: "bold",
  },
  incorrectText: {
    color: "red",
    fontWeight: "bold",
  },
  correctAnswer: {
    fontWeight: "bold",
  },
  incorrectAnswer: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    alignSelf: "center",
  },
});
