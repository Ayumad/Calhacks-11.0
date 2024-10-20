import { useState, useRef } from 'react';
import './App.css';
import { processAudio } from './humeService'; // Import the processAudio function
import { storage } from './firebase'; // Import the storage object from firebase
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Emotion {
  name: string;
  score: number;
}

interface Prediction {
  text: string;
  emotions: Emotion[];
}

function App() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [feedback, setFeedback] = useState(''); // New state for feedback
  const [topEmotions, setTopEmotions] = useState<Emotion[]>([]); // State for top emotions
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const clearInput = () => {
    setInputText('');
    setSubmittedText('');
    setFeedback(''); // Clear feedback when input is cleared
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSubmittedText(inputText);
      // Provide feedback based on the submitted text
      setFeedback(`Great job! Your speech is ${inputText.length} characters long.`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);
    // Clear the submitted text and feedback if the input is empty
    if (newValue.trim() === '') {
      setSubmittedText('');
      setFeedback('');
    }
  };

  // Function to process raw predictions and get top emotions
  const getTopEmotions = (rawData: any): Emotion[] => {
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
  };

  // Function to start recording
  const startRecording = async () => {
    setAudioURL('');
    audioChunksRef.current = [];
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);

      // Upload audio and get the audio URL
      const audioFileUrl = await uploadAudio(audioBlob);
      // Call the function to process the audio file
      await fetchPredictions(audioFileUrl);
    };

    mediaRecorderRef.current.start();
  };

  // Function to stop recording
  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string> => {
    const audioFile = new File([audioBlob], "audio.wav", { type: 'audio/wav' });
    const audioRef = ref(storage, `audio/${audioFile.name}`);

    // Upload the audio file
    await uploadBytes(audioRef, audioFile);

    // Get the public URL for the uploaded audio file
    const audioUrl = await getDownloadURL(audioRef);
    console.log('Audio URL:', audioUrl);
    return audioUrl; // Return the audio URL
  }; 

  const fetchPredictions = async (audioUrl: string) => {
    setLoading(true);
    try {
      const predictions = await processAudio(audioUrl); // Pass the audio URL

      if (predictions) {
        // Process the predictions to get top emotions
        const emotions = getTopEmotions(predictions);
        setTopEmotions(emotions); // Store top emotions
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false); // Ensure loading is set to false after fetching
    }
  };

  return (
    <>
      <div className="header">
        <h1>SpeechSageAI 🪄</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input 
              type="text" 
              value={inputText} 
              onChange={handleInputChange}
              placeholder="Use voice input or copy and paste your speech into the text box." 
            />
            <button type="button" onClick={clearInput} className="clear-button">
              Clear
            </button>
            <button onClick={startRecording} disabled={isRecording}>
              Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
          </div>
          <div>
            {/* Audio Player to Test Recorded Audio URL */}
            {audioURL && (
              <div>
                <h3>Recorded Audio:</h3>
                <audio controls src={audioURL}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
          <button type="submit" style={{ display: 'none' }}>Submit</button>
        </form>
        <p>
          Unlock your communication skills to the next level.
        </p>
        {submittedText && (
          <div className="output-container">
            <h2>Your Improved Speech:</h2>
            <p>{submittedText}</p>
          </div>
        )}
        {feedback && ( // Conditional rendering for feedback
          <div className="feedback-container">
            <h3>Feedback:</h3>
            <p>{feedback}</p>
          </div>
        )}        
      </div>
      <div className="hume">
        <h2>Predictions from Audio File:</h2>
        {loading ? (
          <p>Loading predictions...</p>
        ) : (
          <div className="output-container">
            {/* <h2>Raw Predictions:</h2>
            <pre>{JSON.stringify(rawPredictions, null, 2)}</pre> Output raw predictions */}
            <h2>Top 10 Emotions:</h2>
            {topEmotions.length > 0 ? (
              <ul>
                {topEmotions.map((emotion, index) => (
                  <li key={index}>{emotion.name}: {(emotion.score * 100).toFixed(2)}%</li>
                ))}
              </ul>
            ) : (
              <p>No emotions detected.</p>
            )}
          </div>
        )}
      </div>
      <p className="read-the-docs">
        Built @CalHacks 11.0
      </p>
    </>
  );
}

export default App;
