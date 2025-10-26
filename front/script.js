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
  const res = await fetch("엔드포인트1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  appendChat(data.reply, "bot");

  // TTS 요청 (엔드포인트2)
  await fetch("엔드포인트2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: data.reply }),
  });
}

async function uploadPDF() {
  const file = pdfUpload.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  // PDF 업로드 (엔드포인트3)
  await fetch("엔드포인트3", {
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

const BASE_URL = "http://127.0.0.1:5001";

// 음성 입력 시작
async function startVoiceInput() {

    // 1. 마이크 안내 멘트 재생
  await fetch(`${BASE_URL}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "말씀하세요." }),
  });

  appendChat("🎙️ 음성 인식 중...", "bot");

  const res = await fetch(`${BASE_URL}/voice-input`); // 음성 입력 시작 요청
  const data = await res.json();

  // 인식한 텍스트를 입력창에 표시
  if (data.text) {
    input.value = data.text;        // 입력창에 표시
    appendChat("🗣️ " + data.text, "user");  // 채팅 창에도 표시
  }

  // "전송하시겠습니까?" → 음성 출력
  await fetch(`${BASE_URL}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "전송하시겠습니까?" }),
  });

  // "예"라고 답하면 전송
  if (data.confirmed) {
    await sendMessage(data.text);
  }
}
