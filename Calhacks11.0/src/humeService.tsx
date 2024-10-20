import { HumeClient } from "hume";

// Initialize Hume client
const hume = new HumeClient({
  apiKey: "wbG2yyI5RqCkVGGNHxL831qA0roRygfIqRQwh3oACCKopPNW",
});

// Function to process the audio file and get predictions
export async function processAudio(audioUrl: string) {
  try {
    const job = await hume.expressionMeasurement.batch.startInferenceJob({
      models: {
        prosody: { granularity: "utterance" },
      },
      urls: [audioUrl], // Path to your audio file
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

export async function getTranscription(audioUrl: string) {
  try {
    const job = await hume.expressionMeasurement.batch.startInferenceJob({
      urls: [audioUrl],
      transcription: {
        
      },
    });

    await job.awaitCompletion();
    const transcription = await hume.expressionMeasurement.batch.getJobPredictions(job.jobId);
    return transcription;
  } catch (error) {
    console.error("Error during transcription:", error);
    return null;
  }
}
