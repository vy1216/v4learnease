import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, BrainCircuit, RotateCcw } from 'lucide-react';

const hardcodedQuestions = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    answer: 'Paris',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    answer: 'Mars',
  },
  {
    question: 'What is the largest mammal?',
    options: ['Elephant', 'Blue Whale', 'Great White Shark', 'Giraffe'],
    answer: 'Blue Whale',
  },
  {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    answer: '4',
  },
  {
    question: 'Which of these is a JavaScript framework?',
    options: ['Laravel', 'Django', 'React', 'Spring'],
    answer: 'React',
  },
];

const Quiz = () => {
  const [quizState, setQuizState] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = hardcodedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / hardcodedQuestions.length) * 100;

  const handleStartQuiz = () => {
    setQuizState('in-progress');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    if (selectedAnswer === currentQuestion.answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < hardcodedQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setQuizState('completed');
      }
    }, 1500); // Wait 1.5 seconds to show feedback
  };
  
  const getOptionClass = (option: string) => {
    if (!isAnswered) return '';
    if (option === currentQuestion.answer) return 'text-green-500';
    if (option === selectedAnswer) return 'text-red-500';
    return '';
  };

  if (quizState === 'not-started') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <BrainCircuit className="w-16 h-16 mx-auto text-primary"/>
            <CardTitle className="mt-4 text-2xl">Ready to Test Your Knowledge?</CardTitle>
            <CardDescription>Take a short quiz to see how much you've learned.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={handleStartQuiz}>Start Quiz</Button>
          </CardContent>
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
            <CardDescription>You've successfully finished the quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-4">
              Your Score: {score} / {hardcodedQuestions.length}
            </p>
            <Button size="lg" onClick={handleStartQuiz}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Again
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
          <CardDescription className="text-lg mt-2">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer || ''} onValueChange={handleSelectAnswer} disabled={isAnswered}>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <Label key={index} htmlFor={`option-${index}`} className={`flex items-center space-x-3 p-4 border rounded-md cursor-pointer transition-colors ${getOptionClass(option)} hover:bg-muted/50`}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <span className="flex-grow">{option}</span>
                  {isAnswered && (
                    option === currentQuestion.answer ? <CheckCircle2 className="text-green-500" /> : 
                    option === selectedAnswer ? <XCircle className="text-red-500" /> : null
                  )}
                </Label>
              ))}
            </div>
          </RadioGroup>
          <Button className="w-full mt-6" onClick={handleSubmitAnswer} disabled={!selectedAnswer || isAnswered}>
            {isAnswered ? 'Next Question...' : 'Submit Answer'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
