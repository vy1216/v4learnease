import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, BrainCircuit, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Question = { id: string; type: 'mcq'|'tf'|'short'; question: string; options?: string[]; answer: string; topic: string; difficulty: 'easy'|'medium'|'hard' };
type Quiz = { id: string; topic: string; questions: Question[] };

const Quiz = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<'loading' | 'in-progress' | 'completed'>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; timeMs: number }[]>([]);
  const [questionStart, setQuestionStart] = useState<number>(Date.now());
  const [result, setResult] = useState<{ score: number; total: number; improvements: { topic: string; count: number }[]; avgTimeMs: number } | null>(null);

  const currentQuestion = useMemo(() => (quiz ? quiz.questions[currentQuestionIndex] : null), [quiz, currentQuestionIndex]);
  const progress = useMemo(() => (quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0), [quiz, currentQuestionIndex]);

  useEffect(() => {
    const id = params.get('quizId');
    if (!id) {
      setQuizState('completed');
      setResult({ score: 0, total: 0, improvements: [], avgTimeMs: 0 });
      return;
    }
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/quiz/${id}`);
        if (!res.ok) throw new Error('Failed to load quiz');
        const js = await res.json();
        setQuiz(js);
        setQuizState('in-progress');
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setAnswers([]);
        setQuestionStart(Date.now());
      } catch {
        setQuizState('completed');
        setResult({ score: 0, total: 0, improvements: [], avgTimeMs: 0 });
      }
    };
    fetchQuiz();
  }, [params]);

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !quiz) return;
    setIsAnswered(true);
    const timeMs = Date.now() - questionStart;
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, answer: selectedAnswer, timeMs }]);
    setTimeout(async () => {
      if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuestionStart(Date.now());
      } else {
        try {
          const res = await fetch('http://localhost:3002/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizId: quiz.id, answers }),
          });
          if (res.ok) {
            const js = await res.json();
            setResult({ score: js.score, total: js.total, improvements: js.improvements, avgTimeMs: js.avgTimeMs });
          }
        } catch { void 0; }
        setQuizState('completed');
      }
    }, 1200);
  };
  
  const getOptionClass = (option: string) => {
    if (!isAnswered || !currentQuestion) return '';
    if (option === currentQuestion.answer) return 'text-green-500';
    if (option === selectedAnswer) return 'text-red-500';
    return '';
  };

  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <BrainCircuit className="w-16 h-16 mx-auto text-primary"/>
            <CardTitle className="mt-4 text-2xl">Preparing your quiz…</CardTitle>
            <CardDescription>Loading questions.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (quizState === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription>You've finished the quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">{result ? `${result.score} / ${result.total}` : '0 / 0'}</p>
            {result && (
              <div className="text-sm text-muted-foreground space-y-2 mb-4">
                <p>Average time per question: {Math.round(result.avgTimeMs)} ms</p>
                <div>
                  <p className="font-semibold">Focus areas:</p>
                  <ul>
                    {result.improvements.length === 0 ? (
                      <li>None — great work</li>
                    ) : (
                      result.improvements.map((imp, idx) => (
                        <li key={idx}>{imp.topic}: {imp.count} question(s)</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              <RotateCcw className="w-4 h-4 mr-2" />
              View on Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          <CardDescription className="text-lg mt-2">{currentQuestion?.question}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentQuestion?.type === 'short' ? (
            <div className="space-y-3">
              <Textarea placeholder="Type your answer" value={selectedAnswer || ''} onChange={(e) => setSelectedAnswer(e.target.value)} disabled={isAnswered} />
            </div>
          ) : (
            <RadioGroup value={selectedAnswer || ''} onValueChange={handleSelectAnswer} disabled={isAnswered}>
              <div className="space-y-4">
                {(currentQuestion?.options || []).map((option, index) => (
                  <Label key={index} htmlFor={`option-${index}`} className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer transition-colors ${getOptionClass(option)} hover:bg-muted/50`}>
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <span className="flex-grow">{option}</span>
                    {isAnswered && (
                      option === currentQuestion?.answer ? <CheckCircle2 className="text-green-500" /> : 
                      option === selectedAnswer ? <XCircle className="text-red-500" /> : null
                    )}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}
          <Button className="w-full mt-6" onClick={handleSubmitAnswer} disabled={!selectedAnswer || isAnswered}>
            {isAnswered ? 'Next Question...' : 'Submit Answer'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
