// src/modules/messaging/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../../shared/context/AuthContext";
import BottomNav from "../../../shared/components/layout/BottomNav";
import { Lock, Unlock, Shield, AlertTriangle } from "lucide-react";
import "./Messages.css";

const Messages = () => {
  const { user } = useAuth();
  const chatRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  /* ================= MOCK SEED ================= */
  useEffect(() => {
    if (!user) return;

    const stored = JSON.parse(localStorage.getItem("conversations"));

    if (!stored || stored.length === 0) {
      const seed = [
        {
          id: "conv-1",
          listingTitle: "2 Bedroom Flat – Yaba",
          status: "pending", // pending | active | closed | disputed
          isFrozen: false,
          managerId: null,
          availabilityConfirmed: false,
          messages: [
            {
              id: "m1",
              senderRole: "tenant",
              senderId: "t1",
              content: "Is this house still available?",
              timestamp: new Date().toISOString()
            }
          ]
        }
      ];
      localStorage.setItem("conversations", JSON.stringify(seed));
      setConversations(seed);
    } else {
      setConversations(stored);
    }
  }, [user]);

  /* ================= HELPERS ================= */
  const updateConversation = (updated) => {
    const list = conversations.map(c =>
      c.id === updated.id ? updated : c
    );
    setConversations(list);
    setActiveConversation(updated);
    localStorage.setItem("conversations", JSON.stringify(list));
  };

  const canSendMessage = () => {
    if (!activeConversation) return false;
    if (!activeConversation.availabilityConfirmed) return false;
    if (activeConversation.status === "closed") return false;
    if (activeConversation.isFrozen) return false;
    if (activeConversation.status === "disputed" && !isAdmin) return false;
    return true;
  };

  /* ================= MESSAGE ================= */
  const sendMessage = () => {
    if (!newMessage.trim() || !canSendMessage()) return;

    const msg = {
      id: Date.now().toString(),
      senderId: user.id,
      senderRole: user.role,
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    updateConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, msg]
    });

    setNewMessage("");
  };

  /* ================= AVAILABILITY ================= */
  const confirmAvailability = (yes) => {
    if (!yes) {
      updateConversation({ ...activeConversation, status: "closed" });
      return;
    }

    updateConversation({
      ...activeConversation,
      availabilityConfirmed: true,
      status: "active"
    });
  };

  /* ================= UI ================= */
  return (
    <div className="messages-page">
     
      <div className="messages-container">

        {/* SIDEBAR */}
        <aside className="conversations-sidebar">
          <ul className="conversation-list">
            {conversations.map(conv => (
              <li
                key={conv.id}
                className={`conversation-item ${activeConversation?.id === conv.id ? "active" : ""}`}
                onClick={() => setActiveConversation(conv)}
              >
                <strong>{conv.listingTitle}</strong>
                {conv.status === "closed" && <span> 🔒</span>}
              </li>
            ))}
          </ul>
        </aside>

        {/* CHAT */}
        <section className="chat-area">
          {!activeConversation ? (
            <div className="chat-placeholder">
              <h3>Select a conversation</h3>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h3>{activeConversation.listingTitle}</h3>

                {isAdmin && (
                  <>
                    <button onClick={() => updateConversation({
                      ...activeConversation,
                      isFrozen: !activeConversation.isFrozen
                    })}>
                      {activeConversation.isFrozen ? <Unlock /> : <Lock />}
                    </button>
                    <button onClick={() => updateConversation({ ...activeConversation, status: "closed" })}>
                      <AlertTriangle />
                    </button>
                    <button onClick={() => updateConversation({
                      ...activeConversation,
                      status: "active",
                      dispute: null
                    })}>
                      <Shield />
                    </button>
                  </>
                )}
              </div>

              {/* AVAILABILITY GATE */}
              {!activeConversation.availabilityConfirmed && (
                <div className="chat-placeholder">
                  <p>Is this house available?</p>
                  <button onClick={() => confirmAvailability(true)}>Yes</button>
                  <button onClick={() => confirmAvailability(false)}>No</button>
                </div>
              )}

              {/* MESSAGES */}
              <div className="chat-messages" ref={chatRef}>
                {activeConversation.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === user.id ? "outgoing" : "incoming"}`}
                  >
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                      <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT */}
              <div className="message-input">
                <input
                  className="message-text-input"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  disabled={!canSendMessage()}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button className="send-btn" onClick={sendMessage} disabled={!canSendMessage()}>
                  Send
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Messages;