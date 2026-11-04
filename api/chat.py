import json
import os
from http.server import BaseHTTPRequestHandler
from typing import Any, cast

from google import genai
from google.genai import types


SYSTEM_PROMPT = (
    "You are the NEXUS TEAM Assistant. You know everything about Nexus Bot, Nexus AI, "
    "Nexus Roblox, Nexus Stat, Nexus Verification, Nexus Music, Nexus FunPlay, and "
    "Nexus Rules Gen. If the user asks for the Discord server, you MUST provide this "
    "link: https://discord.gg/TUewXwtZRC. Be professional, helpful, and keep answers concise."
)
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
MAX_MESSAGE_LENGTH = 2000
MAX_BODY_LENGTH = 12000


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        self._send_json(405, {"error": "Method not allowed."})

    def do_POST(self) -> None:
        try:
            body_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "Invalid request size."})
            return

        if body_length <= 0 or body_length > MAX_BODY_LENGTH:
            self._send_json(413, {"error": "Request body is empty or too large."})
            return

        try:
            payload: Any = json.loads(self.rfile.read(body_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "Request must contain valid JSON."})
            return

        if not isinstance(payload, dict):
            self._send_json(400, {"error": "Request must be a JSON object."})
            return

        request_data = cast(dict[str, Any], payload)
        message = request_data.get("message")
        if not isinstance(message, str) or not message.strip():
            self._send_json(400, {"error": "Please enter a message."})
            return

        message = message.strip()
        if len(message) > MAX_MESSAGE_LENGTH:
            self._send_json(400, {"error": "Message is too long."})
            return

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            self._send_json(503, {"error": "The assistant is not configured yet."})
            return

        try:
            client = genai.Client(api_key=api_key)
            result = client.models.generate_content(
                model=MODEL_NAME,
                contents=message,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=500,
                ),
            )
            reply = result.text
            if not reply:
                self._send_json(502, {"error": "The assistant returned an empty response."})
                return
            self._send_json(200, {"reply": reply.strip()})
        except Exception:
            self.log_error("Gemini request failed")
            self._send_json(
                502,
                {"error": "Sorry, the assistant is temporarily unavailable. Please try again."},
            )