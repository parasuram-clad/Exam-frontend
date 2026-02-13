// Import study plan images
import studyPlan1 from "@/assets/study-plan1.png";

export const topicContent = {
    "tamil-nadu-history": {
        "sangam-period": {
            title: "Sangam Period",
            description: "Early Tamil society, culture, and political structure",
            image: studyPlan1,
            totalSections: 8,
            completedSections: 2,
            sections: [
                {
                    id: 1,
                    title: "Historical Sources & Epochs",
                    type: "reading",
                    duration: "10 min",
                    completed: true,
                    content: {
                        introduction: "The Sangam period (approx. 300 BCE - 300 CE) represents the foundations of Tamil civilization. It is characterized by the assembly (Sangam) of poets and the unique Tinai landscape system.",
                        keyPoints: [
                            {
                                title: "Epigraphical Evidence",
                                details: [
                                    {
                                        title: "Asokan Inscriptions",
                                        details: ["Mentioned Chera, Chola, and Pandya as independent neighbors.", "Establishment of diplomatic ties with Southern kingdoms."]
                                    },
                                    {
                                        title: "Hathigumpha Inscription",
                                        details: ["Indicates the existence of a 'Tamil League' of kingdoms.", "Mentions King Kharavela's campaign against Southern powers."]
                                    }
                                ]
                            },
                            {
                                title: "Archaeological Findings",
                                details: [
                                    {
                                        title: "Arikamedu",
                                        details: ["Indo-Roman trading post near Pondicherry.", "Amphorae, Arretine ware, and Roman coins found."]
                                    },
                                    {
                                        title: "Adichanallur",
                                        details: ["Iron-age megalithic burial site.", "Gold ornaments and bronze artifacts discovered."]
                                    }
                                ]
                            }
                        ],
                        keyTerms: [
                            { term: "Sangam", definition: "Academy or assembly of Tamil poets and scholars under royal patronage." },
                            { term: "Tamilakam", definition: "The socio-cultural region comprising modern Tamil Nadu, Kerala, and parts of Karnataka/Andhra." }
                        ],
                        detailedNotes: [
                            {
                                heading: "The Three Sangams (Muchchangam)",
                                content: "Tradition speaks of three Sangams: The First (Mudal), Second (Idai), and Third (Kadai). While the first two are largely legendary, the Third Sangam at Madurai is historical and produced the extant literature.",
                                subtopics: [
                                    { title: "First Sangam", content: "Held at Then-Madurai (South Madurai). Attended by gods and legendary sages." },
                                    { title: "Second Sangam", content: "Held at Kapatapuram. Tolkappiyam is the only surviving work from this era." },
                                    { title: "Third Sangam", content: "Held at Modern Madurai. Produced the Eight Anthologies and Ten Idyls." }
                                ],
                                pyqs: [
                                    { year: "2020", question: "Which Sangam produced the currently available literature?", answer: "The Third Sangam." }
                                ]
                            },
                            {
                                heading: "Literary Sources",
                                content: "The main sources are the Eight Anthologies (Ettuthogai), Ten Idyls (Pattupattu), and the grammar work Tolkappiyam. These provide vivid descriptions of wars, social life, and nature.",
                                pyqs: [
                                    { year: "2022", question: "Which is the earliest surviving work of Tamil grammar?", answer: "Tolkappiyam." }
                                ]
                            }
                        ],
                        importantDates: [
                            { year: "300 BCE", event: "Beginning of the Early Historical Period" },
                            { year: "150 BCE", event: "Asokan inscriptions mention Tamil kingdoms" },
                            { year: "300 CE", event: "End of the classic Sangam Age" }
                        ]
                    }
                },
                {
                    id: 2,
                    title: "The Muvendar (Three Crowns)",
                    type: "reading",
                    duration: "12 min",
                    completed: true,
                    content: {
                        introduction: "Tamilakam was governed by three great lineages: Cheras, Cholas, and Pandyas. These kings were known as Muvendar.",
                        keyPoints: [
                            {
                                title: "The Cheras (Keralaputras)",
                                details: [
                                    {
                                        title: "Identity",
                                        details: ["Capital: Vanchi (Karur)", "Port: Musiri and Thondi", "Symbol: Bow and Arrow"]
                                    },
                                    {
                                        title: "Cheran Senguttuvan",
                                        details: ["The 'Red Chera' who built a temple for Kannagi (Pattini cult).", "Said to have reached the Himalayas."]
                                    }
                                ]
                            },
                            {
                                title: "The Cholas",
                                details: [
                                    {
                                        title: "Identity",
                                        details: ["Capital: Uraiyur", "Port: Puhar (Kaveripattinam)", "Symbol: Tiger"]
                                    },
                                    {
                                        title: "Karikala Chola",
                                        details: ["Defeated Cheras and Pandyas at the Battle of Venni.", "Built the Kallanai (Grand Anicut) across Kaveri."]
                                    }
                                ]
                            },
                            {
                                title: "The Pandyas",
                                details: [
                                    {
                                        title: "Identity",
                                        details: ["Capital: Madurai", "Port: Korkai (famed for pearls)", "Symbol: Fish"]
                                    },
                                    {
                                        title: "Nedunchezhian",
                                        details: ["A great warrior mentioned in Maduraikkanchi.", "Known for the Talaiyalanganam battle victory."]
                                    }
                                ]
                            }
                        ],
                        keyTerms: [
                            { term: "Muvendar", definition: "The 'Three Great Kings' (title used for Chera, Chola, and Pandya)." },
                            { term: "Velir", definition: "Lesser chieftains who often challenged the Muvendar." }
                        ],
                        detailedNotes: [
                            {
                                heading: "Royal Insignia and Titles",
                                content: "Kings took grandiose titles like Vendan, Ko, and Irai. Each dynasty had a specific flower garland, port, and royal emblem that defined their identity in the Sangam world.",
                                subtopics: [
                                    { title: "Chera Symbols", content: "Garland: Palm flower; Port: Musiri; Emblem: Bow and Arrow." },
                                    { title: "Chola Symbols", content: "Garland: Fig (Atthi) flower; Port: Puhar; Emblem: Tiger." },
                                    { title: "Pandya Symbols", content: "Garland: Neem (Margosa) flower; Port: Korkai; Emblem: Fish." }
                                ],
                                pyqs: [
                                    { year: "2018", question: "Which flower was associated with the Pandya kings?", answer: "Margosa (Neem)." }
                                ]
                            },
                            {
                                heading: "Administrative Structure",
                                content: "The king was assisted by two councils: Aimperunkulu (Council of Five) and Enperayam (Council of Eight). The kingdom was divided into Mandalam, Nadu, and Ur.",
                                pyqs: [
                                    { year: "2021", question: "What was the Aimperunkulu?", answer: "A five-member advisory council to the king." }
                                ]
                            }
                        ]
                    }
                },
                {
                    id: 3,
                    title: "Five Landscapes (Tinai)",
                    type: "reading",
                    duration: "10 min",
                    completed: false,
                    content: {
                        introduction: "The uniqueness of Sangam society lies in its ecological classification of land into five Tinai (landscapes).",
                        keyPoints: [
                            {
                                title: "The Five Tinais",
                                details: [
                                    {
                                        title: "Kurinji (Hilly)",
                                        details: ["Deity: Murugan", "Occupation: Hunting/Honey gathering"]
                                    },
                                    {
                                        title: "Mullai (Pastoral)",
                                        details: ["Deity: Mayon (Vishnu)", "Occupation: Cattle rearing"]
                                    },
                                    {
                                        title: "Marutham (Agricultural)",
                                        details: ["Deity: Indiran", "Occupation: Agriculture"]
                                    },
                                    {
                                        title: "Neithal (Coastal)",
                                        details: ["Deity: Varunan", "Occupation: Fishing/Salt making"]
                                    },
                                    {
                                        title: "Paalai (Desert)",
                                        details: ["Deity: Korravai", "Occupation: Robbery/Warrior"]
                                    }
                                ]
                            }
                        ],
                        detailedNotes: [
                            {
                                heading: "Ecological Determinism",
                                content: "Each landscape had its own flower, animal, bird, and music (yazh). This shows the deep connection between people and nature in ancient Tamilakam.",
                                pyqs: [
                                    { year: "2019", question: "Who was the deity of the Marutham region?", answer: "Indiran." }
                                ]
                            }
                        ]
                    }
                },
                {
                    id: 4,
                    title: "Economy and Foreign Trade",
                    type: "reading",
                    duration: "15 min",
                    completed: false,
                    content: {
                        introduction: "Sangam age was marked by flourishing internal and external trade, especially with the Roman Empire.",
                        keyPoints: [
                            {
                                title: "Trade Commodities",
                                details: [
                                    {
                                        title: "Exports",
                                        details: ["Spices (Pepper - 'Yavana Priya')", "Pearls from Korkai", "Fine muslin and silk"]
                                    },
                                    {
                                        title: "Imports",
                                        details: ["Gold and Silver coins", "Wine and glass", "Horses from Arabia"]
                                    }
                                ]
                            }
                        ],
                        detailedNotes: [
                            {
                                heading: "The Roman Connection",
                                content: "Roman writers like Pliny and Ptolemy mention Tamil ports. Pliny complained that Rome's wealth was drained by the purchase of Indian spices. Roman gold coins have been found in abundance in Coimbatore and Madurai.",
                                pyqs: [
                                    { year: "2017", question: "Which Roman writer mentioned the drain of wealth by purchase of spices?", answer: "Pliny the Elder." }
                                ]
                            },
                            {
                                heading: "Guilds and Markets",
                                content: "Markets were called Angadi. Day markets (Nalangadi) and evening markets (Allangadi) were common. Trade guilds ensured quality and standard weights.",
                                pyqs: [
                                    { year: "2020", question: "What was a Nalangadi?", answer: "A day-time market." }
                                ]
                            }
                        ]
                    }
                },
                {
                    id: 5,
                    title: "Society and Culture",
                    type: "reading",
                    duration: "10 min",
                    completed: false,
                    content: {
                        introduction: "Society was diverse, with a mix of indigenous beliefs and emerging Vedic influences.",
                        keyPoints: [
                            {
                                title: "Social Stratification",
                                details: [
                                    {
                                        title: "Caste System",
                                        details: ["Traditional Varna system was not rigid.", "Classification was based on occupation (Panar, Parathayar, etc.)."]
                                    }
                                ]
                            },
                            {
                                title: "Status of Women",
                                details: [
                                    {
                                        title: "Educated Women",
                                        details: ["Poets like Avvaiyar, Vellividiyar, and Nachellaiyar.", "Women participated in social gatherings."]
                                    },
                                    {
                                        title: "Customs",
                                        details: ["Karpu (Chastity) was considered a high virtue.", "Sati was practiced by royal households (Sati of Kopperuncholan's wife)."]
                                    }
                                ]
                            }
                        ],
                        detailedNotes: [
                            {
                                heading: "Religious Beliefs",
                                content: "Primary deity was Murugan ('Seyon'). Worship of hero stones (Nadukal) was prevalent to honor fallen soldiers. Animism and ancestor worship were fundamental.",
                                pyqs: [
                                    { year: "2019", question: "What was a Nadukal?", answer: "A hero stone raised for soldiers who died in battle." }
                                ]
                            }
                        ]
                    }
                },
                {
                    id: 6,
                    title: "Sangam Literature Deep Dive",
                    type: "reading",
                    duration: "20 min",
                    completed: false,
                    content: {
                        introduction: "Known as the golden age of Tamil literature, this period produced secular and highly descriptive poetry.",
                        keyPoints: [
                            {
                                title: "Major Classifications",
                                details: [
                                    {
                                        title: "Aham and Puram",
                                        details: ["Aham: Inner world (love, emotions).", "Puram: Outer world (war, kings, charity)."]
                                    }
                                ]
                            },
                            {
                                title: "The Twin Epics",
                                details: [
                                    {
                                        title: "Silappathikaram",
                                        details: ["Written by Ilango Adigal.", "Story of Kannagi and Kovalan."]
                                    },
                                    {
                                        title: "Manimekalai",
                                        details: ["Written by Sathanar.", "A Buddhist epic focusing on Kovalan's daughter."]
                                    }
                                ]
                            }
                        ],
                        detailedNotes: [
                            {
                                heading: "Patinenmelkanakku",
                                content: "Consists of Ettuthogai (8 Anthologies) and Pattupattu (10 Idyls). These are the earliest strata of literature.",
                                pyqs: [
                                    { year: "2021", question: "Name one of the Eight Anthologies.", answer: "Ainguru-nuru, Purananuru, etc." }
                                ]
                            },
                            {
                                heading: "Pathinekilkanakku",
                                content: "Eighteen shorter works, mostly didactic (moralistic). The most famous is Tirukkural by Tiruvalluvar.",
                                pyqs: [
                                    { year: "2023", question: "To which classification does Tirukkural belong?", answer: "Pathinekilkanakku." }
                                ]
                            }
                        ]
                    }
                },
                {
                    id: 7,
                    title: "End of the Sangam Age",
                    type: "reading",
                    duration: "8 min",
                    completed: false,
                    content: {
                        introduction: "The decline of the Muvendar led to the arrival of the Kalabhras.",
                        keyPoints: [
                            {
                                title: "The Kalabhra Interregnum",
                                details: [
                                    {
                                        title: "Arrival",
                                        details: ["Around 300 CE, the Kalabhras occupied Tamilakam.", "They were often described as 'evil rulers' by later bhakti poets."]
                                    },
                                    {
                                        title: "Contribution",
                                        details: ["Despite the negative press, Jainism and Buddhism flourished during their time.", "Literary activity continued."]
                                    }
                                ]
                            }
                        ],
                        detailedNotes: [
                            {
                                heading: "Transition to Bhakti Era",
                                content: "The Kalabhra period ended with the rise of the Pallavas in the North and Pandyas in the South around 6th Century CE.",
                                pyqs: [
                                    { year: "2016", question: "Which tribe's rule is known as the dark period in Tamil history?", answer: "Kalabhras." }
                                ]
                            }
                        ]
                    }
                },
                {
                    id: 8,
                    title: "Final Assessment",
                    type: "quiz",
                    duration: "10 min",
                    completed: false,
                    questions: [
                        { id: 1, question: "Which Sangam port was famous for pearls?", options: ["Musiri", "Korkai", "Puhar", "Vanchi"], correctAnswer: 1 },
                        { id: 2, question: "What was the emblem of the Chola kingdom?", options: ["Fish", "Tiger", "Bow", "Lion"], correctAnswer: 1 },
                        { id: 3, question: "Which literary work is known as the first Tamil grammar?", options: ["Purananuru", "Tolkappiyam", "Tirukkural", "Silappathikaram"], correctAnswer: 1 },
                        { id: 4, question: "Who was the 'Red Chera'?", options: ["Nedunjeralathan", "Senguttuvan", "Elara", "Nedunchezhian"], correctAnswer: 1 },
                        { id: 5, question: "The deity of Kurinji landscape was:", options: ["Mayon", "Murugan", "Indiran", "Varunan"], correctAnswer: 1 },
                        { id: 6, question: "Which epic was written by Ilango Adigal?", options: ["Manimekalai", "Silappathikaram", "Cudamani", "Kundalakesi"], correctAnswer: 1 },
                        { id: 7, question: "What does 'Yavana Priya' refer to?", options: ["Silk", "Gold", "Pepper", "Muslin"], correctAnswer: 2 },
                        { id: 8, question: "The day-time market was known as:", options: ["Allangadi", "Nalangadi", "Perangadi", "Sitrangadi"], correctAnswer: 1 },
                        { id: 9, question: "The battle of Venni was victory for:", options: ["Karikala Chola", "Nedunchezhian", "Senguttuvan", "Kharavela"], correctAnswer: 0 },
                        { id: 10, question: "Who wrote Manimekalai?", options: ["Ilango Adigal", "Sathanar", "Tiruvalluvar", "Kapilar"], correctAnswer: 1 }
                    ]
                }
            ]
        },
        "medieval-kingdoms": {
            title: "Medieval Kingdoms",
            description: "The era of Imperial Cholas and Pallavas.",
            image: studyPlan1,
            totalSections: 2,
            completedSections: 0,
            sections: [
                {
                    id: 1,
                    title: "The Pallava Heritage",
                    type: "reading",
                    duration: "10 min",
                    completed: false,
                    content: {
                        introduction: "Founders of the Dravidian style of architecture.",
                        keyPoints: [
                            {
                                title: "Artistic Brilliance",
                                details: [
                                    {
                                        title: "Structural Evolution",
                                        details: ["Mahendra style (Rock-cut)", "Mamalla style (Monolithic)"]
                                    }
                                ]
                            }
                        ],
                        keyTerms: [
                            { term: "Ratha", definition: "A monolithic temple carved out of a single rock." }
                        ],
                        detailedNotes: [
                            {
                                heading: "Mahabalipuram",
                                content: "The monolithic Rathas represent the peak of Pallava art.",
                                pyqs: [
                                    { year: "2022", question: "Which dynasty built the Shore Temple?", answer: "Pallavas." }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    }
} as const;
