import React, { useState } from "react";
import "./App.css";

function App() {
  const [chats, setChats] = useState([
    { id: 1, name: "GoogleAISquare", messages: ["Add your prompt"] },
    { id: 2, name: "Pizza order", messages: ["Hey", "What’s up?"] },
  ]);
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleChatClick = (chat) => {
    setActiveChat(chat);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    setActiveChat((prevActiveChat) => {
      const updatedMessages = [...prevActiveChat.messages, newMessage];
      const updatedChat = { ...prevActiveChat, messages: updatedMessages };
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === updatedChat.id ? updatedChat : chat,
        ),
      );
      return updatedChat;
    });
    setNewMessage("");
  };

  return (
    <div className="app">
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
