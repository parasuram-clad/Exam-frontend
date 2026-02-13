import { Play } from "lucide-react";

const VideoSection = () => {
    return (
        <section className="py-16 px-4 bg-[#f8faf8]">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-medium  sm:text-4xl text-gray-900 mb-8">
                    Your Preparation, <span className="text-[#4FAA60]">Step by Step</span>
                </h2>

                <div className="bg-gray-900 rounded-3xl aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoSection;
