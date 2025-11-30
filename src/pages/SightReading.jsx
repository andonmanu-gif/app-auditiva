import React, { useState, useEffect } from 'react';
import ScoreRenderer from '../features/sight-reading/ScoreRenderer';
import { RefreshCw } from 'lucide-react';

const NOTES = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'];

export default function SightReading() {
    const [score, setScore] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);

    const generateScore = () => {
        // Generate 4 random notes
        const newScore = Array(4).fill(null).map(() => {
            const note = NOTES[Math.floor(Math.random() * NOTES.length)];
            return `${note}:q`;
        });
        setScore(newScore);
        setUserAnswer('');
        setFeedback(null);
    };

    const checkAnswer = () => {
        // Map English note names to Solfège
        const noteMap = {
            'C': 'DO',
            'D': 'RE',
            'E': 'MI',
            'F': 'FA',
            'G': 'SOL',
            'A': 'LA',
            'B': 'SI'
        };

        // Extract note names from score and convert to Solfège
        const correctNotes = score.map(s => {
            const noteLetter = s.split('/')[0].toUpperCase();
            return noteMap[noteLetter];
        });

        // Clean user input: remove spaces, commas, convert to uppercase
        const userNotes = userAnswer
            .toUpperCase()
            .replace(/[,]/g, ' ')
            .split(/\s+/)
            .filter(n => n.length > 0);

        // Compare
        const isCorrect = correctNotes.length === userNotes.length &&
            correctNotes.every((val, index) => val === userNotes[index]);

        if (isCorrect) {
            setFeedback({ type: 'success', message: '¡Correcto! Muy bien hecho.' });
        } else {
            setFeedback({
                type: 'error',
                message: `Incorrecto. La respuesta era: ${correctNotes.join(' ')}`
            });
        }
    };

    useEffect(() => {
        generateScore();
    }, []);

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1>Lectura a Primera Vista</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Identifica las notas que aparecen en la partitura.</p>
            </div>

            <div className="card" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
                <ScoreRenderer notes={score} width={400} height={150} />
            </div>

            <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ fontWeight: 'bold' }}>Escribe las notas (ej: Do Re Mi):</label>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Separa con espacios"
                    style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        fontSize: '1rem'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                />

                {feedback && (
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: feedback.type === 'success' ? '#166534' : '#991b1b',
                        textAlign: 'center'
                    }}>
                        {feedback.message}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        onClick={checkAnswer}
                        style={{ flex: 1 }}
                    >
                        Comprobar
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={generateScore}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RefreshCw size={20} />
                        Nueva
                    </button>
                </div>
            </div>
        </div>
    );
}
