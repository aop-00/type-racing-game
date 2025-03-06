import React, { useState, useEffect } from 'react';
import './mystyle.css';
import { words } from './words';

const TypeRacingGame = () => {
    const [currentWord, setCurrentWord] = useState("");
    const [nextWords, setNextWords] = useState([]);
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [remainingTime, setRemainingTime] = useState(30);

    useEffect(() => {
        initializeWords();
    }, []);

    useEffect(() => {
        let interval;
        let timeout;
        if (startTime && !isGameOver) {
            interval = setInterval(() => {
                const currentTime = new Date();
                const timeDiff = (currentTime - startTime) / 1000 / 60; // in minutes
                setElapsedTime(timeDiff);
                const wpm = Math.round(wordCount / timeDiff);
                setWpm(wpm);
                const timeLeft = 30 - (currentTime - startTime) / 1000;
                setRemainingTime(timeLeft);
                if (timeLeft <= 0) {
                    calculateWpm();
                }
            }, 100);

            timeout = setTimeout(() => {
                calculateWpm();
            }, 30000);
        }
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [startTime, wordCount, isGameOver]);

    const initializeWords = () => {
        const initialWords = generateNextWords(6);
        setCurrentWord(initialWords[0]);
        setNextWords(initialWords.slice(1));
    };

    const generateNextWords = (count) => {
        const nextWordsArray = [];
        for (let i = 0; i < count; i++) {
            nextWordsArray.push(words[Math.floor(Math.random() * words.length)]);
        }
        return nextWordsArray;
    };

    const handleKeyPress = (e) => {
        if (!isGameOver && e.key !== 'Backspace') {
            setInput((prevInput) => prevInput + e.key);
            if (!startTime) {
                setStartTime(new Date());
            }
            if (e.key === ' ') {
                evaluateWord();
            }
        }
    };

    const handleKeyDown = (e) => {
        if (!isGameOver && e.key === 'Backspace') {
            setInput((prevInput) => prevInput.slice(0, -1));
        }
    };

    const evaluateWord = () => {
        if (input.trim() === currentWord) {
            setWordCount(wordCount + 1);
            const newNextWords = [...nextWords];
            setCurrentWord(newNextWords.shift());
            setNextWords([...newNextWords, words[Math.floor(Math.random() * words.length)]]);
            setInput("");
        }
    };

    const calculateWpm = () => {
        const endTime = new Date();
        const timeDiff = (endTime - startTime) / 1000 / 60; // in minutes
        const wpm = Math.round(wordCount / timeDiff);
        setWpm(wpm);
        setIsGameOver(true);
    };

    const restartGame = () => {
        setCurrentWord("");
        setNextWords([]);
        setInput("");
        setStartTime(null);
        setWordCount(0);
        setWpm(0);
        setIsGameOver(false);
        setElapsedTime(0);
        setRemainingTime(30);
        initializeWords();
    };

    const getLetterClass = (letter, index) => {
        if (index < input.length) {
            return letter === input[index] ? 'correct-letter' : 'incorrect-letter';
        }
        return 'default-letter';
    };

    useEffect(() => {
        window.addEventListener('keypress', handleKeyPress);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [input, currentWord, startTime, wordCount, isGameOver]);

    const formatTime = (time) => {
        if (time < 5) {
            return time.toFixed(2);
        }
        return Math.floor(time);
    };

    return (
        <div>
            <h1>Type Racing Game</h1>
            <h2>Start typing!</h2>
            {!isGameOver ? (
                <div>
                    <div className="word-container">
                        <span className="current-word">
                            {currentWord.split('').map((letter, index) => (
                                <span key={index} className={getLetterClass(letter, index)}>
                                    {letter}
                                </span>
                            ))}
                        </span>
                        <span className="next-words">{nextWords.join(' ')}</span>
                    </div>
                    <p className="status-text">Current WPM: {wpm}</p>
                    <p className={`status-text ${remainingTime < 10 ? 'warning' : ''}`}>
                        Time Remaining: {formatTime(remainingTime)} seconds
                    </p>
                    <button onClick={calculateWpm}>End Game</button>
                </div>
            ) : (
                <div>
                    <p style={{ fontSize: '2em', fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif' }}>
                        🎉 Time is up! 🏁<br />
                        Your WPM is: {wpm}
                    </p>
                    <button onClick={restartGame}>Restart Game</button>
                </div>
            )}
        </div>
    );
};

export default TypeRacingGame;