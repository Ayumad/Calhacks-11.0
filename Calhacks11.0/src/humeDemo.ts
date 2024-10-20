import { HumeClient } from "hume";

// Initialize Hume client
const hume = new HumeClient({
  apiKey: "wbG2yyI5RqCkVGGNHxL831qA0roRygfIqRQwh3oACCKopPNW",
});

// Function to process the audio file and get predictions
export async function processAudio() {
  try {
    const job = await hume.expressionMeasurement.batch.startInferenceJob({
      models: {
        prosody: { granularity: "utterance" },
      },
      urls: ["https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"], // Path to your audio file
    });

    console.log("Inference job started...");

    // Await job completion and fetch predictions
    await job.awaitCompletion();
    const predictions = await hume.expressionMeasurement.batch.getJobPredictions(job.jobId);

    return predictions; // Return predictions
  } catch (error) {
    console.error("Error during processing:", error);
    return null; // Return null in case of error
  }
}

export async function getTranscription() {
  try {
    const job = await hume.expressionMeasurement.batch.startInferenceJob({
      urls: ["https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"],
      transcription: {
        language: "en",
      },
      models: {
        prosody: { granularity: "word" },
      }
    });

    await job.awaitCompletion();
    const transcription = await hume.expressionMeasurement.batch.getJobPredictions(job.jobId);
    return transcription;
  } catch (error) {
    console.error("Error during transcription:", error);
    return null;
  }
}
