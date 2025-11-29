import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

function convertToMp3(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-vn",
      "-ar", "44100",
      "-ac", "1",
      "-b:a", "192k",
      outputPath
    ]);
    
    let stderr = "";
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

function parseElevenLabsError(errorText: string): string {
  try {
    const errorJson = JSON.parse(errorText);
    
    if (typeof errorJson.detail === "string") {
      return errorJson.detail;
    }
    
    if (errorJson.detail?.message) {
      return errorJson.detail.message;
    }
    
    if (Array.isArray(errorJson.detail)) {
      const messages = errorJson.detail.map((item: any) => {
        if (typeof item === "string") return item;
        if (item.msg) return item.msg;
        if (item.message) return item.message;
        return JSON.stringify(item);
      });
      return messages.join(", ");
    }
    
    if (errorJson.message) {
      return errorJson.message;
    }
    
    if (errorJson.error) {
      return typeof errorJson.error === "string" ? errorJson.error : errorJson.error.message || JSON.stringify(errorJson.error);
    }
    
    return JSON.stringify(errorJson);
  } catch (e) {
    return errorText || "알 수 없는 오류가 발생했습니다.";
  }
}

const upload = multer({ 
  dest: "temp/",
  limits: { fileSize: 10 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Feedback submission endpoint for Google Sheets
  app.post("/api/feedback", async (req, res) => {
    try {
      const { type, title, content, email } = req.body;

      if (!title || !content) {
        return res.status(400).json({ 
          success: false, 
          message: "제목과 내용을 입력해주세요." 
        });
      }

      // Get current date and time in Korea timezone
      const now = new Date();
      const koreaFormatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      
      const dateParts = koreaFormatter.formatToParts(now);
      const year = dateParts.find(p => p.type === "year")?.value || "";
      const month = dateParts.find(p => p.type === "month")?.value || "";
      const day = dateParts.find(p => p.type === "day")?.value || "";
      const date = `${year}-${month}-${day}`;
      
      const time = timeFormatter.format(now);

      // Validate and map type
      const validTypes = ["bug", "suggestion", "general"];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 피드백 유형입니다.",
        });
      }
      
      const typeLabels: Record<string, string> = {
        bug: "버그 신고",
        suggestion: "개선 제안",
        general: "일반 의견",
      };
      const typeLabel = typeLabels[type] || "일반 의견";

      // Google Apps Script Web App URL (deployed by user)
      const googleScriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;

      if (!googleScriptUrl) {
        console.log("Feedback received (Google Sheets not configured):", {
          date,
          time,
          type: typeLabel,
          title,
          content,
          email: email || "",
        });
        
        return res.json({ 
          success: true, 
          message: "피드백이 저장되었습니다. (Google Sheets 미연동)",
          data: { date, time, type: typeLabel, title, content, email: email || "" }
        });
      }

      // Send to Google Sheets via Apps Script
      const response = await fetch(googleScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [date, time, typeLabel, title, content, email || ""],
        }),
      });

      if (!response.ok) {
        throw new Error("Google Sheets API 응답 오류");
      }

      return res.json({ 
        success: true, 
        message: "피드백이 Google Sheets에 저장되었습니다." 
      });

    } catch (error) {
      console.error("Feedback submission error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "피드백 전송 중 오류가 발생했습니다." 
      });
    }
  });

  // DeepVoice conversion endpoint using ElevenLabs API
  app.post("/api/convert-voice", upload.single("audio"), async (req, res) => {
    const tempFilePath = req.file?.path;
    let mp3FilePath: string | null = null;
    let voiceId: string | null = null;

    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: "ElevenLabs API 키가 설정되지 않았습니다."
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "오디오 파일이 필요합니다."
        });
      }

      const text = req.body.text;
      if (!text) {
        return res.status(400).json({
          success: false,
          message: "변환할 문장이 필요합니다."
        });
      }

      console.log("=== Voice Conversion Started ===");
      console.log("Original file:", tempFilePath);
      console.log("File size:", req.file.size, "bytes");
      console.log("MIME type:", req.file.mimetype);
      console.log("Text to convert:", text);

      // Step 0: Convert webm to mp3 using ffmpeg for better compatibility (async)
      mp3FilePath = tempFilePath + ".mp3";
      try {
        console.log("Converting webm to mp3...");
        await convertToMp3(tempFilePath!, mp3FilePath);
        console.log("Conversion successful, mp3 file:", mp3FilePath);
        
        const mp3Stats = fs.statSync(mp3FilePath);
        console.log("MP3 file size:", mp3Stats.size, "bytes");
      } catch (ffmpegError) {
        console.error("FFmpeg conversion failed:", ffmpegError);
        throw new Error("오디오 형식 변환에 실패했습니다. 다시 녹음해주세요.");
      }

      // Step 1: Create voice clone from converted mp3 audio using native FormData
      const audioBuffer = fs.readFileSync(mp3FilePath);
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      
      const createVoiceFormData = new FormData();
      createVoiceFormData.append("files", audioBlob, "recording.mp3");
      createVoiceFormData.append("name", `temp_voice_${Date.now()}`);
      createVoiceFormData.append("description", "Temporary voice for educational demo");

      console.log("Sending voice clone request to ElevenLabs...");
      console.log("Audio buffer size:", audioBuffer.length, "bytes");
      
      const createVoiceResponse = await fetch("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey
        },
        body: createVoiceFormData
      });

      if (!createVoiceResponse.ok) {
        const errorText = await createVoiceResponse.text();
        console.error("=== Voice Creation Failed ===");
        console.error("Status:", createVoiceResponse.status);
        console.error("Status Text:", createVoiceResponse.statusText);
        console.error("Error Response:", errorText);
        
        const errorMessage = parseElevenLabsError(errorText);
        throw new Error(`음성 클론 생성 실패: ${errorMessage}`);
      }

      const voiceData = await createVoiceResponse.json() as { voice_id: string };
      voiceId = voiceData.voice_id;
      console.log("Voice created with ID:", voiceId);

      // Step 2: Generate TTS with the cloned voice
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error("=== TTS Generation Failed ===");
        console.error("Status:", ttsResponse.status);
        console.error("Error Response:", errorText);
        
        const errorMessage = parseElevenLabsError(errorText);
        throw new Error(`음성 생성 실패: ${errorMessage}`);
      }

      // Get audio as buffer and send to client
      const ttsAudioBuffer = await ttsResponse.arrayBuffer();
      console.log("TTS generated successfully, size:", ttsAudioBuffer.byteLength);

      // Set response headers for audio
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", ttsAudioBuffer.byteLength);
      res.send(Buffer.from(ttsAudioBuffer));

    } catch (error) {
      console.error("Voice conversion error:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "음성 변환 중 오류가 발생했습니다."
      });
    } finally {
      // Cleanup: Delete temporary files
      if (tempFilePath) {
        try {
          fs.unlinkSync(tempFilePath);
          console.log("Temp webm file deleted:", tempFilePath);
        } catch (e) {
          console.error("Failed to delete temp webm file:", e);
        }
      }
      
      if (mp3FilePath && fs.existsSync(mp3FilePath)) {
        try {
          fs.unlinkSync(mp3FilePath);
          console.log("Temp mp3 file deleted:", mp3FilePath);
        } catch (e) {
          console.error("Failed to delete temp mp3 file:", e);
        }
      }

      // Cleanup: Delete voice clone from ElevenLabs (privacy protection)
      if (voiceId) {
        try {
          const apiKey = process.env.ELEVENLABS_API_KEY;
          await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
            method: "DELETE",
            headers: {
              "xi-api-key": apiKey!
            }
          });
          console.log("Voice clone deleted from ElevenLabs:", voiceId);
        } catch (e) {
          console.error("Failed to delete voice clone:", e);
        }
      }
      console.log("=== Voice Conversion Cleanup Complete ===");
    }
  });

  return httpServer;
}
