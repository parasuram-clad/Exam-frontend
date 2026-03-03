# Study Module API Documentation

This document outlines the API requirements and data structures for the Study Module (Study Plan, Content, MindMap, and Notes).

## 1. API Endpoints Overview

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| **Study Plan** | `/study-plan/user/{userId}` | `GET` | Retrieve the 120-day study cycle and daily tasks. |
| **Topic Content** | `/study/topic` | `GET` | Fetch comprehensive topic material (reading + quiz + structure). |
| **Notes** | `/study-notes/` | `POST` | Save user-generated notes for specific keywords. |
| **Notes** | `/study-notes/user/{userId}` | `GET` | Retrieve all notes created by a specific user. |
| **Progress** | `/study-plan/{planId}` | `PATCH` | Update the status of a specific task (e.g., 'COMPLETED'). |

---

## 2. Topic Content Structure (Single Thread)

To get the "full information" for a study session in a single thread, the API should return a nested JSON object that powers the **Reading View**, **MindMap**, and **Assessments**.

### Sample Data Structure (JSON)

```json
{
  "topic_id": "sangam-period",
  "title": "Sangam Period",
  "description": "Early Tamil society, culture, and political structure",
  "image": "/assets/study-plan1.png",
  "total_sections": 8,
  "completed_sections": 2,
  "sections": [
    {
      "id": 1,
      "title": "Historical Sources & Epochs",
      "type": "reading",
      "duration": "10 min",
      "completed": true,
      "content": {
        "introduction": "The Sangam period (approx. 300 BCE - 300 CE) represents the foundations of Tamil civilization.",
        "keyPoints": [
          {
            "title": "Epigraphical Evidence",
            "details": [
              {
                "title": "Asokan Inscriptions",
                "details": [
                  "Mentioned Chera, Chola, and Pandya as independent neighbors.",
                  "Establishment of diplomatic ties with Southern kingdoms."
                ]
              }
            ]
          }
        ],
        "keyTerms": [
          { "term": "Sangam", "definition": "Academy or assembly of Tamil poets." }
        ],
        "detailedNotes": [
          {
            "heading": "The Three Sangams",
            "content": "Tradition speaks of three Sangams: Mudal, Idai, and Kadai.",
            "subtopics": [
              { "title": "First Sangam", "content": "Held at Then-Madurai." }
            ],
            "pyqs": [
              { "year": "2020", "question": "Which Sangam produced available literature?", "answer": "The Third Sangam." }
            ]
          }
        ],
        "importantDates": [
          { "year": "300 BCE", "event": "Beginning of Early Historical Period" }
        ]
      }
    },
    {
      "id": 8,
      "title": "Final Assessment",
      "type": "quiz",
      "duration": "10 min",
      "completed": false,
      "questions": [
        {
          "id": 1,
          "question": "Which Sangam port was famous for pearls?",
          "options": ["Musiri", "Korkai", "Puhar", "Vanchi"],
          "correctAnswer": 1
        }
      ]
    }
  ]
}
```

---

## 3. Mandatory Fields

### Study Plan Item (`StudyPlanResponse`)
- `id`: Unique identifier (Integer)
- `day_no`: The day in the 120-day cycle (Integer)
- `subject`: Category (e.g., 'History', 'Polity')
- `chapter`: High-level grouping
- `topic`: Specific topic name
- `minutes`: Estimated time (Integer)
- `plan_status`: Enum (`'START'`, `'IN_PROGRESS'`, `'COMPLETED'`)

### Content Section Object
- `id`: Internal sequence (Integer)
- `title`: Section heading (String)
- `type`: `'reading'` or `'quiz'` (String)
- `content`: 
    - `introduction`: Summary text (String)
    - `keyPoints`: Recursive structure for **MindMap** generation (Array of Objects)
    - `keyTerms`: Array of `{ term, definition }`
    - `detailedNotes`: Deep-dive content with associated **PYQs** (Previous Year Questions)
    - `importantDates`: Array of `{ year, event }` for timeline generation

### Note Object (`StudyNote`)
- `topic_id`: Link to the subtopic (Integer)
- `title`: The keyword/term the note belongs to (String)
- `content`: User's saved text (String)
- `status`: Visibility state (Draft/Private/Public)

---

## 4. MindMap Generation Logic

The **MindMap** view is dynamically built from the `Topic Content` structure:
1. **Root Node**: `topic.title`
2. **Level 1 Nodes**: `sections[].title`
3. **Level 2 Nodes**: `keyPoints[].title`, `keyTerms` (as a group), `Timeline` (as a group)
4. **Level 3 Nodes**: Individual `keyPoints.details`, individual `terms`, and `dates`.

This structure ensures that as soon as the Content API is fetched, both the **Reading View** and **Interactive MindMap** are fully populated without further network calls.
