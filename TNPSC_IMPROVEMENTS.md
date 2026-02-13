# TNPSC Group Exam Preparation - Project Improvements & Suggestions

To make the **Exam-Copilot (Nimble-Duties)** platform more effective for **TNPSC (Tamil Nadu Public Service Commission)** aspirants, here are the proposed additional features and improvements categorized by functionality.

## 1. TNPSC Specific Core Features

### 📅 Annual Planner Integration
- **Feature**: Sync the study schedule with the **TNPSC Annual Planner**.
- **Benefit**: Automatically adjusts the user's study plan based on official exam dates and notification releases (e.g., Group 1, 2, 2A, 4).

### 📚 Samacheer Kalvi Book Mapper
- **Feature**: A dedicated section to track progress through **6th to 12th Standard Samacheer Kalvi Books**.
- **Benefit**: Since TNPSC syllabus is strictly based on these books, mapping study topics to specific school book chapters is crucial.

### 🏛️ Specialty Modules for Unit 8 & 9
- **Feature**: Interactive timelines for Tamil Nadu History, Culture, and Socio-Political Movements (Unit 8) and TN Administration/Development (Unit 9).
- **Benefit**: These units carry high weightage and require specialized regional knowledge.

### 📝 Digital OMR Simulator
- **Feature**: A practice mode where users interact with a digital **OMR sheet** for mock tests.
- **Benefit**: Prepares aspirants for the physical offline exam environment by simulating the bubbling process.

---

## 2. Content & Study Tools

### 📰 Daily TN-Centric Current Affairs
- **Feature**: A "TN Today" feed that focuses on Tamil Nadu government schemes, appointments, and regional news.
- **Benefit**: TNPSC often asks specific questions about state-level initiatives that national news apps might miss.

### 🗣️ Tamil Language Proficiency Hub
- **Feature**: Dedicated practice for **General Tamil** (Group 4/2) including grammar (Ilakkanam), literature (Ilakkiam), and authors.
- **Benefit**: Critical for the Mandatory Tamil Eligibility Test and scoring high in preliminary exams.

### 🗺️ Interactive Mind Maps for Geography
- **Feature**: Pre-built mind maps for TN-specific geography (Rivers, Dams, Soil types, and Industry locations).
- **Benefit**: Visual learning of regional geography.

---

## 3. UI/UX Improvements

### 🌗 Premium Tamil Font Integration
- **Improvement**: Use high-quality, readable Tamil fonts (like *Latha*, *Arima Madurai*, or *Mukta Malar*) for better readability in the study content.
- **Benefit**: Reduces eye strain during long Tamil study sessions.

### 📊 Subject-Wise Heatmap
- **Improvement**: A progress dashboard that breaks down performance specifically into the 10 TNPSC GS Units.
- **Benefit**: Helps students identify exactly which "Unit" (e.g., Unit 4: History or Unit 6: Economy) needs more focus.

### 🔊 Audio Summaries (Tamil & English)
- **Improvement**: AI-generated audio summaries for key chapters.
- **Benefit**: Enables "on-the-go" learning for working professionals who are TNPSC aspirants.

---

## 4. Technical Enhancements

### 🧠 Adaptive PYQ (Previous Year Questions) Engine
- **Improvement**: Tag questions with the year and department (e.g., "Group 4 - 2022").
- **Benefit**: Users can take tests consisting *only* of actual past questions to understand the exam trend.

### 🤖 TNPSC Specialization for Chatbot
- **Improvement**: Train the `ChatbotWidget` on the latest TNPSC notifications, reservation policies, and syllabus changes.
- **Benefit**: Provides instant answers to "Is X topic in the 2026 syllabus?" or "What are the eligibility criteria for Group 2?"

### 📡 Offline Mode for School Books
- **Improvement**: Allow downloading of specific Samacheer Kalvi PDF chapters within the app.
- **Benefit**: Accessibility in rural areas with poor internet connectivity.

