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
    { id: 1, name: "GoogleAISquare", messages: ["AI: Add your prompt"] },
    { id: 2, name: "Pizza order", messages: ["Me: Hey", "What’s up?"] },
  ]);
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showReserveBtn, setShowReserveBtn] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const toggleMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleChatClick = (chat) => {
    setActiveChat(chat);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleMakeReservation = () => {
    // showReservationModal();
    makeReservation();
  };

  const showReservationModal = () => {
    setShowReserveModal(true);
  };

  const makeReservation = () => {
    // Create Lambda service object
    var lambda = new AWS.Lambda();

    // Setup Lambda parameters
    var params = {
      FunctionName: process.env.REACT_APP_SQUARE_LAMBDA_NAME,
    };

    // Invoke Lambda function
    lambda.invoke(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log(data); // successful response

        let result;

        if (typeof data.Payload === "string") {
          result = JSON.parse(data.Payload);
        } else if (typeof data.Payload === "object") {
          result = data.Payload;
        }
        // debugger;

        // Update the chat window with the result
        if (result && result.body) {
          const tmp = JSON.parse(result.body).booking;
          let resMsg = tmp.status + ". " + tmp.seller_note;
          console.log("msg: ", resMsg);
          setActiveChat((prevActiveChat) => {
            const updatedMessages = [
              ...prevActiveChat.messages,
              "AI: " + resMsg,
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
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    setActiveChat((prevActiveChat) => {
      const updatedMessages = [...prevActiveChat.messages, "Me: " + newMessage];
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

    // Create Lambda service object
    var lambda = new AWS.Lambda();

    // Setup Lambda parameters
    var params = {
      FunctionName: process.env.REACT_APP_AI_LAMBDA_NAME,
      Payload: JSON.stringify({ body: { prompt: newMessage } }), // Your payload here
    };

    // Invoke Lambda function
    lambda.invoke(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log(data); // successful response

        let result;

        if (typeof data.Payload === "string") {
          result = JSON.parse(data.Payload);
        } else if (typeof data.Payload === "object") {
          result = data.Payload;
        }
        // debugger;

        // Update the chat window with the result
        if (result && result.body) {
          setActiveChat((prevActiveChat) => {
            const updatedMessages = [
              ...prevActiveChat.messages,
              "AI: " + result.body,
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

          if (
            typeof result.body === "string" &&
            result.body.indexOf("Here are your top picks from Google!") > -1
          ) {
            setShowReserveBtn(true);
          }
        }
      }
    });

    setNewMessage("");
  };

  function ReservationModal({ onClose, onReserve }) {
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("AM");

    const handleSubmit = () => {
      onReserve(`${hour}:${minute}`, period);
      onClose();
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Reserve a Table</h2>
          <div>
            <select value={hour} onChange={(e) => setHour(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h < 10 ? `0${h}` : h}>
                  {h}
                </option>
              ))}
            </select>
            :
            <select value={minute} onChange={(e) => setMinute(e.target.value)}>
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <option key={m} value={m < 10 ? `0${m}` : m}>
                  {m < 10 ? `0${m}` : m}
                </option>
              ))}
            </select>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          <button onClick={handleSubmit}>Reserve</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

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
            className={`chat-summary ${activeChat.id === chat.id ? "active" : ""
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
            <div
              key={index}
              className={`message ${message.startsWith("AI:")
                  ? "ai-message"
                  : message.startsWith("Me:")
                    ? "me-message"
                    : ""
                }`}
            >
              {message.split(": ")[1]}
            </div>
          ))}
        </div>
        {showReserveBtn && (
          <button className="reserve-btn" onClick={handleMakeReservation}>
            Reserve Now at Goodfellas!
          </button>
        )}

        {showReserveModal && (
          <ReservationModal
            onClose={() => setShowReserveModal(false)}
            onReserve={(time, period) => {
              alert(`Reservation made for ${time} ${period} at Goodfellas!`);
            }}
          />
        )}
        <div className="input-area">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
