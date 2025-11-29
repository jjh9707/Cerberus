import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  Square, 
  Play, 
  Pause,
  Volume2, 
  Bot, 
  AlertTriangle, 
  Lock, 
  CheckCircle2,
  RotateCcw,
  Home,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const SCRIPT = `계절이 지나가는 하늘에는
가을로 가득 차 있습니다.

나는 아무 걱정도 없이
가을 속의 별들을 다 헤일 듯합니다.

가슴 속에 하나 둘 새겨지는 별을
이제 다 못 헤는 것은
쉬이 아침이 오는 까닭이요,
내일 밤이 남은 까닭이요,
아직 나의 청춘이 다하지 않은 까닭입니다.

별 하나에 추억과
별 하나의 사랑과
별 하나에 쓸쓸함과
별 하나에 동경과
별 하나에 시와
별 하나에 어머니, 어머니,`;

const SENTENCES = [
  "엄마, 누가 쫓아와! 살려줘!",
  "아는 삼촌이 맛있는 거 사준대. 같이 갈래?",
  "엄마 차에 강아지 있는데 볼래?"
];

const MAX_RECORDING_TIME = 20;
const MIN_RECORDING_TIME = 3;

type Step = 1 | 2 | 3 | 'complete';

export default function DeepvoiceExperience() {
  const [step, setStep] = useState<Step>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null);
  const [isPlayingConverted, setIsPlayingConverted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [browserSupported, setBrowserSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const convertedAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (convertedAudioUrl) URL.revokeObjectURL(convertedAudioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl, convertedAudioUrl]);

  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      setBrowserSupported(false);
      setError('이 브라우저에서는 녹음 기능을 지원하지 않아요. Chrome, Safari, Edge 등 최신 브라우저를 사용해주세요!');
      return false;
    }
    return true;
  };

  const checkMicPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
    } catch {
      setMicPermission('prompt');
    }
  };

  useEffect(() => {
    if (checkBrowserSupport()) {
      checkMicPermission();
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      setMicPermission('denied');
      setError('마이크 권한이 필요해요. 브라우저 설정에서 허용해주세요!');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const playOriginalAudio = () => {
    if (!audioUrl) return;
    
    if (isPlayingOriginal) {
      originalAudioRef.current?.pause();
      setIsPlayingOriginal(false);
    } else {
      if (!originalAudioRef.current) {
        originalAudioRef.current = new Audio(audioUrl);
        originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
      }
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

  const handleSentenceSelect = (index: number) => {
    setSelectedSentence(index);
  };

  const convertVoice = async () => {
    if (!audioBlob || selectedSentence === null) return;

    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('text', SENTENCES[selectedSentence]);

      const response = await fetch('/api/convert-voice', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
        throw new Error(errorData.message || '변환 실패');
      }

      const audioData = await response.blob();
      const url = URL.createObjectURL(audioData);
      
      setConvertedAudioUrl(url);
      setIsConverting(false);
      setStep('complete');
    } catch (err) {
      console.error('Voice conversion error:', err);
      setError(err instanceof Error ? err.message : '음성 변환 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsConverting(false);
    }
  };

  const playConvertedAudio = () => {
    if (!convertedAudioUrl) return;

    if (isPlayingConverted) {
      convertedAudioRef.current?.pause();
      setIsPlayingConverted(false);
    } else {
      if (!convertedAudioRef.current) {
        convertedAudioRef.current = new Audio(convertedAudioUrl);
        convertedAudioRef.current.onended = () => setIsPlayingConverted(false);
      }
      convertedAudioRef.current.play();
      setIsPlayingConverted(true);
    }
  };

  const stopAllAudio = () => {
    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    }
    if (convertedAudioRef.current) {
      convertedAudioRef.current.pause();
      setIsPlayingConverted(false);
    }
  };

  const goToStep = (nextStep: 1 | 2 | 3 | 'complete') => {
    stopAllAudio();
    setStep(nextStep);
  };

  const resetExperience = () => {
    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      originalAudioRef.current = null;
    }
    if (convertedAudioRef.current) {
      convertedAudioRef.current.pause();
      convertedAudioRef.current = null;
    }
    
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (convertedAudioUrl) URL.revokeObjectURL(convertedAudioUrl);
    
    setStep(1);
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlayingOriginal(false);
    setSelectedSentence(null);
    setIsConverting(false);
    setConvertedAudioUrl(null);
    setIsPlayingConverted(false);
    setError(null);
  };

  const canProceedToStep2 = audioBlob && recordingTime >= MIN_RECORDING_TIME;
  const canProceedToStep3 = selectedSentence !== null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-warning/10 border-warning/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-10 h-10 text-warning shrink-0" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold">딥보이스 기술 체험</h3>
              <p className="text-muted-foreground">
                AI가 여러분의 목소리를 학습해서 말하지 않은 문장을 여러분 목소리로 만들어요.
              </p>
              <p className="text-muted-foreground">
                이 기술이 나쁜 사람들에게 사용되면 부모님이나 친구를 사칭할 수 있어요!
              </p>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">→</span>
                목소리만 믿지 말고 꼭 직접 확인하세요!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {step !== 'complete' && (
        <div className="flex items-center justify-center gap-4">
          {([1, 2, 3] as const).map((s) => {
            const currentStep = step as number;
            const isActive = currentStep === s;
            const isCompleted = currentStep > s;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground" 
                    : isCompleted
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={cn(
                    "w-12 h-1 rounded",
                    isCompleted ? "bg-success" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">1단계: 목소리 녹음하기</h2>
              <p className="text-muted-foreground">아래 시를 큰 소리로 읽어주세요 (최소 3초, 최대 20초)</p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-line font-medium">
                  {SCRIPT}
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4">
              {!isRecording && !audioBlob && (
                <Button 
                  size="lg" 
                  className="gap-3 text-lg px-8 py-6"
                  onClick={startRecording}
                  disabled={micPermission === 'denied' || !browserSupported}
                  data-testid="button-start-recording"
                >
                  <Mic className="w-6 h-6" />
                  녹음 시작
                </Button>
              )}

              {isRecording && (
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-destructive animate-pulse" />
                    <span className="text-xl font-bold text-destructive">녹음 중...</span>
                  </div>
                  
                  <div className="w-full space-y-2">
                    <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="h-3" />
                    <p className="text-center text-muted-foreground">
                      {recordingTime}초 / {MAX_RECORDING_TIME}초
                    </p>
                  </div>

                  <Button 
                    size="lg" 
                    variant="destructive"
                    className="gap-3 text-lg px-8 py-6"
                    onClick={stopRecording}
                    disabled={recordingTime < MIN_RECORDING_TIME}
                    data-testid="button-stop-recording"
                  >
                    <Square className="w-6 h-6" />
                    녹음 종료
                  </Button>
                  
                  {recordingTime < MIN_RECORDING_TIME && (
                    <p className="text-sm text-muted-foreground">
                      최소 {MIN_RECORDING_TIME}초 이상 녹음해주세요
                    </p>
                  )}
                </div>
              )}

              {audioBlob && !isRecording && (
                <div className="flex flex-col items-center gap-4 w-full max-w-md">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold">녹음 완료! ({recordingTime}초)</span>
                  </div>

                  <div className="flex gap-3 flex-wrap justify-center">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={playOriginalAudio}
                      data-testid="button-play-original"
                    >
                      {isPlayingOriginal ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {isPlayingOriginal ? '일시정지' : '내 목소리 들어보기'}
                    </Button>

                    <Button 
                      variant="ghost" 
                      className="gap-2"
                      onClick={resetExperience}
                      data-testid="button-rerecord"
                    >
                      <RotateCcw className="w-5 h-5" />
                      다시 녹음하기
                    </Button>
                  </div>

                  <Button 
                    size="lg"
                    className="gap-2 mt-4"
                    onClick={() => goToStep(2)}
                    disabled={!canProceedToStep2}
                    data-testid="button-next-step-2"
                  >
                    다음 단계로
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">2단계: 문장 선택하기</h2>
              <p className="text-muted-foreground">AI가 말하게 할 문장을 골라보세요</p>
            </div>

            <div className="space-y-3">
              {SENTENCES.map((sentence, index) => (
                <Button
                  key={index}
                  variant={selectedSentence === index ? "default" : "outline"}
                  className={cn(
                    "w-full text-left justify-start text-base py-6 h-auto whitespace-normal",
                    selectedSentence === index && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => handleSentenceSelect(index)}
                  data-testid={`button-sentence-${index}`}
                >
                  <Volume2 className="w-5 h-5 mr-3 shrink-0" />
                  "{sentence}"
                </Button>
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => setStep(1)}
                data-testid="button-back-step-1"
              >
                <RotateCcw className="w-5 h-5" />
                이전 단계
              </Button>

              <Button 
                size="lg"
                className="gap-2"
                onClick={() => goToStep(3)}
                disabled={!canProceedToStep3}
                data-testid="button-next-step-3"
              >
                다음 단계로
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">3단계: AI로 변환하기</h2>
              <p className="text-muted-foreground">
                AI가 여러분의 목소리로 선택한 문장을 말하게 해볼까요?
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-medium">
                  "{selectedSentence !== null && SENTENCES[selectedSentence]}"
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-4">
              {!isConverting && !convertedAudioUrl && (
                <Button 
                  size="lg" 
                  className="gap-3 text-lg px-8 py-6"
                  onClick={convertVoice}
                  data-testid="button-convert-ai"
                >
                  <Bot className="w-6 h-6" />
                  AI로 변환하기
                </Button>
              )}

              {isConverting && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-lg font-medium">AI가 목소리를 분석하고 있어요...</p>
                  <p className="text-muted-foreground">음성 클론을 생성하고 변환 중입니다</p>
                  <p className="text-xs text-muted-foreground">(약 10~20초 소요)</p>
                </div>
              )}

              {error && !isConverting && (
                <Card className="bg-destructive/10 border-destructive/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-destructive font-medium">{error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={convertVoice}
                      data-testid="button-retry-convert"
                    >
                      다시 시도
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-start pt-4">
              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => goToStep(2)}
                disabled={isConverting}
                data-testid="button-back-step-2"
              >
                <RotateCcw className="w-5 h-5" />
                이전 단계
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'complete' && (
        <Card className="border-2 border-primary">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">체험 완료!</h2>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-medium mb-4">
                  "{selectedSentence !== null && SENTENCES[selectedSentence]}"
                </p>
                <Button 
                  size="lg" 
                  className="gap-3"
                  onClick={playConvertedAudio}
                  data-testid="button-play-converted"
                >
                  {isPlayingConverted ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  {isPlayingConverted ? '일시정지' : '변환된 목소리 듣기'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-destructive/10 border-destructive/30">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-xl font-bold">무섭지 않나요?</p>
                <p className="text-muted-foreground">
                  AI 기술이 이렇게 실제 목소리를 똑같이 만들 수 있어요.
                </p>
                <p className="text-muted-foreground">
                  그래서 전화나 음성 메시지만으로는 누가 진짜인지 알 수 없어요!
                </p>
                <p className="font-bold text-lg text-destructive flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  목소리만 믿지 말고 꼭 직접 확인하세요!
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={resetExperience}
                data-testid="button-restart"
              >
                <RotateCcw className="w-5 h-5" />
                다시 체험하기
              </Button>

              <Link href="/">
                <Button className="gap-2" data-testid="button-go-home">
                  <Home className="w-5 h-5" />
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-success/10 border-success/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Lock className="w-10 h-10 text-success shrink-0" />
            <div className="space-y-3">
              <h3 className="text-lg font-bold">안전 약속</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  녹음된 목소리는 절대 저장되지 않아요
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  서버에 전송되거나 보관되지 않아요
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  체험이 끝나면 즉시 삭제돼요
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  브라우저에서만 실행되고 외부로 나가지 않아요
                </li>
              </ul>
              <p className="font-medium text-success">
                필터온은 여러분의 개인정보를 소중히 지킵니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
