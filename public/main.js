const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");
const chatHistory = document.getElementById("chatHistory");
const newChatBtn = document.getElementById("newChat");

let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChat = { id: Date.now(), messages: [] };

function renderMessages() {
  messages.innerHTML = "";
  currentChat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.sender}`;
    div.textContent = msg.text;
    messages.appendChild(div);
  });
  messages.scrollTop = messages.scrollHeight;
}

function renderHistory() {
  chatHistory.innerHTML = "";
  chats.forEach(chat => {
    const li = document.createElement("li");
    li.textContent = chat.messages[0]?.text.slice(0, 15) || "Yeni Sohbet";
    li.onclick = () => {
      currentChat = chat;
      renderMessages();
    };
    chatHistory.appendChild(li);
  });
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";

  currentChat.messages.push({ sender: "user", text });
  renderMessages();

  // Görsel oluşturma isteği
  if (text.toLowerCase().includes("görsel oluştur")) {
    const prompt = text.replace("görsel oluştur", "").trim();
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (data.imageUrl) {
      const img = document.createElement("img");
      img.src = data.imageUrl;
      img.style.maxWidth = "200px";
      img.style.borderRadius = "10px";
      const div = document.createElement("div");
      div.className = "message bot";
      div.appendChild(img);
      messages.appendChild(div);
    } else {
      currentChat.messages.push({ sender: "bot", text: "Görsel oluşturulamadı 😢" });
      renderMessages();
    }
  } else {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    currentChat.messages.push({ sender: "bot", text: data.reply || "Hata oluştu" });
    renderMessages();
  }

  if (!chats.find(c => c.id === currentChat.id)) chats.push(currentChat);
  localStorage.setItem("chats", JSON.stringify(chats));
  renderHistory();
}

sendBtn.onclick = sendMessage;
newChatBtn.onclick = () => {
  currentChat = { id: Date.now(), messages: [] };
  renderMessages();
};
renderHistory();
