# Documind Project Documentation

## Project Area: AI/ML/DL/Data Science

**Project Details:**
* **Data Collection:** Scanned English and Marathi educational textbooks (PDF format), involving complex multi-column layouts and legacy font encodings.
* **Model Development:** Tesseract OCR configuration, custom Layout-Aware Text Extraction Engine, and a strictly scoped Retrieval-Augmented Generation (RAG) system using Large Language Models.
* **Evaluation:** Extraction accuracy (correct chapter boundary detection, reduction of text scrambling), layout preservation, and RAG relevance metrics (ensuring responses strictly adhere to textbook content).

---

## Index

| Chapter | Content | Page Number |
| :--- | :--- | :--- |
| **Chapter 1** | **Introduction** | 3 |
| 1.1 | Problem Statement | 3 |
| 1.2 | Objectives | 3 |
| 1.3 | Dataset Description | 4 |
| **Chapter 2** | **Literature Review** | 5 |
| 2.1 | Existing Research | 5 |
| 2.2 | Research Gaps | 5 |
| **Chapter 3** | **Methodology** | 6 |
| 3.1 | Data Preprocessing | 6 |
| 3.2 | Model Selection | 7 |
| 3.3 | Implementation | 8 |
| **Chapter 4** | **Results and Discussion** | 10 |
| 4.1 | Model Performance | 10 |
| 4.2 | Visualization | 11 |
| 4.3 | Insights | 12 |
| **Chapter 5** | **Conclusion** | 13 |
| 5.1 | Summary | 13 |
| 5.2 | Future Work | 13 |
| **Chapter 6** | **References** | 14 |
| **Chapter 7** | **Appendices** | 15 |
| **Chapter 8** | **Annexure- Progress Sheet** | 16 |

---

## Chapter 1: Introduction

### 1.1 Problem Statement
Educational institutions face significant challenges in converting physical or unstructured legacy textbooks into structured, digital formats suitable for modern AI applications. Standard OCR solutions often fail on complex multi-column layouts, resulting in scrambled text. Furthermore, existing AI tutors are prone to hallucination and drawing from external sources, which is unacceptable in a strict pedagogical environment where answers must be derived solely from the prescribed curriculum.

### 1.2 Objectives
* **Develop a Layout-Aware Extraction Engine:** Create a robust OCR pipeline capable of mathematically analyzing grid layouts to accurately process multi-column English and Marathi textbooks.
* **Implement an Intelligent Indexing System:** Design a 4-layer extraction pipeline (TOC, Index-Scan, Visual-Body-Scan, Full-Scan) to reliably identify chapter boundaries and metadata.
* **Build a Pedagogical RAG System:** Deploy an end-to-end workflow where students can query a conversational AI that strictly bases its answers on the extracted textbook chapters.

### 1.3 Dataset Description
The system processes real-world educational datasets consisting of PDF textbooks in English and Marathi. These datasets exhibit high variability, including:
* Multi-column text formats.
* Interspersed diagrams, curriculum outcome pages, and credit boards (noise).
* Legacy font encodings that require specialized deduplication and translation heuristics.

---

## Chapter 2: Literature Review

### 2.1 Existing Research
Current document parsing technologies heavily rely on standard Optical Character Recognition (OCR) engines like Tesseract and layout analysis tools. Retrieval-Augmented Generation (RAG) has become the standard for grounding Large Language Models in external knowledge bases, typically utilizing vector databases like ChromaDB or FAISS.

### 2.2 Research Gaps
Most standard extraction tools are designed for single-column, standardized documents and fail spectacularly when confronted with the diverse layouts of regional textbooks. Additionally, general RAG implementations lack the strict scoping required for educational tools, often blending textbook knowledge with general internet knowledge, violating curriculum constraints.

---

## Chapter 3: Methodology

### 3.1 Data Preprocessing
* **Tesseract & Poppler Integration:** Explicitly configured paths for reliable PDF-to-image conversion and character recognition.
* **Legacy Font Decoder:** Implemented regex deduplication and heuristic character mapping to normalize garbled Marathi text.
* **Hard-Lock Filtration:** Automated system to exclude non-relevant pages (curriculum outcomes, index pages, blank pages) from the RAG ingestion pipeline.

### 3.2 Model Selection
* **OCR:** Tesseract OCR (with multi-language support for English and Marathi).
* **Embedding Model:** High-dimensional embedding models used for vectorizing textbook chunks (lazy-loaded to prevent server startup hangs).
* **LLM Engine:** Advanced language models configured with strict system prompts to act as pedagogical tutors, refusing to answer out-of-scope questions.

### 3.3 Implementation
* **Backend (FastAPI):** Python-based API handling asynchronous document processing, extraction workflows, and database interactions (SQLite).
* **Extraction Pipeline:** Incorporates an 'Index Pattern Registry' to save successful extraction logic, adaptive column splitting, and 'Smart Line Stitching' to merge split chapter titles.
* **Frontend (React/Vite):** A dynamic interface featuring a document upload system for admins and a conversational UI with a dynamic chapter-loading sidebar for students.

---

## Chapter 4: Results and Discussion

### 4.1 Model Performance
The layout-aware extraction engine successfully eliminated text scrambling in multi-column layouts. The 4-layer extraction pipeline achieved near-perfect chapter boundary detection across both English and Marathi textbooks, significantly outperforming standard heuristic-based index discovery.

### 4.2 Visualization
The frontend successfully renders a user-friendly Chat UI. The sidebar dynamically loads chapters fetched from the backend, providing students with clear navigation.

### 4.3 Insights
Grid-aware mathematical bounding box analysis is vastly superior to simple pattern matching when dealing with complex textbook formats. Furthermore, maintaining strict RAG boundaries requires a combination of high-quality, cleanly chunked data and highly specific prompt engineering.

---

## Chapter 5: Conclusion

### 5.1 Summary
The DocuMind (EduAI) project successfully delivers an enterprise-grade textbook extraction and tutoring platform. By solving the fundamental issues of layout-aware OCR and strict RAG scoping, it provides a reliable, accurate educational tool tailored for real-world curriculums.

### 5.2 Future Work
* Expansion of the Index Pattern Registry to support additional regional languages and textbook formats.
* Integration of multimodal RAG to allow the AI tutor to actively reference and explain extracted diagrams and images.
* Implementation of advanced student analytics to track learning progress across specific chapters.

---

## Chapter 6: References
1. Tesseract Open Source OCR Engine.
2. FastAPI Framework Documentation.
3. React and Vite Ecosystem Documentation.
4. Advanced RAG Implementation Strategies (System Prompts and Vectorization).

---

## Chapter 7: Appendices
* Appendix A: System Architecture Diagram
* Appendix B: API Endpoint Specifications (`GET /books/{id}/chapters`, `POST /register`, etc.)

---

## Chapter 8: Annexure- Progress Sheet
* **Phase 1:** Backend Setup and OCR Integration (Completed)
* **Phase 2:** Multi-Column & Marathi Layout Extraction Engine (Completed)
* **Phase 3:** RAG System and Vector Database Ingestion (Completed)
* **Phase 4:** Frontend UI/UX and Integration (Completed)
* **Phase 5:** System Testing and Optimization (In Progress)
