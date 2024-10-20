import { useState } from 'react';
import './App.css';
import Mic from './assets/mic.png'

function App() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [feedback, setFeedback] = useState(''); // New state for feedback

  const clearInput = () => {
    setInputText('');
    setSubmittedText('');
    setFeedback(''); // Clear feedback when input is cleared
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSubmittedText(inputText);
      // Provide feedback based on the submitted text
      setFeedback(`Great job! Your speech is ${inputText.length} characters long.`);
    }
  };

  const handleInputChange = (e) => {
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
        <h1>SpeechSage 🪄</h1>
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
            <button className="mic-button">
              <img src={Mic} alt="Mic" className="mic-image" />
            </button>
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
      <p className="read-the-docs">
        Built @CalHacks 11.0
      </p>
    </>
  );
}

export default App;