---

## 5. Gamification (Leaderboard & Social)

### 🏆 District-Wise Leaderboard
- **Feature**: In addition to the global leaderboard, add a **District-wise ranking** system.
- **Benefit**: Creates healthy competition among aspirants from the same region.

### 🤝 Study Group Challenges
- **Feature**: Allow users to create "Study Rooms" for specific TNPSC groups.
- **Benefit**: Peer-to-peer accountability.

---

## 6. PROPOSED NEW PAGES & DISPLAY REQUIREMENTS

Below are the specific new pages to be created and a list of what each should display.

### A. Annual Planner Dashboard (`/annual-planner`)
**Purpose**: To keep users updated on official exam timelines.
**What to Display:**
1.  **Timeline View**: A vertical or horizontal scroll of the current year (e.g., 2024-25 TNPSC Calendar).
2.  **Status Badges**: Indicators for "Notification Released", "Application Open", "Exam Date Announced", or "Results Out".
3.  **Countdown Timers**: Large cards showing "Days to Group 4 Prelims" or "Days to Group 2 Mains".
4.  **Notification PDF Link**: Direct links to official gazette notifications for each exam.

### B. Samacheer Library & Progress (`/samacheer-tracker`)
**Purpose**: Centralized tracking for school textbooks which are the core syllabus.
**What to Display:**
1.  **Book Grid**: Cards for 6th to 12th Standard, color-coded by subject (Science, Social Science, Tamil).
2.  **Chapter Checklist**: Under each book, a list of chapters with "Read", "Revised", and "Test Taken" statuses.
3.  **PDF Viewer**: An embedded reader to view the TNSERT school books without leaving the app.
4.  **Completion Bar**: A circular progress bar showing "You have completed 45% of 10th Standard Social Science".

### C. Previous Year Questions (PYQ) Hub (`/pyq-archive`)
**Purpose**: Specialized access to actual past exam papers.
**What to Display:**
1.  **Year-Wise Filter**: Tabs for 2023, 2022, 2021... etc.
2.  **Exam Filter**: Selection for Group 1, Group 2, Group 4, VAO, etc.
3.  **"Solve by Trend"**: A section showing the most repeated topics in the last 5 years.
4.  **Subject-Wise Split**: Break down a past paper into 25 Aptitude, 100 Tamil, 75 General Studies for targeted practice.

### D. Tamil Eligibility Lab (`/tamil-lab`)
**Purpose**: Focus on the mandatory Tamil qualification.
**What to Display:**
1.  **Grammar (Ilakkanam) Drills**: Interactive matching games for synonyms, antonyms, and word types.
2.  **Author Profiles**: Rich cards for famous poets (Bharathiyar, Bharathidasan, etc.) with their notable works.
3.  **Literature Timelines**: A visual timeline of the Sangam Age to Modern Era.
4.  **Translation Practice**: Tools to practice Tamil-to-English and English-to-Tamil translations (for Group 2 Mains).

### E. OMR Simulation Arena (`/omr-practice`)
**Purpose**: Physical exam realism.
**What to Display:**
1.  **Virtual OMR Sheet**: A grid of numbered circles (1 to 200).
2.  **Side-by-Side View**: Question on the left, OMR sheet on the right (Desktop) or Question overlay (Mobile).
3.  **Timer & Penalty Tracker**: Tracks how long the user takes to color each bubble.
4.  **Shading Accuracy**: AI check to see if the bubble is "properly filled" (simulating OMR scanner logic).

### F. Job & Eligibility Alert Center (`/alerts`)
**Purpose**: Career guidance.
**What to Display:**
1.  **Personalized Alerts**: "You are eligible for Group 1 based on your age and degree!"
2.  **Department-Wise Openings**: List of vacancies in various TN Government departments.
3.  **Community-Wise Vacancy Split**: A table showing vacancies as per the TN Reservation policy for a clear picture.
