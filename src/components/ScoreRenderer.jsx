import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

const ScoreRenderer = ({ notes, timeSignature = '4/4', width = 500, height = 200 }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous render
        containerRef.current.innerHTML = '';

        const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);

        renderer.resize(width, height);
        const context = renderer.getContext();

        // Create a stave at position 10, 40 of width 400 on the canvas.
        const stave = new Stave(10, 40, width - 20);

        // Add a clef and time signature.
        stave.addClef("treble").addTimeSignature(timeSignature);

        // Connect it to the context and draw!
        stave.setContext(context).draw();

        if (notes && notes.length > 0) {
            // Create voice
            const voice = new Voice({ num_beats: 4, beat_value: 4 });

            // Convert simple note objects to VexFlow StaveNotes
            // Expected format: { keys: ["c/4"], duration: "q" }
            const vexNotes = notes.map(n => {
                const note = new StaveNote({ keys: n.keys, duration: n.duration });
                if (n.keys[0].includes('#')) note.addModifier(new Accidental('#'));
                if (n.keys[0].includes('b')) note.addModifier(new Accidental('b'));
                return note;
            });

            // Add notes to voice
            // Note: This assumes the notes fill the measure exactly for now. 
            // In a real app, we'd need more complex logic to handle partial measures or multiple measures.
            try {
                voice.addTickables(vexNotes);

                // Format and justify the notes to 400 pixels.
                new Formatter().joinVoices([voice]).format([voice], width - 50);

                // Render voice
                voice.draw(context, stave);
            } catch (e) {
                console.error("VexFlow rendering error:", e);
            }
        }
    }, [notes, timeSignature, width, height]);

    return <div ref={containerRef} />;
};

export default ScoreRenderer;
