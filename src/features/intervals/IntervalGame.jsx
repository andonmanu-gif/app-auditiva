import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Music, CheckCircle, XCircle } from 'lucide-react';

const INTERVALS = [
    { name: '2da Menor', semitones: 1 },
    { name: '2da Mayor', semitones: 2 },
    { name: '3ra Menor', semitones: 3 },
    { name: '3ra Mayor', semitones: 4 },
    { name: '4ta Justa', semitones: 5 },
    { name: 'Tritono', semitones: 6 },
    { name: '5ta Justa', semitones: 7 },
    { name: '6ta Menor', semitones: 8 },
    { name: '6ta Mayor', semitones: 9 },
    { name: '7ma Menor', semitones: 10 },
    { name: '7ma Mayor', semitones: 11 },
    { name: 'Octava', semitones: 12 },
];

const NOTES = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];

export default function IntervalGame() {
    const [started, setStarted] = useState(false);
    const [currentInterval, setCurrentInterval] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [isLoaded, setIsLoaded] = useState(false);
    const synthRef = useRef(null);

    useEffect(() => {
        const sampler = new Tone.Sampler({
            urls: {
                "C4": "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                "A4": "A4.mp3",
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => {
                setIsLoaded(true);
            }
        }).toDestination();

        synthRef.current = sampler;

        return () => {
            if (synthRef.current) synthRef.current.dispose();
        };
    }, []);

    const startAudio = async () => {
        await Tone.start();
        setStarted(true);
        playNewInterval();
    };

    const playNewInterval = () => {
        setFeedback(null);
        const randomRoot = NOTES[Math.floor(Math.random() * (NOTES.length - 5))]; // Avoid going too high
        const randomInterval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

        setCurrentInterval({ root: randomRoot, interval: randomInterval });

        playNotes(randomRoot, randomInterval.semitones);
    };

    const playNotes = (root, semitones) => {
        if (!synthRef.current) return;

        const now = Tone.now();
        const rootFreq = Tone.Frequency(root);
        const secondNote = rootFreq.transpose(semitones).toNote(); // Convert back to note name for Sampler

        // Play melodically (ascending)
        synthRef.current.triggerAttackRelease(root, "8n", now);
        synthRef.current.triggerAttackRelease(secondNote, "8n", now + 0.5);
    };

    const repeatInterval = () => {
        if (currentInterval) {
            playNotes(currentInterval.root, currentInterval.interval.semitones);
        }
    };

    const checkAnswer = (selectedInterval) => {
        if (!currentInterval || feedback) return;

        const isCorrect = selectedInterval.name === currentInterval.interval.name;
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));

        if (isCorrect) {
            setTimeout(playNewInterval, 1500);
        }
    };

    if (!started) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <button
                    className="btn-primary"
                    onClick={startAudio}
                    disabled={!isLoaded}
                    style={{
                        fontSize: '1.5rem',
                        padding: '1rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        margin: '0 auto',
                        opacity: isLoaded ? 1 : 0.7,
                        cursor: isLoaded ? 'pointer' : 'wait'
                    }}
                >
                    {isLoaded ? <Play size={32} /> : null}
                    {isLoaded ? "Comenzar Entrenamiento" : "Cargando sonidos..."}
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1>Identificador de Intervalos</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Escucha y selecciona el intervalo correcto.</p>
                <div style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
                    Puntuación: <span style={{ color: 'var(--accent)' }}>{score.correct}</span> / {score.total}
                </div>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button
                    className="btn-primary"
                    onClick={repeatInterval}
                    style={{ borderRadius: '50%', width: '80px', height: '80px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                >
                    <Music size={40} />
                </button>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Repetir Intervalo</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {INTERVALS.map((int) => (
                    <button
                        key={int.name}
                        onClick={() => checkAnswer(int)}
                        disabled={!!feedback}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            backgroundColor:
                                feedback === 'correct' && currentInterval.interval.name === int.name ? 'var(--success)' :
                                    feedback === 'incorrect' && currentInterval.interval.name === int.name ? 'var(--success)' : // Show correct answer even if wrong
                                        'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            cursor: feedback ? 'default' : 'pointer',
                            opacity: feedback && currentInterval.interval.name !== int.name ? 0.5 : 1,
                            transform: feedback && currentInterval.interval.name === int.name ? 'scale(1.05)' : 'scale(1)',
                            fontWeight: 'bold'
                        }}
                    >
                        {int.name}
                    </button>
                ))}
            </div>

            {feedback && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: feedback === 'correct' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: feedback === 'correct' ? 'var(--success)' : 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                }}>
                    {feedback === 'correct' ? <CheckCircle /> : <XCircle />}
                    {feedback === 'correct' ? '¡Correcto!' : `Incorrecto, era ${currentInterval.interval.name}`}
                </div>
            )}

            {feedback === 'incorrect' && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button className="btn-primary" onClick={playNewInterval}>Siguiente</button>
                </div>
            )}
        </div>
    );
}
