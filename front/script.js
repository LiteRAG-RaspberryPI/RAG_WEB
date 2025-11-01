// PDF 업로드, 대화 전송, 음성 처리

const chatWindow = document.getElementById("chat-window");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const pdfUpload = document.getElementById("pdf-upload");

sendBtn.onclick = sendMessage;
voiceBtn.onclick = startVoiceInput;
pdfUpload.onchange = uploadPDF;

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  appendChat(message, "user");
  input.value = "";

  // 서버에 전송 (엔드포인트1)
  const res = await fetch("http://192.168.0.20:3001/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({question: message, session_id: "s-001", top_k: 3 }),
  });

  const data = await res.json();
  appendChat(data.answer, "bot");
}

async function uploadPDF() {
  const file = pdfUpload.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  // PDF 업로드 (엔드포인트3)
  await fetch("http://192.168.0.20:3001/ingest", {
    method: "POST",
    body: formData,
  });

  appendChat("📄 PDF가 업로드되었습니다.", "bot");
}

function appendChat(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}