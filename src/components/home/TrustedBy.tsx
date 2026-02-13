import AU from "@/assets/trusted/AU.png";
import IIT from "@/assets/trusted/IIT.png";
import MU from "@/assets/trusted/MU.png";
import UN from "@/assets/trusted/un.png";
import VIT from "@/assets/trusted/VIT.png";

const TrustedBy = () => {
    const logos = [
        { src: VIT, alt: "VIT" },
        { src: AU, alt: "Anna University" },
        { src: MU, alt: "Madras University" },
        { src: IIT, alt: "IIT Delhi" },
        { src: UN, alt: "University" },
    ];

    // Repeat logos for smooth scrolling
    const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

    return (
        <section
            className="py-12 sm:py-20 lg:py-28 overflow-hidden border-gray-100"
            style={{ background: 'linear-gradient(180deg, #F8FCF4 0%, #FFFFFF 100%)' }}
        >
            <div className="max-w-full mx-auto">
                <div className="flex items-center justify-between">

                    {/* Left Marquee - Logos moving towards the center (Right) */}
                    <div
                        className="flex-1 relative h-12 sm:h-24 lg:h-32 overflow-hidden"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent, black 20%, black 85%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 85%, transparent)'
                        }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 flex items-center">
                            <div className="flex animate-marquee-reverse whitespace-nowrap items-center gap-6 sm:gap-12 lg:gap-20 pr-4 sm:pr-10">
                                {duplicatedLogos.map((logo, index) => (
                                    <div key={`left-${index}`} className="flex-shrink-0">
                                        <img
                                            src={logo.src}
                                            alt={logo.alt}
                                            className="h-7 sm:h-14 lg:h-20 w-auto opacity-100 transition-all duration-300 transform hover:scale-110 object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center Title - Static */}
                    <div className="flex-none flex items-center gap-0 px-2 sm:px-4 z-20 bg-transparent">
                        <div className="w-1 sm:w-1.5 lg:w-2.5 h-8 sm:h-16 lg:h-28 bg-[#1a1c1e] rounded-full" />
                        <span className="text-lg sm:text-3xl lg:text-5xl font-medium text-gray-900 px-3 sm:px-6 lg:px-10 font-montserrat tracking-tight whitespace-nowrap">
                            Trusted By
                        </span>
                        <div className="w-1 sm:w-1.5 lg:w-2.5 h-8 sm:h-16 lg:h-28 bg-[#1a1c1e] rounded-full" />
                    </div>

                    {/* Right Marquee - Logos moving towards the center (Left) */}
                    <div
                        className="flex-1 relative h-12 sm:h-24 lg:h-32 overflow-hidden"
                        style={{
                            maskImage: 'linear-gradient(to left, transparent, black 20%, black 85%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to left, transparent, black 20%, black 85%, transparent)'
                        }}
                    >
                        <div className="absolute left-0 top-0 bottom-0 flex items-center">
                            <div className="flex animate-marquee whitespace-nowrap items-center gap-6 sm:gap-12 lg:gap-20 pl-4 sm:pl-10">
                                {duplicatedLogos.map((logo, index) => (
                                    <div key={`right-${index}`} className="flex-shrink-0">
                                        <img
                                            src={logo.src}
                                            alt={logo.alt}
                                            className="h-7 sm:h-14 lg:h-20 w-auto opacity-100 transition-all duration-300 transform hover:scale-110 object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
