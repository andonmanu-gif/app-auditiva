import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, CheckCircle, XCircle, RefreshCw, Delete } from 'lucide-react';
import ScoreRenderer from '../components/ScoreRenderer';

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const DURATIONS = [
    { label: 'Redonda', value: 'w', icon: '𝅝' },
    { label: 'Blanca', value: 'h', icon: '𝅗𝅥' },
    { label: 'Negra', value: 'q', icon: '♩' },
    { label: 'Corchea', value: '8', icon: '♪' },
];

export default function Dictation() {
    const [started, setStarted] = useState(false);
    const [targetMelody, setTargetMelody] = useState([]);
    const [userNotes, setUserNotes] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState('q');
    const [feedback, setFeedback] = useState(null);
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
        generateMelody();
    };

    const generateMelody = () => {
        // Simple generation: 4 quarter notes in C Major for now
        // In a real app, this would be more complex logic for 4 bars
        const newMelody = [];
        for (let i = 0; i < 4; i++) {
            const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
            newMelody.push({ keys: [randomNote.toLowerCase().replace('4', '/4').replace('5', '/5')], duration: 'q', pitch: randomNote });
        }
        setTargetMelody(newMelody);
        setUserNotes([]);
        setFeedback(null);

        // Play it after a short delay
        setTimeout(() => playMelody(newMelody), 500);
    };

    const playMelody = (melodyToPlay) => {
        if (!synthRef.current) return;
        const now = Tone.now();
        let currentTime = now + 0.1; // Start slightly in the future

        console.log("Playing melody:", melodyToPlay);

        melodyToPlay.forEach((note, index) => {
            // Force 0.5s duration for now to ensure spacing
            const durationTime = 0.5;
            console.log(`Scheduling ${note.pitch} at ${currentTime}`);
            synthRef.current.triggerAttackRelease(note.pitch, durationTime, currentTime);
            currentTime += durationTime + 0.1; // Add small gap
        });
    };

    const addNote = (pitch) => {
        if (feedback === 'correct') return;

        // VexFlow format: c/4
        const vexKey = pitch.toLowerCase().replace('4', '/4').replace('5', '/5');
        const newNote = { keys: [vexKey], duration: selectedDuration, pitch: pitch };

        // Limit to 4 notes for this simple version
        if (userNotes.length < 4) {
            const newNotes = [...userNotes, newNote];
            setUserNotes(newNotes);

            // Play the note
            synthRef.current.triggerAttackRelease(pitch, "8n");
        }
    };

    const removeLastNote = () => {
        if (feedback === 'correct') return;
        setUserNotes(prev => prev.slice(0, -1));
    };

    const checkAnswer = () => {
        if (userNotes.length !== targetMelody.length) {
            setFeedback('incomplete');
            return;
        }

        const isCorrect = userNotes.every((note, index) =>
            note.pitch === targetMelody[index].pitch && note.duration === targetMelody[index].duration
        );

        setFeedback(isCorrect ? 'correct' : 'incorrect');
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
                    {isLoaded ? "Comenzar Dictado" : "Cargando sonidos..."}
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1>Dictado Melódico</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Escucha la melodía y escríbela abajo.</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button className="btn-secondary" onClick={() => playMelody(targetMelody)} title="Repetir Melodía">
                        <Play size={24} /> Repetir Melodía
                    </button>
                    <button className="btn-secondary" onClick={generateMelody} title="Nueva Melodía">
                        <RefreshCw size={24} /> Nueva
                    </button>
                </div>

                {/* Score Display */}
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <ScoreRenderer notes={userNotes} />
                </div>
            </div>

            {/* Controls */}
            <div className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>1. Selecciona Duración</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {DURATIONS.map(d => (
                            <button
                                key={d.value}
                                onClick={() => setSelectedDuration(d.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '1.5rem',
                                    borderRadius: '0.5rem',
                                    border: selectedDuration === d.value ? '2px solid var(--accent)' : '1px solid var(--border)',
                                    backgroundColor: selectedDuration === d.value ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                                    cursor: 'pointer'
                                }}
                                title={d.label}
                            >
                                {d.icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>2. Introduce Notas</h3>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {NOTES.map(note => (
                            <button
                                key={note}
                                onClick={() => addNote(note)}
                                className="btn-secondary"
                                style={{
                                    width: '3rem',
                                    height: '8rem',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: '0.5rem',
                                    backgroundColor: note.includes('#') ? '#333' : 'white',
                                    color: note.includes('#') ? 'white' : 'black',
                                    border: '1px solid #ccc'
                                }}
                            >
                                {note.replace(/\d/, '')}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={removeLastNote} style={{ color: 'var(--error)' }}>
                        <Delete size={20} /> Borrar Última
                    </button>
                    <button className="btn-primary" onClick={checkAnswer}>
                        Comprobar
                    </button>
                </div>
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
                    {feedback === 'correct' ? '¡Correcto!' : feedback === 'incomplete' ? 'Faltan notas' : 'Incorrecto, inténtalo de nuevo'}
                </div>
            )}
        </div>
    );
}
