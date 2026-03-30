import { useNavigate } from "react-router-dom";
import { cn, getMediaUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface TestSubject {
    id: string;
    subjectId: number;
    icon: any;
    name: string;
    testsAvailable: number;
    completed: number;
    total: number;
    difficulty: "Easy" | "Moderate" | "Hard";
    iconBg: string;
}

interface SubjectWiseViewProps {
    subjects: TestSubject[];
}

export const SubjectWiseView = ({ subjects }: SubjectWiseViewProps) => {
    const navigate = useNavigate();

    const handleSubjectClick = (subject: TestSubject) => {
        navigate(`/test-series/subject/${subject.subjectId}/roadmap?name=${encodeURIComponent(subject.name)}`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4 mb-12">
            {subjects.map((subject, index) => (
                <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col aspect-square relative group"
                >
                    {/* Header: Icon + Title */}
                    <div className="flex flex-col items-center text-center gap-3 mb-4">
                        <div className="w-14 h-14 shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                            {typeof subject.icon === 'string' ? (
                                <img src={getMediaUrl(subject.icon)} alt={subject.name} className="w-48  object-contain" />
                            ) : (
                                <div className={cn("w-full h-full rounded-2xl flex items-center justify-center text-slate-600", subject.iconBg)}>
                                    {subject.icon}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-lg font-medium text-slate-900 tracking-tight leading-tight">
                                {subject.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2 mt-1.5">
                                <p className="text-slate-400 text-[11px] font-medium ">
                                    {subject.testsAvailable} Tests
                                </p>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <p className="text-sky-600 text-[11px] font-medium ">
                                    {subject.completed}/{subject.total} Completed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Badge - More compact */}
                    <div className="flex justify-center mb-4">
                        {/* <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold",
                            subject.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                                subject.difficulty === "Moderate" ? "bg-amber-50 text-amber-600" :
                                    "bg-rose-50 text-rose-600"
                        )}>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                subject.difficulty === "Easy" ? "bg-emerald-500" :
                                    subject.difficulty === "Moderate" ? "bg-amber-500" :
                                        "bg-rose-500"
                            )} />
                            {subject.difficulty}
                        </div> */}
                    </div>

                    {/* Compact action button at the bottom */}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSubjectClick(subject);
                        }}
                        className="w-full h-11 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-xl text-sm font-medium shadow-sm transition-all active:scale-[0.98] mt-auto"
                    >
                        Select
                    </Button>
                </motion.div>
            ))}
        </div>
    );
};
