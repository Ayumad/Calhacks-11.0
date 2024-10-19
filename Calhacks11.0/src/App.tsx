import { useState } from 'react';
import './App.css';

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
        const response = await fetch('https://api.gemini-ai.com/analyze-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_API_KEY`, // Replace with your API key
          },
          body: JSON.stringify({ speech: inputText })
        });
        const data = await response.json();
        // Assuming the API returns feedback on content, tone, and pacing
        setFeedback(`Content: ${data.contentFeedback}, Tone: ${data.toneFeedback}, Pacing: ${data.pacingFeedback}`);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setFeedback('Sorry, there was an error analyzing your speech. Please try again later.');
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
