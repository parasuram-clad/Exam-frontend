import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Play,
  Clock,
  Hash,
  X,
  Book,
  PenTool,
  History,
  Sparkles,
  Save,
  Edit3,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyQuizModal } from "@/components/dashboard/DailyQuizModal";

// Types from StudyInterface
type Mode = "reading" | "study" | "revision";
type BackgroundPreset = "light" | "warm" | "dark";

interface PYQ {
  id: string;
  examName: string;
  year: number;
  question: string;
  answer: string;
}

interface ContentSection {
  id: string;
  title: string;
  paragraphs: string[];
  keywords: string[];
  importantParagraphIndices?: number[]; // Indices of paragraphs that have PYQs
  pyqData?: { [paragraphIndex: number]: PYQ[] }; // PYQ data for each important paragraph
}

// Content sections for Tamil Nadu History provided by the USER
const contentSections: ContentSection[] = [
  {
    id: 'intro',
    title: 'History of Tamil Nadu: Ancient Kingdoms and Cultural Heritage',
    paragraphs: [
      'The history of Tamil Nadu is characterized by a rich tapestry of ancient kingdoms, sophisticated cultural developments, and significant contributions to Indian civilization. The region, known historically as Tamilakam, emerged as a distinct cultural and political entity in the early centuries of the Common Era. The geographical advantages of the Tamil region, including fertile river valleys and extensive coastlines, facilitated the development of powerful kingdoms that would shape South Indian history for millennia.'
    ],
    keywords: ['Tamil Nadu', 'Tamilakam', 'Ancient Kingdoms', 'Cultural Heritage']
  },
  {
    id: 'kingdoms',
    title: 'The Three Great Tamil Kingdoms',
    paragraphs: [
      'The three great Tamil kingdoms—the Cheras, Cholas, and Pandyas—dominated the political landscape of ancient South India. The Chera kingdom, centered in present-day Kerala and western Tamil Nadu, controlled crucial trade routes and was renowned for its maritime commerce. The Chola dynasty, with its heartland in the Kaveri delta, would eventually emerge as the most powerful, establishing one of the longest-ruling dynasties in world history. The Pandya kingdom, based in the southern regions around Madurai, was celebrated for its patronage of Tamil literature and learning.'
    ],
    keywords: ['Chera Kingdom', 'Chola Dynasty', 'Pandya Kingdom', 'Kaveri Delta', 'Madurai'],
    importantParagraphIndices: [0],
    pyqData: {
      0: [
        {
          id: 'pyq1',
          examName: 'TNPSC Group I',
          year: 2023,
          question: 'Which Tamil kingdom had its heartland in the Kaveri delta and became the most powerful dynasty in South Indian history?',
          answer: 'Chola Dynasty'
        },
        {
          id: 'pyq2',
          examName: 'TNPSC Group II',
          year: 2022,
          question: 'The Pandya kingdom was particularly known for its patronage of which aspect of Tamil culture?',
          answer: 'Tamil literature and learning'
        }
      ]
    }
  },
  {
    id: 'sangam',
    title: 'The Sangam Period',
    paragraphs: [
      'The Sangam period, spanning roughly from 300 BCE to 300 CE, represents a golden age of Tamil literature and culture. The term "Sangam" refers to the assembly or academy of Tamil poets and scholars who gathered under royal patronage. The corpus of Sangam literature, comprising over 2,000 poems, provides invaluable insights into the social, economic, and political life of ancient Tamil society. These works describe not only warfare and heroism but also intimate details of everyday life, trade practices, and social customs.'
    ],
    keywords: ['Sangam Period', 'Tamil Literature', 'Royal Patronage', 'Ancient Tamil Society'],
    importantParagraphIndices: [0],
    pyqData: {
      0: [
        {
          id: 'pyq3',
          examName: 'TNPSC Group II',
          year: 2024,
          question: 'What is the approximate time period of the Sangam era in Tamil history?',
          answer: '300 BCE to 300 CE'
        },
        {
          id: 'pyq4',
          examName: 'TNTET',
          year: 2023,
          question: 'The Sangam literature corpus comprises approximately how many poems?',
          answer: 'Over 2,000 poems'
        },
        {
          id: 'pyq5',
          examName: 'TNPSC Group I',
          year: 2022,
          question: 'What does the term "Sangam" literally refer to in the context of ancient Tamil history?',
          answer: 'Assembly or academy of Tamil poets and scholars'
        }
      ]
    }
  },
  {
    id: 'administration',
    title: 'Administrative System',
    paragraphs: [
      'The administrative system of the ancient Tamil kingdoms was highly organized and sophisticated. The territory was divided into various administrative units called nadus and kurrams, each governed by local assemblies. Village assemblies, known as sabhas and urs, played a crucial role in local governance, managing irrigation systems, settling disputes, and collecting taxes. This decentralized system of administration ensured efficient governance and allowed for considerable local autonomy, contributing to political stability.'
    ],
    keywords: ['Administrative System', 'Nadus', 'Kurrams', 'Village Assemblies', 'Local Governance'],
    importantParagraphIndices: [0],
    pyqData: {
      0: [
        {
          id: 'pyq6',
          examName: 'TNPSC Group I',
          year: 2023,
          question: 'What were the local assemblies in ancient Tamil villages called?',
          answer: 'Sabhas and urs'
        },
        {
          id: 'pyq7',
          examName: 'TNPSC VAO',
          year: 2022,
          question: 'The administrative units "nadus" and "kurrams" were characteristic of which historical period in Tamil Nadu?',
          answer: 'Ancient Tamil kingdoms'
        }
      ]
    }
  },
  {
    id: 'trade',
    title: 'Maritime Trade and Commerce',
    paragraphs: [
      'Maritime trade formed the backbone of the Tamil economy, with Tamil merchants establishing trade links across the Indian Ocean. Ancient Tamil ports such as Kaveripattinam, Korkai, and Muziris facilitated commerce with the Roman Empire, Southeast Asia, and China. Tamil traders exported precious stones, spices, pearls, and textiles, while importing gold, wine, and luxury goods. Evidence of this extensive trade network can be found in Roman coins discovered across Tamil Nadu and mentions of Tamil traders in classical Western sources.'
    ],
    keywords: ['Maritime Trade', 'Indian Ocean', 'Kaveripattinam', 'Roman Empire', 'Spice Trade'],
    importantParagraphIndices: [0],
    pyqData: {
      0: [
        {
          id: 'pyq8',
          examName: 'TNPSC Group I',
          year: 2023,
          question: 'Name the ancient Tamil ports that facilitated trade with the Roman Empire and Southeast Asia.',
          answer: 'Kaveripattinam, Korkai, and Muziris'
        },
        {
          id: 'pyq9',
          examName: 'TNPSC Group II',
          year: 2023,
          question: 'What evidence confirms the extensive trade network between ancient Tamil kingdoms and the Roman Empire?',
          answer: 'Roman coins discovered across Tamil Nadu and mentions of Tamil traders in classical Western sources'
        }
      ]
    }
  },
  {
    id: 'architecture',
    title: 'Temple Architecture',
    paragraphs: [
      'The evolution of temple architecture in Tamil Nadu represents one of the most significant achievements of Indian civilization. The Dravidian style of architecture, characterized by towering gopurams (gateway towers), pillared halls, and intricate sculptural programs, reached its zenith under the Chola dynasty. The great temples at Thanjavur, Gangaikondacholapuram, and Darasuram stand as masterpieces of medieval architecture, combining religious significance with extraordinary artistic and engineering accomplishments.'
    ],
    keywords: ['Temple Architecture', 'Dravidian Style', 'Gopurams', 'Thanjavur Temple', 'Chola Architecture']
  },
  {
    id: 'inscriptions',
    title: 'Tamil Inscriptions',
    paragraphs: [
      'Tamil inscriptions provide a wealth of information about the historical, social, and economic aspects of Tamil society. Carved on temple walls, copper plates, and stone monuments, these inscriptions document royal grants, temple endowments, administrative decisions, and social organizations. The inscriptions are invaluable primary sources for understanding land tenure systems, taxation policies, and the complex relationship between religious institutions and political authority. They also preserve crucial information about the development of the Tamil script and language.'
    ],
    keywords: ['Tamil Inscriptions', 'Temple Endowments', 'Land Tenure', 'Tamil Script', 'Primary Sources']
  },
  {
    id: 'cultural',
    title: 'Cultural Heritage',
    paragraphs: [
      'The cultural heritage of Tamil Nadu extends beyond political history to encompass remarkable achievements in literature, art, music, and philosophy. Tamil literature, one of the oldest continuous literary traditions in India, includes diverse genres ranging from devotional poetry to sophisticated grammatical treatises. The Tirukkural, a classical Tamil text on ethics and morality, continues to be studied and revered. The region also made significant contributions to Indian music and dance, with the Bharatanatyam dance form and Carnatic music having roots in Tamil cultural traditions.'
    ],
    keywords: ['Cultural Heritage', 'Tirukkural', 'Bharatanatyam', 'Carnatic Music', 'Tamil Poetry']
  },
  {
    id: 'bhakti',
    title: 'The Bhakti Movement',
    paragraphs: [
      'The Bhakti movement, which emphasized personal devotion to god over ritual orthodoxy, found fertile ground in Tamil Nadu. Tamil poet-saints called Nayanars and Alvars composed devotional hymns in Tamil that democratized religious practice and challenged rigid social hierarchies. Their compositions, characterized by intense emotional devotion and accessible language, had a profound impact not only on Tamil religion but on the broader development of Hinduism throughout India. The movement represented a significant shift toward vernacular religious expression.'
    ],
    keywords: ['Bhakti Movement', 'Nayanars', 'Alvars', 'Devotional Hymns', 'Religious Reform']
  },
  {
    id: 'economy',
    title: 'Economic Foundation',
    paragraphs: [
      'The economic foundation of ancient Tamil society rested primarily on agriculture, supplemented by trade and craft production. The fertile river valleys, particularly the Kaveri delta, supported intensive rice cultivation through sophisticated irrigation systems. Agricultural surplus enabled urbanization and the patronage of arts and learning. Village communities developed complex systems of water management, including tanks and canals, that required collective organization and maintenance. This agricultural prosperity, combined with maritime trade, created the economic conditions for the flourishing of Tamil civilization.'
    ],
    keywords: ['Agriculture', 'Irrigation Systems', 'Rice Cultivation', 'Water Management', 'Economic Prosperity']
  }
];

