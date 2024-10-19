import { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState(''); // State for input text

  // Function to clear the input text
  const clearInput = () => {
    setInputText('');
  };

  return (
    <>
      <h1>SpeechSage</h1>
      <div className="card">
        <div className="input-container">
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Use voice input or copy and paste your speech into the text box." 
          />
          <button onClick={clearInput} className="clear-button">
            Clear
          </button>
          <button className="mic-button">🎤</button> {/* Microphone button */}
        </div>
        <p>
          Unlock your communication skills to the next level.
        </p>
        {/* Output section */}
        <div className="output-container">
          <h2>Your Input:</h2>
          <p>{inputText || "No input yet."}</p> {/* Display input text */}
        </div>
      </div>
      <p className="read-the-docs">
        Improve your speech skills with our Speech Helper.
      </p>
    </>
  );
}

export default App;

