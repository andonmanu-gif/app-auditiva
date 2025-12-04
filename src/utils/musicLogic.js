// Music Theory Constants
export const SCALES = {
    'C Major': { root: 'C', type: 'major', accidentals: [] },
    'G Major': { root: 'G', type: 'major', accidentals: ['F#'] },
    'F Major': { root: 'F', type: 'major', accidentals: ['Bb'] },
    'D Major': { root: 'D', type: 'major', accidentals: ['F#', 'C#'] },
    'Bb Major': { root: 'Bb', type: 'major', accidentals: ['Bb', 'Eb'] },
    'A Minor': { root: 'A', type: 'minor', accidentals: [] },
    'E Minor': { root: 'E', type: 'minor', accidentals: ['F#'] },
    'D Minor': { root: 'D', type: 'minor', accidentals: ['Bb'] },
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DURATIONS = [
    { value: 'w', beats: 4 },
    { value: 'h', beats: 2 },
    { value: 'q', beats: 1 },
    { value: '8', beats: 0.5 },
];

// Helper to get scale notes
const getScaleNotes = (keyName) => {
    const scale = SCALES[keyName];
    const rootIndex = NOTES.indexOf(scale.root);
    const intervals = scale.type === 'major'
        ? [0, 2, 4, 5, 7, 9, 11]
        : [0, 2, 3, 5, 7, 8, 10]; // Natural minor

    return intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex];
    });
};

export const generateRhythm = (numBars = 2, timeSignature = '4/4') => {
    const beatsPerBar = 4;
    const totalBeats = numBars * beatsPerBar;
    let currentBeats = 0;
    const rhythm = [];

    while (currentBeats < totalBeats) {
        const remainingBeats = totalBeats - currentBeats;

        // Filter durations that fit
        const validDurations = DURATIONS.filter(d => d.beats <= remainingBeats);

        // Prefer quarter and eighth notes for interest
        const randomDuration = validDurations[Math.floor(Math.random() * validDurations.length)];

        // 15% chance of rest, but not for whole notes
        const isRest = Math.random() < 0.15 && randomDuration.value !== 'w';

        rhythm.push({
            duration: randomDuration.value,
            beats: randomDuration.beats,
            isRest: isRest
        });

        currentBeats += randomDuration.beats;
    }

    return rhythm;
};

export const generateMelody = (keyName) => {
    const rhythm = generateRhythm(2);
    const scaleNotes = getScaleNotes(keyName);

    // Range: C4 to C5 (approx)
    // We need to map scale notes to specific octaves
    const availablePitches = [];

    // Generate pitches for octave 4
    scaleNotes.forEach(note => availablePitches.push(note + '4'));
    // Add a few from octave 5
    scaleNotes.forEach(note => {
        if (['C', 'D', 'E'].includes(note)) availablePitches.push(note + '5');
    });

    return rhythm.map(note => {
        if (note.isRest) {
            return {
                keys: ['b/4'], // VexFlow rest position
                duration: note.duration + 'r', // VexFlow rest notation
                pitch: null,
                isRest: true
            };
        }

        const randomPitch = availablePitches[Math.floor(Math.random() * availablePitches.length)];

        // Format for VexFlow: C#4 -> c#/4
        const vexKey = randomPitch.toLowerCase().replace(/(\w+)(\d)/, '$1/$2');

        return {
            keys: [vexKey],
            duration: note.duration,
            pitch: randomPitch,
            isRest: false
        };
    });
};
