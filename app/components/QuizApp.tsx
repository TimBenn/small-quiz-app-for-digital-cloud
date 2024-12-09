"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { QuizQuestion, QuizAttempt } from '../../lib/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import Questions from "./questions.json";

interface QuizState {
    currentQuestion: number;
    selectedAnswers: string[];
    showReason: boolean;
    score: number;
    quizComplete: boolean;
    showReview: boolean;
    attempts: QuizAttempt[];
    questions: QuizQuestion[];
}

const QuizApp: React.FC = () => {
    const [state, setState] = useState<QuizState>({
        currentQuestion: 0,
        selectedAnswers: [],
        showReason: false,
        score: 0,
        quizComplete: false,
        showReview: false,
        attempts: [],
        questions: []
    });

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                setState(prev => ({ ...prev, questions: Questions.map(q => JSON.parse(q)) }));
            } catch (error) {
                console.error('Error loading questions:', error);
            }
        };
        loadQuestions();
    }, []);

    const currentQuestionData = state.questions[state.currentQuestion];
    const isMultipleAnswer = currentQuestionData && Array.isArray(currentQuestionData.answer);
    const maxSelections = isMultipleAnswer ? 2 : 1;

    const handleAnswerSelect = (choice: string): void => {
        if (state.showReason) return;

        setState(prevState => {
            let newSelectedAnswers: string[];
            if (isMultipleAnswer) {
                if (prevState.selectedAnswers.includes(choice)) {
                    newSelectedAnswers = prevState.selectedAnswers.filter(answer => answer !== choice);
                } else if (prevState.selectedAnswers.length < maxSelections) {
                    newSelectedAnswers = [...prevState.selectedAnswers, choice];
                } else {
                    return prevState;
                }
            } else {
                newSelectedAnswers = [choice];
            }
            return { ...prevState, selectedAnswers: newSelectedAnswers };
        });
    };

    const isCorrect = (): boolean => {
        const currentAnswer = currentQuestionData.answer;
        let isCorrect: boolean;

        if (isMultipleAnswer && Array.isArray(currentAnswer)) {
            isCorrect = state.selectedAnswers.length === currentAnswer.length &&
                state.selectedAnswers.every(answer => currentAnswer.includes(answer));
        } else {
            isCorrect = state.selectedAnswers[0] === currentAnswer;
        }

        return isCorrect;
    };

    const checkAnswer = (): void => {
        const currentAnswer = currentQuestionData.answer;
        let isCorrect: boolean;

        if (isMultipleAnswer && Array.isArray(currentAnswer)) {
            isCorrect = state.selectedAnswers.length === currentAnswer.length &&
                state.selectedAnswers.every(answer => currentAnswer.includes(answer));
        } else {
            isCorrect = state.selectedAnswers[0] === currentAnswer;
        }

        const attempt: QuizAttempt = {
            question: currentQuestionData,
            userAnswer: state.selectedAnswers,
            isCorrect
        };

        setState(prevState => ({
            ...prevState,
            score: isCorrect ? prevState.score + 1 : prevState.score,
            showReason: true,
            attempts: [...prevState.attempts, attempt]
        }));
    };

    const prevQuestion = (): void => {
        setState(prevState => {
            if (prevState.currentQuestion > 0) {
                const lastQuestion = prevState.attempts[prevState.currentQuestion - 1];
                return {
                    ...prevState,
                    currentQuestion: prevState.currentQuestion - 1,
                    selectedAnswers: [],
                    score: lastQuestion.isCorrect ? prevState.score - 1 : prevState.score,
                    showReason: false
                };
            } else {
                return {
                    ...prevState
                };
            }
        });
    };

    const nextQuestion = (): void => {
        setState(prevState => {
            if (prevState.currentQuestion < state.questions.length - 1) {
                return {
                    ...prevState,
                    currentQuestion: prevState.currentQuestion + 1,
                    selectedAnswers: [],
                    showReason: false
                };
            } else {
                return {
                    ...prevState,
                    quizComplete: true
                };
            }
        });
    };

    const toggleReview = (): void => {
        setState(prev => ({ ...prev, showReview: !prev.showReview }));
    };

    const progress = ((state.currentQuestion + 1) / state.questions.length) * 100;

    if (state.questions.length === 0) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <p className="text-center">Loading questions...</p>
                </CardContent>
            </Card>
        );
    }

    if (state.quizComplete) {
        const finalScore = (state.score / state.questions.length) * 100;

        if (state.showReview) {
            return (
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader className="text-2xl font-bold">
                        <div className="flex justify-between items-center">
                            <h2>Review Mode</h2>
                            <Button onClick={toggleReview}>Back to Summary</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {state.attempts.map((attempt, index) => (
                                <div key={index} className="mb-8 p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-block px-2 py-1 rounded text-white ${attempt.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                            {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Question {index + 1} of {state.questions.length}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{attempt.question.question}</h3>
                                    <div className="space-y-2 mb-4">
                                        {attempt.question.choices.map((choice, choiceIndex) => (
                                            <div
                                                key={choiceIndex}
                                                className={`p-2 rounded ${Array.isArray(attempt.question.answer)
                                                    ? attempt.question.answer.includes(choice)
                                                        ? 'bg-green-100 border-green-500'
                                                        : attempt.userAnswer.includes(choice)
                                                            ? 'bg-red-100 border-red-500'
                                                            : 'bg-gray-50'
                                                    : choice === attempt.question.answer
                                                        ? 'bg-green-100 border-green-500'
                                                        : attempt.userAnswer.includes(choice)
                                                            ? 'bg-red-100 border-red-500'
                                                            : 'bg-gray-50'
                                                    }`}
                                            >
                                                {choice}
                                            </div>
                                        ))}
                                    </div>
                                    <Alert>
                                        <AlertTitle>Explanation</AlertTitle>
                                        <AlertDescription>{attempt.question.reason}</AlertDescription>
                                    </Alert>
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="text-2xl font-bold text-center">Quiz Complete!</CardHeader>
                <CardContent>
                    <div className="text-center">
                        <p className="text-xl mb-4">Your score: {finalScore.toFixed(1)}%</p>
                        <Progress value={finalScore} className="w-full h-4 mb-4" />
                        <div className="space-x-4">
                            <Button onClick={toggleReview}>Review Answers</Button>
                            <Button onClick={() => window.location.reload()}>Restart Quiz</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                        Question {state.currentQuestion + 1} of {state.questions.length}
                    </span>
                    <span className="text-sm text-gray-500">Score: {state.score}</span>
                </div>
                <Progress value={progress} className="w-full h-2 mb-4" />
                <h2 className="text-xl font-semibold">{currentQuestionData.question}</h2>
                {isMultipleAnswer && (
                    <p className="text-sm text-gray-500 mt-2">Select two answers</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {currentQuestionData.choices.map((choice, index) => (
                        <Button
                            key={index}
                            variant={state.selectedAnswers.includes(choice) ? "default" : "outline"}
                            className="w-full justify-start text-left"
                            onClick={() => handleAnswerSelect(choice)}
                            disabled={state.showReason}
                        >
                            {choice}
                        </Button>
                    ))}
                </div>

                {state.showReason && (
                    <Alert className="mt-4">
                        <AlertTitle>
                            {isCorrect() ? "Correct!" : "Incorrect"}
                        </AlertTitle>
                        <AlertDescription>{currentQuestionData.reason}</AlertDescription>
                    </Alert>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={prevQuestion}>
                        Back
                    </Button>
                    {!state.showReason && state.selectedAnswers.length > 0 && (
                        <Button onClick={checkAnswer}>
                            Check Answer
                        </Button>
                    )}
                    {state.showReason && (
                        <Button onClick={nextQuestion}>
                            Next Question
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default QuizApp;