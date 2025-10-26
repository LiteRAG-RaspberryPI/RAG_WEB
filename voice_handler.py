# 음성 입출력 로직, Flask API

from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import pyttsx3

app = Flask(__name__)
CORS(app)

r = sr.Recognizer()
engine = pyttsx3.init()

# 🎙️ 음성 입력
@app.route("/voice-input", methods=["GET"])
def voice_input():
    with sr.Microphone() as source:
        print("말씀하세요...")
        audio = r.listen(source)

    try:
        text = r.recognize_google(audio, language="ko-KR")
        print(f"인식된 텍스트: {text}")

        # "전송하시겠습니까?" 음성 출력
        engine.say("전송하시겠습니까?")
        engine.runAndWait()

        # 확인 대기
        with sr.Microphone() as source:
            print("확인 대기 중...")
            confirm_audio = r.listen(source)
        confirm_text = r.recognize_google(confirm_audio, language="ko-KR")
        print(f"확인 응답: {confirm_text}")

        confirmed = "예" in confirm_text or "네" in confirm_text

        return jsonify({"text": text, "confirmed": confirmed})

    except Exception as e:
        return jsonify({"error": str(e)})

# 🔊 음성 출력
@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json()
    text = data.get("text", "")
    engine.say(text)
    engine.runAndWait()
    return jsonify({"status": "spoken"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
