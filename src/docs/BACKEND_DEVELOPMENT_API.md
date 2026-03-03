# Study Module API Backend Development Specifications

This document defines the exact data fields, types, and JSON structures required to build the backend for the **Unified Study Experience** (Plan, Content, MindMap, and MCQ).

---

## 1. The "Ultimate Bundle" API (Single Thread)
**Endpoint:** `GET /api/study/daily-context/{userId}/{dayNo}`  
**Purpose:** Returns the complete learning context for a specific day. This prevents multiple requests and ensures all features (Plan, Reading, MindMap, Mock Test) have consistent data.

### Response Structure (JSON)
The backend should return this unified object. Note the "Content Block" structure which supports paragraph-level metadata, sub-headings, bullet points, and images.

```json
{
  "day_metadata": {
    "day_no": 3,
    "total_tasks": 2,
    "completed_tasks": 1,
    "overall_plan_progress": 42
  },
  "tasks": [
    {
      "id": 105,
      "subject": "Indian History",
      "chapter": "Sangam Age",
      "topic": "Historical Sources",
      "short_description": "Initial study of archaeological and epigraphical records of early Tamil society.",
      "status": "IN_PROGRESS",
      "duration_minutes": 45,
      "image_url": "/assets/study-plan1.png",
      
      "learning_content": {
        "introduction": "The Sangam period marks the foundation of Tamil civilization...",
        "sections": [
          {
            "section_id": "s1",
            "title": "Historical Sources",
            "type": "reading",
            "content_blocks": [
              {
                "block_id": "b1",
                "type": "paragraph",
                "sub_heading": "Epigraphical Evidence",
                "text": "The history of Tamil Nadu is characterized by a rich tapestry of ancient kingdoms...",
                "keywords": ["Tamil Nadu", "Ancient Kingdoms", "Tamilakam"],
                "image": {
                  "url": "/assets/sample-inscription.jpg",
                  "caption": "An ancient Tamil-Brahmi inscription found at Mangulam"
                },
                "pyqs": [
                  { 
                    "id": "pyq_101",
                    "exam_name": "TNPSC Group I",
                    "year": 2023, 
                    "question": "Which inscription mentions the Tamil League?", 
                    "answer": "Hathigumpha Inscription" 
                  }
                ]
              },
              {
                "block_id": "b2",
                "type": "bullet_points",
                "sub_heading": "The Three Great Kingdoms",
                "list_items": [
                  "Cheras: Ruled over the western coast (Kerala/West TN).",
                  "Cholas: Dominated the Kaveri delta region.",
                  "Pandyas: Centered around Madurai and the southern tip."
                ],
                "keywords": ["Chera", "Chola", "Pandya"],
                "pyqs": []
              }
            ],
            
            "mindmap_structure": {
              "id": "mm-1",
              "title": "Historical Sources",
              "children": [
                {
                  "title": "Epigraphy",
                  "children": [
                    { "title": "Asokan Inscriptions", "details": ["Indpendent neighbors", "Minor Rock Edict II"] },
                    { "title": "Hathigumpha", "details": ["King Kharavela", "Tamil League"] }
                  ]
                },
                {
                  "title": "Archaeology",
                  "children": ["Arikamedu", "Adichanallur"]
                }
              ]
            }
          }
        ],
        
        "assessment": {
          "quiz_id": "qz-105",
          "title": "Daily Self-Assessment",
          "total_questions": 10,
          "passing_score": 7,
          "time_limit_seconds": 600,
          "questions": [
            {
              "id": "q1",
              "question": "Which Sangam port was famous for pearls?",
              "options": ["Musiri", "Korkai", "Puhar", "Vanchi"],
              "correct_answer_index": 1,
              "difficulty": "Medium",
              "explanation": "Korkai, located at the mouth of the Thamirabarani River, was the primary pearl fishery of the Pandyas."
            }
          ]
        }
      }
    }
  ]
}
```

---

## 2. Advanced Layout Support

### A. Sub-Topics & Bullet Points
Within `content_blocks`, we now support:
- `sub_heading`: (Optional) Local header for that specific block.
- `type`: Can be `"paragraph"` or `"bullet_points"`.
- `list_items`: (Array of strings) Mandatory if type is `bullet_points`.

### B. Image Integration
- `image`: (Optional Object) Contains a `url` and a `caption`. This allows the text to be visually enhanced with diagrams or maps.

### C. MindMap (Nesting)
The `mindmap_structure` remains a recursive tree, perfectly matching the UI components in `MindMap.tsx`.

---

## 3. Database & Developer Summary

| Requirement | Specification |
|-------------|---------------|
| **Data Retrieval** | Single request via `GET /api/study/daily-context/{userId}/{dayNo}` |
| **Storage Type** | Recommend **JSONB** for the `learning_content` column. |
| **Asset Management** | All `image.url` and `image_url` fields should point to a CDN or a managed assets folder. |
| **Syllabus Mapping** | The nested objects should carefully follow the hierarchical structure of Topics -> Sub-topics -> Paragraphs/Bullets. Include a `short_description` for each topic. |

---

## 4. Study Notes API
**Endpoint:** `POST /api/study-notes/`
**Purpose:** Saves a user's custom annotation for a specific keyword.

### Request Body
```json
{
  "user_id": 1,
  "topic_id": 105,
  "title": "Arikamedu",
  "content": "Located near Pondicherry, was an important Indo-Roman trade center.",
  "status": "private"
}
```

---

## 5. MindMap Data Extraction Example
For the backend developer: To support our `MindMap.tsx`, ensure the `keyPoints` are nested strings/objects like this:

```json
"keyPoints": [
  {
    "title": "Literary Sources",
    "details": [
      {
        "title": "Ettuthogai",
        "details": ["Eight Anthologies", "Early Sangam literature"]
      },
      "Pattupattu (Ten Idyls)"
    ]
  }
]
```

---

## 6. DB Table Requirements
- **Users**: (Already exists)
- **StudyPlan**: `id, user_id, day_no, subject, chapter, topic, minutes, status, version`
- **TopicContent**: `id, topic_name, subject, intro_text, content_json` (Store the structure in JSONB for performance)
- **UserNotes**: `id, user_id, topic_id, keyword_title, content, visibility`
