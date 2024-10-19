import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY); // Use REACT_APP_ prefix for environment variables
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function App() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [feedback, setFeedback] = useState(''); // New state for feedback
  const [loading, setLoading] = useState(false); // State for loading feedback

  const clearInput = () => {
    setInputText('');
    setSubmittedText('');
    setFeedback(''); // Clear feedback when input is cleared
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSubmittedText(inputText);
      setLoading(true); // Show loading while waiting for response

      // Call Gemini AI (or any NLP API) to get feedback
      try {
        const prompt = `Hello! Can you help me improve my speech? Here’s what I want to say: "${inputText}"`; // Use input text as prompt
        const result = await model.generateContent(prompt);
        
        console.log('Generated Content:', result); // Log the result
        if (result && result.response) {
          setFeedback(result.response.text());
        } else {
          throw new Error("Invalid response structure from API.");
        }
    } catch (error: any) {
        console.error('Error generating content:', error);
        if (error.response) {
          console.error('Response data:', error.response.data); // Log response data if available
        }
        setFeedback(`Sorry, there was an error generating content: ${error.message || 'Unknown error'}. Please try again later.`);
    } finally {
        setLoading(false); // Hide loading once feedback is received
    }    
    }
  };

  const handleInputChange = (e: { target: { value: any; }; }) => {
    const newValue = e.target.value;
    setInputText(newValue);
    // Clear the submitted text and feedback if the input is empty
    if (newValue.trim() === '') {
      setSubmittedText('');
      setFeedback('');
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
            <button className="mic-button">🎙️</button>
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
        {loading ? (
          <p>Analyzing your speech... 🔄</p>
        ) : feedback && ( // Conditional rendering for feedback
          <div className="feedback-container">
            <h3>Feedback:</h3>
            <p>{feedback}</p>
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
