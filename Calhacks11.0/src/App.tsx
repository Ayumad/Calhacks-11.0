import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function App() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [topEmotions, setTopEmotions] = useState<Emotion[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [isProcessed, setIsProcessed] = useState(false); // New state to track if audio is processed
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const clearInput = () => {
    setInputText('');
    setSubmittedText('');
    setFeedback('');
    setTopEmotions([]); // Clear emotions when input is cleared
    setIsProcessed(false); // Reset processed state
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSubmittedText(inputText);
      setLoading(true);

      try {
        const prompt = `Hello! Can you help me improve my speech? Here’s what I want to say: "${inputText}"`;
        const result = await model.generateContent(prompt);
        
        console.log('Generated Content:', result);
        if (result && result.response) {
          setFeedback(result.response.text());
        } else {
          throw new Error("Invalid response structure from API.");
        }
      } catch (error: any) {
        console.error('Error generating content:', error);
        setFeedback(`Sorry, there was an error generating content: ${error.message || 'Unknown error'}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: { target: { value: any; }; }) => {
    const newValue = e.target.value;
    setInputText(newValue);
    if (newValue.trim() === '') {
      setSubmittedText('');
      setFeedback('');
      setTopEmotions([]);
      setIsProcessed(false); // Reset processed state
    }
  };

  const getTopEmotions = (rawData: any): Emotion[] => {
    const allPredictions = rawData[0].results.predictions[0].models.prosody.groupedPredictions[0].predictions;
    const emotionMap = new Map<string, number>();

    allPredictions.forEach((prediction: Prediction) => {
      prediction.emotions.forEach((emotion) => {
        const currentScore = emotionMap.get(emotion.name) || 0;
        emotionMap.set(emotion.name, currentScore + emotion.score);
      });
    });

    const sortedEmotions = Array.from(emotionMap.entries())
      .map(([name, score]) => ({
        name,
        score: score / allPredictions.length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return sortedEmotions;
  };

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

      const audioFileUrl = await uploadAudio(audioBlob);
      await fetchPredictions(audioFileUrl);
      setIsProcessed(true); // Set processed state to true after predictions are fetched
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string> => {
    const audioFile = new File([audioBlob], "audio.wav", { type: 'audio/wav' });
    const audioRef = ref(storage, `audio/${audioFile.name}`);

    await uploadBytes(audioRef, audioFile);
    const audioUrl = await getDownloadURL(audioRef);
    console.log('Audio URL:', audioUrl);
    return audioUrl;
  };

  const fetchPredictions = async (audioUrl: string) => {
    setLoading(true);
    try {
      const predictions = await processAudio(audioUrl);
      if (predictions) {
        const emotions = getTopEmotions(predictions);
        setTopEmotions(emotions);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <h1>SpeechSage🪄</h1>
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
            <button type = "button" onClick= {clearInput} className = "clear-button" >
              Clear
            </button>
            <button onClick={isRecording ? stopRecording : startRecording}>
  {isRecording ? '🛑' : '▶️'}
</button>
          </div>
          <div>
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
            <h2>Your Speech:</h2>
            <p>{submittedText}</p>
          </div>
        )}
        {loading ? (
          <p>Analyzing your speech... 🔄</p>
        ) : feedback && (
          <div className="feedback-container">
            <h3>Feedback:</h3>
            <p>{feedback}</p>
          </div>
        )}        
      </div>
      <div className="hume">
        <h2>Emotions detected from your voice:</h2>
        {loading ? (
          <p>Loading predictions...</p>
        ) : isProcessed ? ( // Check if audio has been processed
          <div className="output-container">
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
        ) : (
          <p>Please record audio to see emotions detected.</p> // Prompt to record audio
        )}
      </div>
      <p className="read-the-docs">
        Built @CalHacks 11.0
      </p>
    </>
  );
}

export default App;

