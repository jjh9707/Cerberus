import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  return httpServer;
}
