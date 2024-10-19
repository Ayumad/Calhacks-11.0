import { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');

  const clearInput = () => {
    setInputText('');
    setSubmittedText('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSubmittedText(inputText);
      // Optionally keep the input text for further editing
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputText(newValue);
    // Clear the submitted text if the input is empty
    if (newValue.trim() === '') {
      setSubmittedText('');
    }
  };

  return (
    <>
      <div className="header">
        <h1>SpeechSageAI</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input 
              type="text" 
              value={inputText} 
              onChange={handleInputChange} // Use the new handler
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
      </div>
      <p className="read-the-docs">
        Built @CalHacks 11.0
      </p>
    </>
  );
}

export default App;
