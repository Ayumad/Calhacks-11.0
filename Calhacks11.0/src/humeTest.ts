import { processAudio, getTranscription } from './humeDemo'; // Assuming your service is in humeService.ts

interface Emotion {
  name: string;
  score: number;
}

interface Prediction {
  text: string;
  emotions: Emotion[];
}

// Function to process raw predictions and get top emotions
function getTopEmotions(rawData: any): Emotion[] {
  // Extract all predictions
  const allPredictions = rawData[0].results.predictions[0].models.prosody
    .groupedPredictions[0].predictions;

  // Combine all emotions and aggregate their scores
  const emotionMap = new Map<string, number>();

  allPredictions.forEach((prediction: Prediction) => {
    prediction.emotions.forEach((emotion) => {
      const currentScore = emotionMap.get(emotion.name) || 0;
      emotionMap.set(emotion.name, currentScore + emotion.score);
    });
  });

  // Convert map to array and sort by score
  const sortedEmotions = Array.from(emotionMap.entries())
    .map(([name, score]) => ({
      name,
      score: score / allPredictions.length // Calculate average score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return sortedEmotions;
}

// Main function to test audio processing and extract meaningful output
async function testProcessAudio() {
  console.log("Starting audio processing test...");

  const predictions = await processAudio(); // Call the function to get predictions

  if (predictions) {
    console.log("Predictions received:");

    // Process the predictions to get top emotions
    const topEmotions = getTopEmotions(predictions);

    // Log the top emotions in a more readable format
    console.log('Top 10 Emotions:');
    topEmotions.forEach((emotion, index) => {
      console.log(`${index + 1}. ${emotion.name}: ${(emotion.score * 100).toFixed(2)}%`);
    });
  } else {
    console.log("No predictions were made.");
  }
}

async function testTranscription() {
  console.log("Starting transcription test...");

  // Call getTranscription function
  const transcription = await getTranscription();

  if (transcription) {
    console.log("Transcription received:");
    console.log(transcription[0].results?.predictions[0].models.prosody?.groupedPredictions); // Output the transcription data directly or format it
  } else {
    console.log("No transcription was received.");
  }
}

testProcessAudio(); // Run the test
testTranscription(); // Run the transcription test

