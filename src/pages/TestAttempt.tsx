import { useParams, useNavigate } from "react-router-dom";
import TestEngine, { Question, Answer } from "@/components/TestEngine";

// Generate 100 sample questions (matching original behavior)
const generateQuestions = (): Question[] => {
    const categories = ["Aptitude", "General Knowledge", "Reasoning", "English"];
    const difficulties: ("Easy" | "Medium" | "Hard")[] = ["Easy", "Medium", "Hard"];

    return Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        text: i === 0
            ? "If a train travels at 60 km/h for 2 hours, how far does it go? This is a sample aptitude question to test logical reasoning and mathematical ability."
            : `Sample question ${i + 1} for testing purposes. This is a placeholder question.`,
        options: [
            i === 0 ? "120 km" : `Option A for Q${i + 1}`,
            i === 0 ? "100 km" : `Option B for Q${i + 1}`,
            i === 0 ? "140 km" : `Option C for Q${i + 1}`,
            i === 0 ? "80 km" : `Option D for Q${i + 1}`,
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        category: categories[i % categories.length],
        difficulty: difficulties[i % difficulties.length],
    }));
};

const TestAttempt = () => {
    const { subject, testId } = useParams<{ subject: string; testId: string }>();
    const navigate = useNavigate();
    const questions = generateQuestions();

    const handleComplete = (answers: Record<number, Answer>) => {
        // Calculate score (simplified as in original)
        console.log("Answers submitted:", answers);
        navigate(`/test-series/${subject}/test/${testId}/analytics`, { replace: true });
    };

    const handleExit = () => {
        if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
            // Navigate directly back to the main test series page
            navigate("/test-series");
        }
    };

    return (
        <TestEngine
            questions={questions}
            onComplete={handleComplete}
            onExit={handleExit}
            title={`${subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "History"} – Test ${testId || "01"}`}
            subtitle="2 Hours • 100 Questions"
            initialTime={7200}
        />
    );
};

export default TestAttempt;

