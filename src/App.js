import React, { useState } from "react";
import AWS from "aws-sdk";
import "./App.css";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_REGION,
});

function App() {
  const [chats, setChats] = useState([
    { id: 1, name: "GoogleAISquare", messages: ["Add your prompt"] },
    { id: 2, name: "Pizza order", messages: ["Hey", "What’s up?"] },
  ]);
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const toggleMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleChatClick = (chat) => {
    setActiveChat(chat);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // Create Lambda service object
    var lambda = new AWS.Lambda();

    // Setup Lambda parameters
    var params = {
      FunctionName: process.env.REACT_APP_LAMBDA_FUNC_NAME,
      Payload: JSON.stringify({ message: newMessage }), // Your payload here
    };

    // Invoke Lambda function
    lambda.invoke(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log(data); // successful response
        const result = JSON.parse(data.Payload);

        // Update the chat window with the result
        if (result && result.message) {
          setActiveChat((prevActiveChat) => {
            const updatedMessages = [
              ...prevActiveChat.messages,
              result.message,
            ];
            const updatedChat = {
              ...prevActiveChat,
              messages: updatedMessages,
            };
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat.id === updatedChat.id ? updatedChat : chat,
              ),
            );
            return updatedChat;
          });
        }
      }
    });

    setNewMessage("");
  };

  return (
    <div className={`app ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="mode-toggle">
        <button onClick={toggleMode}>
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-summary ${
              activeChat.id === chat.id ? "active" : ""
            }`}
            onClick={() => handleChatClick(chat)}
          >
            {chat.name}
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="messages">
          {activeChat.messages.map((message, index) => (
            <div key={index} className="message">
              {message}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
