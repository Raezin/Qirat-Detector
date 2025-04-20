// Grading system definitions
const gradeScale = [
    { threshold: 90, grade: "A" },
    { threshold: 75, grade: "B" },
    { threshold: 50, grade: "C" },
    { threshold: 0,  grade: "D" }
];

// Main grading function
function gradeRecitation(transcription, surahKey, startIndex, quranData) {
    if (!transcription || !surahKey || startIndex == null || !quranData[surahKey]) {
        return {
            completeness: { percentage: 0, grade: "D", reason: "Missing data or failed transcription" },
            accuracy: { percentage: 0, grade: "D", reason: "Missing data or failed transcription" }
        };
    }

    // 🔹 Get expected ayahs and normalize
    const expectedAyahs = quranData[surahKey].ayahs.slice(startIndex, startIndex + 5);
    const expectedText = expectedAyahs.join(" ").replace(/[^\w\sء-ي]/g, "").toLowerCase();
    const transcribedText = transcription.replace(/[^\w\sء-ي]/g, "").toLowerCase();

    // 🔹 Completeness: how much of the expected text is included
    const completenessPercentage = calculateCompleteness(expectedText, transcribedText);
    const completenessGrade = getGradeFromPercentage(completenessPercentage);
    
    // 🔹 Accuracy: how much of the transcribed text matches expected words
    const accuracyPercentage = calculateWordMatchRatio(expectedText, transcribedText) * 100;
    const accuracyGrade = getGradeFromPercentage(accuracyPercentage);

    return {
        completeness: {
            percentage: completenessPercentage,
            grade: completenessGrade,
            reason: `درستگیٔ تلاوت: ${completenessPercentage.toFixed(1)}%`
        },
        accuracy: {
            percentage: accuracyPercentage,
            grade: accuracyGrade,
            reason: `مخارج الحروف: ${accuracyPercentage.toFixed(1)}%`
        }
    };
}

// Calculate how much of expected text appears in transcription
function calculateCompleteness(expected, transcribed) {
    const expectedWords = expected.split(/\s+/);
    const transcribedWords = transcribed.split(/\s+/);

    let matched = 0;
    expectedWords.forEach(word => {
        if (transcribedWords.includes(word)) matched++;
    });

    return (matched / expectedWords.length) * 100;
}


// Calculate how many words match
function calculateWordMatchRatio(expected, transcribed) {
    const expectedWords = expected.split(/\s+/);
    const transcribedWords = transcribed.split(/\s+/);

    let matched = 0;
    expectedWords.forEach(word => {
        if (transcribedWords.includes(word)) matched++;
    });

    return matched / expectedWords.length;
}

// Get grade from percentage
function getGradeFromPercentage(percent) {
    for (let i = 0; i < gradeScale.length; i++) {
        if (percent >= gradeScale[i].threshold) {
            return gradeScale[i].grade;
        }
    }
    return "D";
}

// Display both grades in UI
function displayGrade(grades) {
    const gradeDiv = document.getElementById("grade-display");
    gradeDiv.innerHTML = `
        <strong>درستگیٔ تلاوت:</strong> ${grades.completeness.percentage.toFixed(1)}% – Grade ${grades.completeness.grade}<br>
        <strong>مخارج الحروف:</strong> ${grades.accuracy.percentage.toFixed(1)}% – Grade ${grades.accuracy.grade}
    `;
}
