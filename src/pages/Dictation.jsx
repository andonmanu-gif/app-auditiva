import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, CheckCircle, XCircle, RefreshCw, Delete } from 'lucide-react';
import ScoreRenderer from '../components/ScoreRenderer';

import { generateMelody, SCALES } from '../utils/musicLogic';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
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
    const [selectedKey, setSelectedKey] = useState('C Major');
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
        handleGenerateMelody();
    };

    const handleGenerateMelody = () => {
        // Pick random key
        const keys = Object.keys(SCALES);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setSelectedKey(randomKey);

        const newMelody = generateMelody(randomKey);
        setTargetMelody(newMelody);
        setUserNotes([]);
        setFeedback(null);

        setTimeout(() => playMelody(newMelody), 500);
    };

    const playMelody = (melodyToPlay) => {
        if (!synthRef.current) return;
        const now = Tone.now();
        let currentTime = now + 0.1;

        melodyToPlay.forEach((note) => {
            let durationTime = 0;
            const durationCode = note.duration.replace('r', '');

            if (durationCode === 'w') durationTime = 2.0; // Speed up slightly? No, stick to relative
            else if (durationCode === 'h') durationTime = 1.0;
            else if (durationCode === 'q') durationTime = 0.5;
            else if (durationCode === '8') durationTime = 0.25;

            // Scale duration for playback (e.g. 120 BPM -> q = 0.5s)
            // Let's assume q = 0.6s for easier listening
            const beatTime = 0.6;
            const realDuration = (durationTime / 0.5) * beatTime;

            if (!note.isRest) {
                synthRef.current.triggerAttackRelease(note.pitch, realDuration, currentTime);
            }

            currentTime += realDuration;
        });
    };

    const addNote = (pitch) => {
        if (feedback === 'correct') return;

        // VexFlow format: c/4
        const vexKey = pitch.toLowerCase().replace('4', '/4').replace('5', '/5');
        const newNote = { keys: [vexKey], duration: selectedDuration, pitch: pitch, isRest: false };

        updateUserNotes(newNote);

        // Play the note
        synthRef.current.triggerAttackRelease(pitch, "8n");
    };

    const addRest = () => {
        if (feedback === 'correct') return;
        const newNote = { keys: ['b/4'], duration: selectedDuration + 'r', pitch: null, isRest: true };
        updateUserNotes(newNote);
    };

    const updateUserNotes = (newNote) => {
        // Calculate total beats to limit to 8 (2 bars)
        // ... implementation of limit check ...
        setUserNotes(prev => [...prev, newNote]);
    };

    const removeLastNote = () => {
        if (feedback === 'correct') return;
        setUserNotes(prev => prev.slice(0, -1));
    };

    const checkAnswer = () => {
        // Simple check: length and pitch/duration match
        if (userNotes.length !== targetMelody.length) {
            setFeedback('incomplete');
            return;
        }

        const isCorrect = userNotes.every((note, index) => {
            if (note.isRest !== targetMelody[index].isRest) return false;
            if (note.duration !== targetMelody[index].duration) return false;
            if (!note.isRest && note.pitch !== targetMelody[index].pitch) return false;
            return true;
        });

        setFeedback(isCorrect ? 'correct' : 'incorrect');
    };

    if (!started) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <button
                    className="btn-primary"
                    onClick={startAudio}
                    disabled={!isLoaded}
                    style={{ fontSize: '1.5rem', padding: '1rem 2rem', margin: '0 auto' }}
                >
                    {isLoaded ? "Comenzar Dictado Avanzado" : "Cargando sonidos..."}
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1>Dictado Melódico</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Tonalidad: <strong>{selectedKey}</strong></p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button className="btn-secondary" onClick={() => playMelody(targetMelody)}><Play size={24} /> Repetir</button>
                    <button className="btn-secondary" onClick={handleGenerateMelody}><RefreshCw size={24} /> Nueva</button>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', width: '100%', overflowX: 'auto' }}>
                    <ScoreRenderer notes={userNotes} width={800} />
                </div>
            </div>

            <div className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>1. Duración</h3>
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
                                }}
                            >
                                {d.icon}
                            </button>
                        ))}
                        <button
                            onClick={addRest}
                            className="btn-secondary"
                            style={{ marginLeft: '1rem', fontWeight: 'bold' }}
                        >
                            Silencio
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>2. Notas</h3>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => (
                            <div key={note} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <button
                                    onClick={() => addNote(note + '5')}
                                    className="btn-secondary"
                                    style={{ width: '3rem', height: '4rem', backgroundColor: 'white' }}
                                >
                                    {note}5
                                </button>
                                <button
                                    onClick={() => addNote(note + '4')}
                                    className="btn-secondary"
                                    style={{ width: '3rem', height: '4rem', backgroundColor: 'white' }}
                                >
                                    {note}4
                                </button>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                        {/* Accidentals row */}
                        {['C#', 'D#', 'F#', 'G#', 'A#'].map(note => (
                            <button
                                key={note}
                                onClick={() => addNote(note + '4')}
                                className="btn-secondary"
                                style={{ width: '3rem', height: '3rem', backgroundColor: '#333', color: 'white' }}
                            >
                                {note}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={removeLastNote} style={{ color: 'var(--error)' }}><Delete size={20} /></button>
                    <button className="btn-primary" onClick={checkAnswer}>Comprobar</button>
                </div>
            </div>

            {feedback && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: feedback === 'correct' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: feedback === 'correct' ? 'var(--success)' : 'var(--error)',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    {feedback === 'correct' ? '¡Correcto!' : 'Incorrecto, inténtalo de nuevo'}
                </div>
            )}
        </div>
    );
}
