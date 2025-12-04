import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Play, ArrowRight, Loader2, AlertCircle, X } from "lucide-react";

// ========================================
// 설정 변수 (개발자가 수정)
// ========================================

const DEEPVOICE_TEXT =
  "무서워... 나 어디있는지 모르겠어. 어떤 아저씨들 차에 탔어...";

const SESSION_KEY = "filteron_deepvoice_event_visited";

type Screen = "record" | "loading" | "result";

interface DeepvoiceEventOverlayProps {
  onClose?: () => void;
}

export default function DeepvoiceEventOverlay({
  onClose,
}: DeepvoiceEventOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>("record");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [isClosing, setIsClosing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const recordedBlobUrlRef = useRef<string | null>(null);
  const convertedAudioUrlRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const cleanupResources = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      mediaRecorderRef.current = null;
    }

    if (recordedBlobUrlRef.current) {
      URL.revokeObjectURL(recordedBlobUrlRef.current);
      recordedBlobUrlRef.current = null;
    }

    if (convertedAudioUrlRef.current) {
      URL.revokeObjectURL(convertedAudioUrlRef.current);
      convertedAudioUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem(SESSION_KEY);
    if (!hasVisited) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  const markAsVisited = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError({
          title: "브라우저 미지원",
          message:
            "이 브라우저는 음성 녹음을 지원하지 않습니다. Chrome, Firefox, Safari 등 최신 브라우저를 사용해주세요.",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType });
      } catch (e) {
        stream.getTracks().forEach((track) => track.stop());
        setError({
          title: "녹음 초기화 실패",
          message:
            "녹음 기능을 초기화할 수 없습니다. 다른 브라우저를 사용해보세요.",
        });
        return;
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        recordedBlobRef.current = new Blob(audioChunksRef.current, {
          type: mimeType,
        });
        if (recordedBlobUrlRef.current) {
          URL.revokeObjectURL(recordedBlobUrlRef.current);
        }
        recordedBlobUrlRef.current = URL.createObjectURL(
          recordedBlobRef.current,
        );
        setHasRecording(true);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - recordingStartTimeRef.current) / 1000,
        );
        setRecordingTime(elapsed);
      }, 1000);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      const error = err as Error;

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setError({
          title: "마이크 권한 거부됨",
          message:
            "마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.",
        });
      } else if (error.name === "NotFoundError") {
        setError({
          title: "마이크 없음",
          message:
            "마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.",
        });
      } else {
        setError({
          title: "녹음 실패",
          message: "녹음을 시작할 수 없습니다. 다시 시도해주세요.",
        });
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const startConversion = useCallback(async () => {
    if (!recordedBlobRef.current) return;

    setCurrentScreen("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", recordedBlobRef.current, "recording.webm");
      formData.append("text", DEEPVOICE_TEXT);

      const response = await fetch("/api/convert-voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "변환에 실패했습니다");
      }

      const audioBlob = await response.blob();

      if (convertedAudioUrlRef.current) {
        URL.revokeObjectURL(convertedAudioUrlRef.current);
      }
      convertedAudioUrlRef.current = URL.createObjectURL(audioBlob);

      markAsVisited();
      setCurrentScreen("result");
    } catch (err) {
      console.error("변환 실패:", err);
      setCurrentScreen("record");
      setError({
        title: "변환 실패",
        message:
          (err as Error).message ||
          "음성 변환에 실패했습니다. 다시 시도해주세요.",
      });
    }
  }, [markAsVisited]);

  const playConvertedAudio = useCallback(async () => {
    if (!convertedAudioUrlRef.current) return;

    setIsPlaying(true);

    try {
      const convertedAudio = new Audio(convertedAudioUrlRef.current);
      await convertedAudio.play();

      await new Promise<void>((resolve) => {
        convertedAudio.onended = () => resolve();
      });

      if (!hasPlayed) {
        setHasPlayed(true);
      }
    } catch (err) {
      console.error("재생 실패:", err);
    } finally {
      setIsPlaying(false);
    }
  }, [hasPlayed]);

  const closeOverlay = useCallback(() => {
    markAsVisited();
    setIsClosing(true);

    setTimeout(() => {
      cleanupResources();
      setIsVisible(false);
      onClose?.();
    }, 500);
  }, [onClose, markAsVisited, cleanupResources]);

  if (!isVisible) return null;

  const getStepInfo = () => {
    switch (currentScreen) {
      case "record":
        return { step: 1, text: "1/3" };
      case "loading":
        return { step: 2, text: "2/3" };
      case "result":
        return { step: 3, text: "3/3" };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col transition-opacity duration-500 ${isClosing ? "opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: "#0f0f0f" }}
      data-testid="deepvoice-event-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-title"
    >
      <header className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="text-xl font-bold" style={{ color: "#357051" }}>
          필터온
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>{stepInfo.text}</span>
          <div
            className="flex gap-1"
            role="progressbar"
            aria-valuenow={stepInfo.step}
            aria-valuemin={1}
            aria-valuemax={3}
          >
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === stepInfo.step
                    ? "w-6 bg-[#357051]"
                    : step < stepInfo.step
                      ? "w-2 bg-[#357051]"
                      : "w-2 bg-neutral-700"
                }`}
              />
            ))}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={closeOverlay}
          className="text-neutral-400 hover:text-white"
          data-testid="button-close-overlay"
          aria-label="체험 닫기"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        {currentScreen === "record" && (
          <div className="flex flex-col items-center text-center max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1
              id="overlay-title"
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              음성을 녹음해주세요
            </h1>
            <p className="text-neutral-400 mb-8"></p>

            {!hasRecording && !isRecording && (
              <Card className="w-full mb-6 bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                    <Mic className="w-4 h-4" aria-hidden="true" />
                    마이크 권한이 필요합니다
                  </div>
                  <p className="text-neutral-500 text-sm">
                    녹음 버튼을 누르면 브라우저에서 마이크 권한을 요청합니다.
                    "허용"을 선택해주세요.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="w-full mb-8 bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
                  읽어주세요
                </div>
                <p className="text-lg text-white leading-relaxed">
                  여보세요? 엄마 어디야? 나 감기 걸린 거 같은데... <br /> 오늘 학원 안 가도 돼?
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4 mb-6">
              <button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? "bg-red-600 animate-pulse"
                    : "bg-red-500 hover:bg-red-600 hover:scale-105"
                }`}
                style={{
                  boxShadow: isRecording
                    ? "0 0 0 8px rgba(239, 68, 68, 0.2)"
                    : "none",
                }}
                data-testid="button-record"
                aria-label={isRecording ? "녹음 중지" : "녹음 시작"}
                aria-pressed={isRecording}
              >
                {isRecording ? (
                  <div
                    className="w-5 h-5 bg-white rounded-sm"
                    aria-hidden="true"
                  />
                ) : (
                  <div
                    className="w-6 h-6 bg-white rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>

              <div className="text-center">
                <div
                  className="text-3xl font-semibold text-white font-mono"
                  aria-live="polite"
                >
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-neutral-400">
                  {isRecording
                    ? "녹음 중..."
                    : hasRecording
                      ? "녹음 완료"
                      : "녹음 대기 중"}
                </div>
              </div>
            </div>

            {error && (
              <Card
                className="w-full mb-4 bg-red-950/50 border-red-900"
                role="alert"
              >
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle
                    className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-semibold text-red-400">
                      {error.title}
                    </div>
                    <p className="text-sm text-red-300/80">{error.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              size="lg"
              disabled={!hasRecording || isRecording}
              onClick={startConversion}
              className="gap-2 bg-[#357051] hover:bg-[#4a9a6e] text-white"
              data-testid="button-convert"
            >
              다음으로
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {currentScreen === "loading" && (
          <div
            className="flex flex-col items-center text-center animate-in fade-in duration-500"
            role="status"
            aria-live="polite"
          >
            <Loader2
              className="w-16 h-16 text-[#357051] animate-spin mb-6"
              aria-hidden="true"
            />
            <div className="text-xl text-neutral-300 mb-2">
              작업하고 있습니다...
            </div>
            <div className="text-sm text-neutral-500">잠시만 기다려주세요</div>
          </div>
        )}

        {currentScreen === "result" && (
          <div className="flex flex-col items-center text-center max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              작업이 완료되었습니다
            </h1>
            <p className="text-neutral-400 mb-8">
              버튼을 눌러 음성을 들어보세요
            </p>

            <button
              onClick={playConvertedAudio}
              disabled={isPlaying}
              className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #357051, #4a9a6e)",
                boxShadow: "0 8px 32px rgba(53, 112, 81, 0.3)",
              }}
              data-testid="button-play"
              aria-label={
                isPlaying ? "재생 중" : hasPlayed ? "다시 듣기" : "음성 재생"
              }
              aria-disabled={isPlaying}
            >
              {isPlaying ? (
                <Loader2
                  className="w-8 h-8 text-white animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" aria-hidden="true" />
              )}
            </button>
            <p
              className="text-sm text-neutral-400 mt-3 mb-6"
              aria-live="polite"
            >
              {isPlaying
                ? "재생 중..."
                : hasPlayed
                  ? "다시 듣기"
                  : "음성 들어보기"}
            </p>

            <div
              className={`w-full bg-neutral-900 rounded-2xl p-6 border-l-4 text-left transition-all duration-700 ${
                hasPlayed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              style={{ borderColor: "#357051" }}
              aria-hidden={!hasPlayed}
            >
              <div className="text-neutral-300 leading-relaxed space-y-4">
                <p>
                  <strong className="text-white">어떠신가요?</strong> 이 음성은
                  AI로 생성된 '딥보이스'(Deep Voice)입니다.
                </p>
                <p>
                  짧게 말한 그 순간, 당신과 비슷한 목소리를 만들어 낼 수
                  있습니다.
                </p>
                <p>
                  지금 체험해보신 기술이, 실제로는 피싱이나 각종 사기에 악용되는
                  사례가 늘고 있습니다.
                </p>
                <p>
                  <strong className="text-white">필터온</strong>은 딥보이스
                  체험뿐만 아니라, 피싱·스미싱 등 디지털 사기 예방 교육을 함께
                  제공합니다.
                </p>
                <p>
                  방금 느낀 그 놀라움과 위험성을 한순간의 감정으로 끝내지
                  마세요.
                  <br />
                  조금만 더 관심을 가지고 대비한다면, 앞으로 다가올 더 큰 위험을
                  막을 수 있습니다.
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={closeOverlay}
              className="gap-2 mt-8 bg-[#357051] hover:bg-[#4a9a6e] text-white"
              data-testid="button-close-event"
            >
              체험 종료
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
