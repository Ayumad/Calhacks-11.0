import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [messages, setMessages] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      setMessages((prevMessages) => prevMessages + `\n${inputValue}`); // Append new message to the existing messages
      setInputValue(''); // Clear the input field
    }
  };

  return (
    <>
      <div>
        {/*<a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>*/}
      </div>
      <h1>ArticulateAI</h1>
      <div className="messages" style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
        {messages} {/* Displaying the messages above the text box */}
      </div>
      <div className="card">
      <textarea
          className="text-box"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Update input value on change
          placeholder="Message ArticulateAI"
        />
        <button className="submit-button" onClick={handleSendMessage}>
          Send
        </button>
        {/*<p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>*/}
      </div>
      {/*<p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>*/}
    </>
  )
}

export default App