// Textbook-style infographic components
const ThreeKingdomsInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#60a5fa' : '#3b82f6';

  return (
    <div className="my-8 flex justify-center">
      <svg width="520" height="160" viewBox="0 0 520 160" className="max-w-full">
        <text x="260" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Three Great Tamil Kingdoms
        </text>
        <g>
          <rect x="20" y="45" width="140" height="90" rx="4" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="90" y="65" textAnchor="middle" fill={accentColor} fontSize="12" fontWeight="600">CHERA</text>
          <text x="90" y="82" textAnchor="middle" fill={textColor} fontSize="10">Kerala & West TN</text>
          <line x1="30" y1="90" x2="150" y2="90" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="90" y="105" textAnchor="middle" fill={textColor} fontSize="9">Trade Routes</text>
          <text x="90" y="118" textAnchor="middle" fill={textColor} fontSize="9">Maritime Commerce</text>
        </g>
        <g>
          <rect x="190" y="45" width="140" height="90" rx="4" fill="none" stroke={accentColor} strokeWidth="2" />
          <text x="260" y="65" textAnchor="middle" fill={accentColor} fontSize="12" fontWeight="600">CHOLA</text>
          <text x="260" y="82" textAnchor="middle" fill={textColor} fontSize="10">Kaveri Delta</text>
          <line x1="200" y1="90" x2="320" y2="90" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="260" y="105" textAnchor="middle" fill={textColor} fontSize="9">Most Powerful</text>
          <text x="260" y="118" textAnchor="middle" fill={textColor} fontSize="9">Longest Dynasty</text>
        </g>
        <g>
          <rect x="360" y="45" width="140" height="90" rx="4" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="430" y="65" textAnchor="middle" fill={accentColor} fontSize="12" fontWeight="600">PANDYA</text>
          <text x="430" y="82" textAnchor="middle" fill={textColor} fontSize="10">Madurai Region</text>
          <line x1="370" y1="90" x2="490" y2="90" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="430" y="105" textAnchor="middle" fill={textColor} fontSize="9">Tamil Literature</text>
          <text x="430" y="118" textAnchor="middle" fill={textColor} fontSize="9">Learning Center</text>
        </g>
        <line x1="40" y1="150" x2="480" y2="150" stroke={strokeColor} strokeWidth="1" markerEnd="url(#arrowhead)" />
        <text x="260" y="145" textAnchor="middle" fill={textColor} fontSize="9" opacity="0.7">Ancient South India</text>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={strokeColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const SangamTimelineInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#a78bfa' : '#8b5cf6';

  return (
    <div className="my-8 flex justify-center">
      <svg width="500" height="140" viewBox="0 0 500 140" className="max-w-full">
        <text x="250" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Sangam Period Timeline
        </text>
        <line x1="50" y1="70" x2="450" y2="70" stroke={strokeColor} strokeWidth="2" />
        <circle cx="50" cy="70" r="4" fill={accentColor} />
        <circle cx="450" cy="70" r="4" fill={accentColor} />
        <line x1="50" y1="70" x2="50" y2="50" stroke={accentColor} strokeWidth="1.5" />
        <text x="50" y="45" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="600">300 BCE</text>
        <line x1="250" y1="70" x2="250" y2="90" stroke={strokeColor} strokeWidth="1" />
        <circle cx="250" cy="70" r="3" fill={accentColor} />
        <text x="250" y="105" textAnchor="middle" fill={textColor} fontSize="10">Golden Age</text>
        <text x="250" y="118" textAnchor="middle" fill={textColor} fontSize="9">2,000+ Poems</text>
        <line x1="450" y1="70" x2="450" y2="50" stroke={accentColor} strokeWidth="1.5" />
        <text x="450" y="45" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="600">300 CE</text>
        <text x="250" y="135" textAnchor="middle" fill={textColor} fontSize="10" opacity="0.8">
          ~600 years of Tamil Literary Tradition
        </text>
      </svg>
    </div>
  );
};

const AdministrationHierarchyInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#34d399' : '#10b981';

  return (
    <div className="my-8 flex justify-center">
      <svg width="400" height="200" viewBox="0 0 400 200" className="max-w-full">
        <text x="200" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Administrative Hierarchy
        </text>
        <rect x="140" y="40" width="120" height="32" rx="3" fill="none" stroke={accentColor} strokeWidth="2" />
        <text x="200" y="60" textAnchor="middle" fill={textColor} fontSize="11" fontWeight="600">Kingdom</text>
        <line x1="200" y1="72" x2="200" y2="90" stroke={strokeColor} strokeWidth="1.5" markerEnd="url(#arrow1)" />
        <g>
          <rect x="60" y="95" width="100" height="30" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="110" y="113" textAnchor="middle" fill={textColor} fontSize="10">Nadus</text>
          <rect x="240" y="95" width="100" height="30" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="290" y="113" textAnchor="middle" fill={textColor} fontSize="10">Kurrams</text>
          <line x1="200" y1="90" x2="110" y2="95" stroke={strokeColor} strokeWidth="1" />
          <line x1="200" y1="90" x2="290" y2="95" stroke={strokeColor} strokeWidth="1" />
        </g>
        <line x1="110" y1="125" x2="110" y2="145" stroke={strokeColor} strokeWidth="1.5" markerEnd="url(#arrow2)" />
        <line x1="290" y1="125" x2="290" y2="145" stroke={strokeColor} strokeWidth="1.5" markerEnd="url(#arrow2)" />
        <g>
          <rect x="20" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="57.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Sabhas</text>
          <rect x="115" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="152.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Urs</text>
          <rect x="210" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="247.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Local</text>
          <rect x="305" y="150" width="75" height="28" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="342.5" y="167" textAnchor="middle" fill={textColor} fontSize="9">Assemblies</text>
        </g>
        <text x="200" y="193" textAnchor="middle" fill={textColor} fontSize="8" opacity="0.7">
          Decentralized system ensuring local autonomy
        </text>
        <defs>
          <marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill={strokeColor} />
          </marker>
          <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill={strokeColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const TradeNetworkInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#f59e0b' : '#d97706';

  return (
    <div className="my-8 flex justify-center">
      <svg width="520" height="180" viewBox="0 0 520 180" className="max-w-full">
        <text x="260" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Maritime Trade Network
        </text>
        <ellipse cx="260" cy="90" rx="80" ry="45" fill="none" stroke={accentColor} strokeWidth="2" />
        <text x="260" y="85" textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="600">Tamil Ports</text>
        <text x="260" y="98" textAnchor="middle" fill={textColor} fontSize="9">Kaveripattinam</text>
        <text x="260" y="110" textAnchor="middle" fill={textColor} fontSize="9">Korkai • Muziris</text>
        <g>
          <rect x="20" y="30" width="100" height="50" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="70" y="50" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Roman Empire</text>
          <text x="70" y="65" textAnchor="middle" fill={textColor} fontSize="8">Gold, Wine</text>
          <text x="70" y="76" textAnchor="middle" fill={textColor} fontSize="8">Luxury Goods</text>
        </g>
        <line x1="120" y1="55" x2="185" y2="75" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#trade-arrow)" />
        <line x1="185" y1="85" x2="120" y2="65" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#export-arrow)" />
        <g>
          <rect x="400" y="30" width="100" height="50" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="450" y="50" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Southeast Asia</text>
          <text x="450" y="65" textAnchor="middle" fill={textColor} fontSize="8">Trade</text>
          <text x="450" y="76" textAnchor="middle" fill={textColor} fontSize="8">Commerce</text>
        </g>
        <line x1="335" y1="75" x2="400" y2="55" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#trade-arrow)" />
        <line x1="400" y1="65" x2="335" y2="85" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#export-arrow)" />
        <g>
          <rect x="400" y="120" width="100" height="40" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="450" y="140" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">China</text>
          <text x="450" y="153" textAnchor="middle" fill={textColor} fontSize="8">Silk Trade</text>
        </g>
        <line x1="335" y1="105" x2="400" y2="135" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#trade-arrow)" />
        <g>
          <rect x="20" y="130" width="150" height="35" rx="2" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
          <text x="95" y="144" textAnchor="middle" fill={accentColor} fontSize="9" fontWeight="600">Tamil Exports:</text>
          <text x="95" y="158" textAnchor="middle" fill={textColor} fontSize="8">Spices • Pearls • Textiles</text>
        </g>
        <defs>
          <marker id="trade-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={strokeColor} />
          </marker>
          <marker id="export-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={accentColor} />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const TempleArchitectureInfographic = ({ isDark }: { isDark: boolean }) => {
  const strokeColor = isDark ? '#9ca3af' : '#6b7280';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const accentColor = isDark ? '#ec4899' : '#db2777';

  return (
    <div className="my-8 flex justify-center">
      <svg width="450" height="200" viewBox="0 0 450 200" className="max-w-full">
        <text x="225" y="20" textAnchor="middle" fill={textColor} fontSize="13" fontWeight="500">
          Dravidian Temple Architecture Elements
        </text>
        <g>
          <polygon points="120,50 140,180 100,180" fill="none" stroke={accentColor} strokeWidth="2" />
          <line x1="105" y1="160" x2="135" y2="160" stroke={strokeColor} strokeWidth="1" />
          <line x1="108" y1="140" x2="132" y2="140" stroke={strokeColor} strokeWidth="1" />
          <line x1="110" y1="120" x2="130" y2="120" stroke={strokeColor} strokeWidth="1" />
          <line x1="112" y1="100" x2="128" y2="100" stroke={strokeColor} strokeWidth="1" />
          <line x1="114" y1="80" x2="126" y2="80" stroke={strokeColor} strokeWidth="1" />
          <text x="120" y="195" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Gopuram</text>
        </g>
        <g>
          <rect x="210" y="120" width="100" height="60" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="230" y1="120" x2="230" y2="180" stroke={strokeColor} strokeWidth="2" />
          <line x1="250" y1="120" x2="250" y2="180" stroke={strokeColor} strokeWidth="2" />
          <line x1="270" y1="120" x2="270" y2="180" stroke={strokeColor} strokeWidth="2" />
          <line x1="290" y1="120" x2="290" y2="180" stroke={strokeColor} strokeWidth="2" />
          <text x="260" y="195" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Pillared Hall</text>
        </g>
        <g>
          <rect x="360" y="90" width="50" height="50" rx="2" fill="none" stroke={accentColor} strokeWidth="2" />
          <polygon points="385,60 405,90 365,90" fill="none" stroke={accentColor} strokeWidth="2" />
          <rect x="375" y="140" width="20" height="40" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="385" y="195" textAnchor="middle" fill={textColor} fontSize="10" fontWeight="600">Vimana</text>
        </g>
        <g>
          <text x="30" y="50" fill={accentColor} fontSize="10" fontWeight="600">Key Examples:</text>
          <text x="30" y="67" fill={textColor} fontSize="9">• Thanjavur</text>
          <text x="30" y="82" fill={textColor} fontSize="9">• Gangaikondacholapuram</text>
          <text x="30" y="97" fill={textColor} fontSize="9">• Darasuram</text>
        </g>
        <rect x="180" y="35" width="160" height="22" rx="2" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
        <text x="260" y="49" textAnchor="middle" fill={textColor} fontSize="9">Reached zenith under Chola Dynasty</text>
      </svg>
    </div>
  );
};

const BulbIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="flex-shrink-0"
    style={{
      animation: isActive ? 'bulbShake 0.5s ease-in-out' : 'none'
    }}
  >
    <g
      style={{
        animation: isActive ? 'none' : 'bulbOnOffLoop 4s ease-in-out infinite',
        transformOrigin: 'center',
      }}
    >
      <g className="bulb-rays" style={{
        animation: isActive ? 'none' : 'rayVisibilityLoop 4s ease-in-out infinite',
        opacity: isActive ? 1 : 0
      }}>
        <line x1="9" y1="0.5" x2="9" y2="2" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="13.5" y1="2.5" x2="12.5" y2="3.5" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="17.5" y1="7" x2="16" y2="7" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="14.5" y1="12" x2="13.5" y2="11" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="4.5" y1="2.5" x2="5.5" y2="3.5" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="0.5" y1="7" x2="2" y2="7" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="3.5" y1="12" x2="4.5" y2="11" stroke="#fbbf24" strokeWidth="1.3" strokeLinecap="round" />
      </g>

      <g className="bulb-body">
        <path
          d="M9 2C6.5 2 4.5 4 4.5 6.5C4.5 8.5 5.5 10 7 11V13C7 13.5 7.5 14 8 14H10C10.5 14 11 13.5 11 13V11C12.5 10 13.5 8.5 13.5 6.5C13.5 4 11.5 2 9 2Z"
          stroke={isActive ? "#fbbf24" : "#9ca3af"}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isActive ? "rgba(251, 191, 36, 0.4)" : "none"}
          style={{
            filter: isActive ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'none',
            animation: isActive ? 'none' : 'bulbColorLoop 4s ease-in-out infinite'
          }}
        />
        <path
          d="M7.5 14V15C7.5 15.5 8 16 8.5 16H9.5C10 16 10.5 15.5 10.5 15V14"
          stroke={isActive ? "#fbbf24" : "#9ca3af"}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  </svg>
);

const MindMapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2" fill="currentColor" />
    <circle cx="3" cy="3" r="1.5" fill="currentColor" />
    <circle cx="13" cy="3" r="1.5" fill="currentColor" />
    <circle cx="3" cy="13" r="1.5" fill="currentColor" />
    <circle cx="13" cy="13" r="1.5" fill="currentColor" />
    <line x1="8" y1="6" x2="4" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="6" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="10" x2="4" y2="12" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="10" x2="12" y2="12" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const StudyContent = () => {
  const { topicId, subtopicId } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("reading");
  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPreset>("light");
  const [showTopBar, setShowTopBar] = useState(false);
  const [openPyqAccordion, setOpenPyqAccordion] = useState<string | null>(null); // Format: "sectionId-paragraphIndex"
  const [openAnswers, setOpenAnswers] = useState<Set<string>>(new Set());
  const [visibleKeywords, setVisibleKeywords] = useState<string[]>(contentSections[0].keywords);

  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [isAssessmentFinished, setIsAssessmentFinished] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [keywordNotes, setKeywordNotes] = useState<Record<string, string>>({});
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [focusedNoteKeyword, setFocusedNoteKeyword] = useState<string | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNoteText, setTempNoteText] = useState("");

  const readingPanelRef = useRef<HTMLDivElement>(null);

  // When keyword changes, reset editing state
  useEffect(() => {
    if (selectedKeyword) {
      setTempNoteText(keywordNotes[selectedKeyword] || "");
      setIsEditingNote(!keywordNotes[selectedKeyword]);
    }
  }, [selectedKeyword, keywordNotes]);

  useEffect(() => {
    if (isAssessmentStarted && !isAssessmentFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isAssessmentStarted, isAssessmentFinished, timeLeft]);

  // Handle scroll to update visible keywords
  useEffect(() => {
    const handleScroll = () => {
      if (!readingPanelRef.current) return;

      const scrollTop = readingPanelRef.current.scrollTop;
      const scrollHeight = readingPanelRef.current.scrollHeight;
      const clientHeight = readingPanelRef.current.clientHeight;

      const scrollPercent = scrollTop / (scrollHeight - clientHeight || 1);
      const sectionIndex = Math.floor(scrollPercent * contentSections.length);
      const currentSection = contentSections[Math.min(sectionIndex, contentSections.length - 1)];

      setVisibleKeywords(currentSection.keywords);
    };

    const panel = readingPanelRef.current;
    if (panel) {
      panel.addEventListener('scroll', handleScroll);
      return () => panel.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const getBackgroundStyle = () => {
    switch (backgroundPreset) {
      case "light": return "bg-[#fdfcfa]";
      case "warm": return "bg-[#fef9f3]";
      case "dark": return "bg-[#1a1a1a]";
      default: return "bg-[#fdfcfa]";
    }
  };

  const getTextColor = () => {
    return backgroundPreset === 'dark' ? 'text-[#e5e5e5]' : 'text-[#1a1a1a]';
  };

  const handlePyqToggle = (sectionId: string, paragraphIndex: number) => {
    const key = `${sectionId}-${paragraphIndex}`;
    setOpenPyqAccordion(openPyqAccordion === key ? null : key);
  };

  const handleAnswerToggle = (pyqId: string) => {
    const newHistory = new Set(openAnswers);
    if (newHistory.has(pyqId)) newHistory.delete(pyqId);
    else newHistory.add(pyqId);
    setOpenAnswers(newHistory);
  };

  const startAssessment = () => {
    setIsAssessmentStarted(true);
    setIsAssessmentFinished(false);
    setTimeLeft(600);
  };

  const isInQuizMode = isAssessmentStarted && !isAssessmentFinished;

  const handleDeleteNote = (keyword: string) => {
    setKeywordNotes(prev => {
      const next = { ...prev };
      delete next[keyword];
      return next;
    });
  };

  const handleNoteContentChange = (keyword: string, content: string) => {
    setKeywordNotes(prev => ({ ...prev, [keyword]: content }));
  };

  const renderReadingContent = () => (
    <div className="flex flex-col gap-10 py-12 px-8 md:px-16 max-w-[800px] mx-auto">
      {contentSections.map((section, idx) => (
        <div key={section.id} id={`section-${section.id}`} className="space-y-8 scroll-mt-24">
          {/* <div className="flex items-center justify-between pb-3 border-b border-gray-200/10">
            <span className={cn("text-[12px] uppercase tracking-[0.1em] font-medium opacity-40", getTextColor())}>
              Section {idx + 1}
            </span>
          </div> */}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {idx === 0 ? (
              <h1 className={cn(
                "font-['Inter:Medium',sans-serif] font-medium leading-[32px] sm:leading-[36px] text-[20px] sm:text-[24px] tracking-[0.0703px]",
                getTextColor()
              )}>
                {section.title}
              </h1>
            ) : (
              <h2 className={cn(
                "font-['Inter:Medium',sans-serif] font-medium leading-[26px] sm:leading-[30px] text-[18px] sm:text-[20px] tracking-[-0.4492px]",
                getTextColor()
              )}>
                {section.title}
              </h2>
            )}
            {idx === 0 && (
              <button
                onClick={() => navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}/mindmap`)}
                className={cn(
                  "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-all shadow-sm border",
                  backgroundPreset === 'dark' ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-600"
                )}
                title="View Interactive Mind Map"
              >
                <MindMapIcon />
              </button>
            )}
          </div>

          <div className={cn("space-y-6 text-[16px] leading-[26px] tracking-[-0.3125px] font-['Inter:Regular',sans-serif]", getTextColor())}>
            {section.paragraphs.map((paragraph, pIdx) => {
              const pyqKey = `${section.id}-${pIdx}`;
              const hasPyqs = section.importantParagraphIndices?.includes(pIdx);
              const isExpanded = openPyqAccordion === pyqKey;

              return (
                <div key={pIdx} className="space-y-4">
                  <div className="relative group">
                    <p className="text-justify inline">
                      {paragraph}
                    </p>
                    {hasPyqs && (
                      <button
                        onClick={() => handlePyqToggle(section.id, pIdx)}
                        className="inline-block ml-2 align-middle"
                      >
                        <BulbIcon isActive={isExpanded} />
                      </button>
                    )}
                  </div>

                  {/* Inline PYQ Accordion from StudyInterface */}
                  {isExpanded && hasPyqs && section.pyqData && section.pyqData[pIdx] && (
                    <div className={cn(
                      "my-4 rounded-xl border p-4 transition-all duration-300",
                      backgroundPreset === 'dark' ? "bg-[#2a2a2a] border-gray-700" : "bg-gray-50 border-gray-200"
                    )}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[16px]">💡</span>
                        <h4 className={cn("font-['Inter:Medium',sans-serif] text-[14px] font-medium opacity-70", getTextColor())}>Asked in Exams</h4>
                      </div>
                      <div className="space-y-3">
                        {section.pyqData[pIdx].map((pyq) => (
                          <div key={pyq.id} className={cn("p-4 rounded-lg", backgroundPreset === 'dark' ? "bg-[#1a1a1a]" : "bg-white shadow-sm")}>
                            <p className="text-[12px] font-medium mb-1 opacity-50 uppercase tracking-wider">{pyq.examName} – {pyq.year}</p>
                            <p className="text-[14px] leading-[20px] mb-3">{pyq.question}</p>
                            <button
                              onClick={() => handleAnswerToggle(pyq.id)}
                              className="text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              {openAnswers.has(pyq.id) ? "Hide Answer" : "View Answer"}
                            </button>
                            {openAnswers.has(pyq.id) && (
                              <div className="mt-3 pt-3 border-t border-gray-100/10">
                                <p className="text-[12px] font-medium text-green-500 mb-1">Answer:</p>
                                <p className="text-[14px]">{pyq.answer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Infographics Integration based on Section ID */}
            {section.id === 'kingdoms' && <ThreeKingdomsInfographic isDark={backgroundPreset === 'dark'} />}
            {section.id === 'sangam' && <SangamTimelineInfographic isDark={backgroundPreset === 'dark'} />}
            {section.id === 'administration' && <AdministrationHierarchyInfographic isDark={backgroundPreset === 'dark'} />}
            {section.id === 'trade' && <TradeNetworkInfographic isDark={backgroundPreset === 'dark'} />}
            {section.id === 'architecture' && <TempleArchitectureInfographic isDark={backgroundPreset === 'dark'} />}
          </div>
        </div>
      ))}

      {/* Assessment Activation Section */}
      <div className="pt-16 border-t border-gray-200/20">
        <div className={cn(
          "p-10 md:p-14 rounded-[32px] text-center space-y-8",
          backgroundPreset === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#fafafa]'
        )}>
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
            {isAssessmentFinished ? (
              <CheckCircle className="w-9 h-9 text-emerald-500" />
            ) : (
              <Brain className="w-9 h-9 text-accent" />
            )}
          </div>
          <h2 className={cn("text-[22px] font-medium font-['Inter:Medium',sans-serif]", getTextColor())}>
            {isAssessmentFinished ? "Chapter Assessment Completed" : "Final Chapter Evaluation"}
          </h2>
          <p className={cn("text-[15px] opacity-50 max-w-sm mx-auto", getTextColor())}>
            {isAssessmentFinished
              ? "You have successfully completed the assessment for this chapter. Great job!"
              : "Validate your understanding with a synchronized exam assessment"}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate(`/study-plan/topic/${topicId}/subtopic/${subtopicId}/mindmap`)}
              variant="outline"
              className={cn(
                "px-8 py-6 text-[15px] rounded-xl transition-all border font-medium hover:bg-accent/5",
                backgroundPreset === 'dark' ? "border-gray-700 text-gray-300 hover:text-white" : "border-gray-200 text-gray-700"
              )}
            >
              <MindMapIcon />
              <span className="ml-2.5">View Mind Map</span>
            </Button>

            {isAssessmentFinished ? (
              <div className="bg-emerald-500 text-white px-8 py-6 text-[15px] rounded-xl shadow-md font-bold flex items-center justify-center cursor-default animate-fade-in">
                Assessment Completed ✅
              </div>
            ) : (
              <Button
                onClick={startAssessment}
                className="bg-[#1c1c1e] text-white hover:bg-black px-10 py-6 text-[15px] rounded-xl transition-all shadow-md font-medium"
              >
                <Play className="w-5 h-5 mr-2.5 fill-current" />
                Start Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("fixed inset-0 z-50 overflow-hidden", getBackgroundStyle())}>
      {/* Top Control Bar from StudyInterface */}
      <div
        className="fixed top-0 left-0 right-0 h-16 z-[100]"
        onMouseEnter={() => setShowTopBar(true)}
        onMouseLeave={() => setShowTopBar(false)}
      >
        <div className={cn(
          "absolute inset-0 transition-opacity duration-200",
          showTopBar ? "opacity-100" : "opacity-0 pointer-events-none",
          backgroundPreset === 'dark' ? "bg-[#1a1a1a] border-b border-gray-800" : "bg-white border-b border-gray-200 shadow-sm"
        )}>
          <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center">
              <button
                onClick={() => navigate('/study-plan')}
                className={cn("flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-[13px] sm:text-[14px] opacity-70 hover:opacity-100 transition-opacity", getTextColor())}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Back</span>
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 bg-gray-100/10 p-1 rounded-xl">
              {[
                { id: 'reading', icon: Book, label: 'Reading' },
                { id: 'study', icon: PenTool, label: 'Study' },
                { id: 'revision', icon: History, label: 'Revision' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as Mode)}
                  className={cn(
                    "px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all flex items-center gap-1.5 sm:gap-2",
                    mode === m.id
                      ? "bg-[#1f2937] text-white shadow-sm"
                      : cn("text-[13px] sm:text-[14px] opacity-40 hover:opacity-100", getTextColor())
                  )}
                  title={`${m.label} Mode`}
                >
                  <m.icon className="w-4 h-4" />
                  <span className="text-[13px] sm:text-[14px] font-medium hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
              <span className={cn("text-[13px] sm:text-[14px] opacity-60 hidden lg:inline", getTextColor())}>Display:</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {(['light', 'warm', 'dark'] as BackgroundPreset[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setBackgroundPreset(p)}
                    className={cn(
                      "px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all border",
                      backgroundPreset === p
                        ? "bg-[#1f2937] text-white border-[#1f2937]"
                        : cn("bg-transparent border-gray-200/20", getTextColor())
                    )}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full overflow-hidden">
        {mode === 'reading' && (
          <div className="w-full h-full overflow-y-auto bg-[#f5f5f5]">
            <div className={cn("h-full overflow-y-auto pt-20", getBackgroundStyle())} style={{ maxWidth: '800px', margin: '0 auto' }} ref={readingPanelRef}>
              {renderReadingContent()}
            </div>
          </div>
        )}

        {mode === 'study' && (
          <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
            {/* Reading Panel */}
            <div className={cn(
              "w-full lg:w-[60%] h-[35%] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200/10 transition-all duration-300 pt-20 lg:pt-24",
              focusedNoteKeyword ? "h-0 opacity-0 invisible lg:h-full lg:opacity-100 lg:visible" : "h-[35%]",
              getBackgroundStyle()
            )} ref={readingPanelRef}>
              {renderReadingContent()}
            </div>

            {/* Right Side Panels (Keywords + Notes) */}
            <div className="w-full lg:w-[40%] flex-1 lg:h-full bg-[#fafaf9] flex flex-col overflow-hidden pb-20 lg:pb-0">
              {/* Keywords Bar */}
              <div className={cn(
                "flex-shrink-0 lg:h-[30%] lg:overflow-y-auto border-b border-gray-200/60 p-4 sm:p-6 bg-white/50 backdrop-blur-sm transition-all duration-300",
                focusedNoteKeyword ? "h-0 p-0 opacity-0 overflow-hidden border-none lg:h-[30%] lg:p-6 lg:opacity-100 lg:overflow-y-auto lg:border-b" : "h-auto"
              )}><div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-['Inter:Medium',sans-serif] text-[11px] sm:text-[13px] text-gray-400 font-semibold">Keywords</h3>

                </div>

                <div className="flex flex-wrap gap-2 transition-all duration-300">
                  {visibleKeywords.map(kw => (
                    <button
                      key={kw}
                      onClick={() => {
                        setSelectedKeyword(kw);
                        if (keywordNotes[kw] === undefined) {
                          setKeywordNotes(prev => ({ ...prev, [kw]: "" }));
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[12px] sm:text-[14px] transition-all border font-medium",
                        selectedKeyword === kw
                          ? "bg-[#1f2937] border-[#1f2937] text-white shadow-md font-semibold"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                      )}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes List Section */}
              <div className="flex-1 p-4 sm:p-8 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Inter:Medium',sans-serif] text-[11px] sm:text-[13px] text-gray-400 font-semibold">
                    {focusedNoteKeyword ? `Editing: ${focusedNoteKeyword}` : 'Notes'}
                  </h3>
                  {focusedNoteKeyword && (
                    <button
                      onClick={() => (document.activeElement as HTMLElement)?.blur()}
                      className="text-[12px] font-bold text-blue-500 uppercase tracking-wider py-1 px-3 bg-blue-50 rounded-lg"
                    >
                      Done
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                  {Object.keys(keywordNotes).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-20">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200/50 flex items-center justify-center mb-4">
                        <PenTool className="w-6 h-6" />
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] text-[13px] sm:text-[14px] text-gray-700 italic">
                        Select a keyword to start taking notes
                      </p>
                    </div>
                  ) : (
                    Object.entries(keywordNotes).map(([keyword, content]) => (
                      <div
                        key={keyword}
                        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                        onMouseEnter={() => setHoveredNoteId(keyword)}
                        onMouseLeave={() => setHoveredNoteId(null)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-['Inter:SemiBold',sans-serif] text-[14px] sm:text-[15px] font-bold text-gray-900 leading-tight">{keyword}</h4>
                            <p className="font-['Inter:Regular',sans-serif] text-[10px] text-gray-400 mt-1">Ref: Tamil Nadu History</p>
                          </div>
                          {hoveredNoteId === keyword && (
                            <button
                              onClick={() => handleDeleteNote(keyword)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                                <path d="M4 6V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V6M2 4H14M6 4V2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <textarea
                          value={content}
                          onFocus={() => setFocusedNoteKeyword(keyword)}
                          onBlur={() => setFocusedNoteKeyword(null)}
                          onChange={(e) => handleNoteContentChange(keyword, e.target.value)}
                          placeholder="Synthesize your understanding..."
                          className={cn(
                            "w-full p-4 bg-white border-2 transition-all duration-300 rounded-2xl resize-none font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed shadow-sm",
                            focusedNoteKeyword === keyword
                              ? "min-h-[400px] border-blue-500/30 ring-4 ring-blue-500/5 text-gray-900"
                              : "min-h-[120px] border-gray-100 text-gray-600 bg-gray-50/30"
                          )}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'revision' && (
          <div className="w-full h-full overflow-y-auto bg-[#fdfcfa] px-6 sm:px-10 md:px-24 py-16">
            <div className="max-w-[850px] mx-auto space-y-8 sm:space-y-10">
              <div className="text-center sm:text-left">
                <h2 className="text-[24px] sm:text-[28px] font-medium text-gray-900 font-['Inter:Medium',sans-serif]">Revision Notes</h2>
              </div>

              {Object.keys(keywordNotes).length > 0 ? (
                <div className="grid gap-8">
                  {Object.entries(keywordNotes).map(([k, n]) => (
                    <div key={k} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="mb-6">
                        <h4 className="text-md font-bold text-gray-900 leading-tight font-['Inter:Medium',sans-serif]">
                          {k}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 font-['Inter:Regular',sans-serif]">
                          History of Tamil Nadu: Ancient Kingdoms and Cultural Heritage
                        </p>
                      </div>

                      <div className="relative group/rev-note">
                        <textarea
                          value={n}
                          onChange={(e) => handleNoteContentChange(k, e.target.value)}
                          placeholder="Your captured analysis will appear here..."
                          className="w-full min-h-[150px] p-6 bg-[#fcfcfc] border border-gray-100 rounded-lg resize-none font-['Inter:Regular',sans-serif] text-[16px] leading-[26px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    <History className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Synthesis Required</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Toggle to Study Mode and capture your analysis across key concepts to populate your revision profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DailyQuizModal
        isOpen={isInQuizMode}
        onClose={() => setIsAssessmentStarted(false)}
        onComplete={() => {
          setIsAssessmentFinished(true);
          // Do NOT close the modal here to allow users to see the result
          // setIsAssessmentStarted(false); 
        }}
        title="Tamil Nadu History Assessment"
        subtitle="Quick Evaluation • 10 Minutes"
        questions={[
          {
            id: 1,
            question: "Which of the following dynasties is NOT considered one of the 'Three Great Tamil Kingdoms'?",
            subject: "History",
            difficulty: "Easy",
            options: ["Chera", "Chola", "Pandya", "Pallava"],
            correctAnswer: 3,
            explanation: "The Three Great Tamil Kingdoms were the Cheras, Cholas, and Pandyas. The Pallavas came later and were a distinct dynasty."
          },
          {
            id: 2,
            question: "The term 'Sangam' in ancient Tamil history literally refers to:",
            subject: "History",
            difficulty: "Medium",
            options: ["A battlefield", "An assembly of poets", "A naval port", "A royal palace"],
            correctAnswer: 1,
            explanation: "The term 'Sangam' refers to an assembly or academy of poets and scholars who gathered under royal patronage."
          },
          {
            id: 3,
            question: "Which ancient Tamil port was famously known for its extensive trade with the Roman Empire?",
            subject: "History",
            difficulty: "Hard",
            options: ["Madurai", "Kancheepuram", "Arikamedu", "Kaveripattinam"],
            correctAnswer: 2,
            explanation: "Arikamedu (near Pondicherry) was a major port known for its trade with the Roman Empire, evidenced by Roman pottery and coins found there."
          }
        ]}
      />

      <style>{`
        @keyframes bulbOnOffLoop {
          0%, 40% { transform: scale(1); opacity: 0.8; }
          45%, 95% { transform: scale(1.1) rotate(6deg); opacity: 1; filter: drop-shadow(0 0 12px rgba(251,191,36,0.4)); }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes bulbColorLoop {
          0%, 40% { stroke: #9ca3af; fill: none; }
          45%, 95% { stroke: #fbbf24; fill: rgba(251, 191, 36, 0.2); }
          100% { stroke: #9ca3af; fill: none; }
        }
        @keyframes rayVisibilityLoop {
          0%, 40% { opacity: 0; }
          45%, 95% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes bulbShake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default StudyContent;
