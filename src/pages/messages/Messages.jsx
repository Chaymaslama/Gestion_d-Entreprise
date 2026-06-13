import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  listenConversations, listenMessages,
  sendMessage, getOrCreateConversation, getAllUsers,
} from "../../services/messageService";

export default function Messages() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Écoute conversations en temps réel
  useEffect(() => {
    const unsub = listenConversations(currentUser.uid, setConversations);
    return () => unsub();
  }, [currentUser.uid]);

  // Écoute messages en temps réel
  useEffect(() => {
    if (!activeConv) return;
    const unsub = listenMessages(activeConv.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [activeConv]);

  // Charge les utilisateurs
  useEffect(() => {
    getAllUsers().then((u) => setUsers(u.filter((u) => u.uid !== currentUser.uid)));
  }, [currentUser.uid]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    const msgText = text;
    setText("");
    await sendMessage(
      activeConv.id, msgText,
      currentUser.uid,
      currentUser.email
    );
  }

  async function handleStartConv(user) {
    setLoading(true);
    setShowUsers(false);
    const conv = await getOrCreateConversation(currentUser, user);
    setActiveConv(conv);
    setLoading(false);
  }

  function getOtherParticipant(conv) {
    if (!conv?.participantsInfo) return { nom: "Utilisateur", email: "" };
    const otherId = conv.participants?.find((p) => p !== currentUser.uid);
    return conv.participantsInfo?.[otherId] || { nom: "Utilisateur", email: "" };
  }

  function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={styles.wrapper}>
      {/* Sidebar conversations */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Conversations</h3>
          <button style={styles.newBtn} onClick={() => setShowUsers(!showUsers)}>
            ✏️
          </button>
        </div>

        {/* Liste utilisateurs pour nouvelle conversation */}
        {showUsers && (
          <div style={styles.usersList}>
            <p style={styles.usersTitle}>Nouvelle conversation</p>
            {users.map((user) => (
              <div
                key={user.uid}
                style={styles.userItem}
                onClick={() => handleStartConv(user)}
              >
                <div style={styles.userAvatar}>
                  {user.prenom?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={styles.userName}>{user.prenom} {user.nom}</p>
                  <p style={styles.userEmail}>{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Liste des conversations */}
        <div style={styles.convList}>
          {conversations.length === 0 ? (
            <p style={styles.noConv}>Aucune conversation.<br />Cliquez sur ✏️ pour commencer.</p>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  style={{
                    ...styles.convItem,
                    background: isActive ? "#EEF2FF" : "transparent",
                    borderLeft: isActive ? "3px solid #4F46E5" : "3px solid transparent",
                  }}
                  onClick={() => setActiveConv(conv)}
                >
                  <div style={styles.convAvatar}>
                    {other.nom?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.convInfo}>
                    <p style={styles.convNom}>{other.nom || other.email}</p>
                    <p style={styles.convLast}>
                      {conv.lastMessage || "Démarrer la conversation..."}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div style={styles.chatArea}>
        {!activeConv ? (
          <div style={styles.noChat}>
            <p style={styles.noChatIcon}>💬</p>
            <p style={styles.noChatText}>Sélectionnez une conversation</p>
            <p style={styles.noChatHint}>ou cliquez sur ✏️ pour en démarrer une</p>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div style={styles.chatHeader}>
              <div style={styles.chatAvatar}>
                {getOtherParticipant(activeConv).nom?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.chatNom}>
                  {getOtherParticipant(activeConv).nom || getOtherParticipant(activeConv).email}
                </p>
                <p style={styles.chatStatus}>🟢 En ligne</p>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesArea}>
              {messages.length === 0 ? (
                <p style={styles.noMessages}>Envoyez le premier message ! 👋</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.msgWrapper,
                        justifyContent: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      {!isMe && (
                        <div style={styles.msgAvatar}>
                          {msg.senderNom?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{
                        ...styles.msgBubble,
                        background: isMe ? "#4F46E5" : "#fff",
                        color: isMe ? "#fff" : "#0f172a",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}>
                        <p style={styles.msgText}>{msg.text}</p>
                        <p style={{
                          ...styles.msgTime,
                          color: isMe ? "rgba(255,255,255,0.7)" : "#94a3b8",
                        }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={styles.inputArea}>
              <input
                style={styles.msgInput}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Écrire un message..."
                autoFocus
              />
              <button
                type="submit"
                style={{
                  ...styles.sendBtn,
                  background: text.trim() ? "#4F46E5" : "#e2e8f0",
                  color: text.trim() ? "#fff" : "#94a3b8",
                }}
                disabled={!text.trim()}
              >
                ➤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", height: "calc(100vh - 80px)", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" },
  sidebar: { width: "300px", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 },
  sidebarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid #e2e8f0" },
  sidebarTitle: { margin: 0, fontSize: "16px", fontWeight: 700 },
  newBtn: { background: "#EEF2FF", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "16px" },
  usersList: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "8px" },
  usersTitle: { margin: "0 0 8px", fontSize: "12px", color: "#64748b", fontWeight: 600, padding: "0 4px" },
  userItem: { display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s" },
  userAvatar: { width: "32px", height: "32px", borderRadius: "50%", background: "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 },
  userName: { margin: 0, fontSize: "13px", fontWeight: 600 },
  userEmail: { margin: 0, fontSize: "11px", color: "#64748b" },
  convList: { flex: 1, overflowY: "auto" },
  noConv: { padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 },
  convItem: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", cursor: "pointer", transition: "all 0.15s" },
  convAvatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", flexShrink: 0 },
  convInfo: { flex: 1, overflow: "hidden" },
  convNom: { margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" },
  convLast: { margin: 0, fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column" },
  noChat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" },
  noChatIcon: { fontSize: "48px", margin: "0 0 1rem" },
  noChatText: { fontSize: "16px", fontWeight: 600, margin: "0 0 4px" },
  noChatHint: { fontSize: "13px", margin: 0 },
  chatHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#fff" },
  chatAvatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px" },
  chatNom: { margin: 0, fontSize: "15px", fontWeight: 700 },
  chatStatus: { margin: 0, fontSize: "12px", color: "#059669" },
  messagesArea: { flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "12px", background: "#f8fafc" },
  noMessages: { textAlign: "center", color: "#94a3b8", fontSize: "14px", marginTop: "2rem" },
  msgWrapper: { display: "flex", alignItems: "flex-end", gap: "8px" },
  msgAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "#e2e8f0", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0 },
  msgBubble: { maxWidth: "65%", padding: "10px 14px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" },
  msgText: { margin: 0, fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word" },
  msgTime: { margin: "4px 0 0", fontSize: "10px", textAlign: "right" },
  inputArea: { display: "flex", gap: "10px", padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", background: "#fff" },
  msgInput: { flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", background: "#f8fafc" },
  sendBtn: { width: "44px", height: "44px", borderRadius: "50%", border: "none", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 },
};