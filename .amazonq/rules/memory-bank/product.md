# Product Overview — ATS Forge

## Purpose & Value Proposition
ATS Forge is an AI-powered resume and career toolkit designed to help job seekers create ATS-optimized resumes, cover letters, and manage their job search. It leverages Groq's LLaMA 3.3 70B model to auto-parse uploaded resumes and intelligently populate resume sections, dramatically reducing manual data entry.

## Key Features & Capabilities

### Resume Builder
- AI-powered resume parsing: upload PDF/TXT and auto-fill all 8 resume sections via Groq LLM
- Live editable resume sections: personal info, summary, experience, education, skills, projects, certifications, languages
- Multiple export options: PDF download via html2pdf.js
- Font customization via FontPickerPanel
- ATS-friendly formatting and layout

### Cover Letter Builder
- Dedicated cover letter creation page with structured editor
- Tailored to job descriptions

### LaTeX Resume Editor
- Monaco-based LaTeX editor for advanced users
- Multiple professional templates: Jake's Resume, AltaCV, AwesomeCV, ModernCV, FAANG Resume
- Live PDF preview via backend LaTeX compilation service
- Template selector with one-click loading

### Job Portals
- Curated job portal directory/links page

### Networking
- Networking resources and tools page

### Authentication
- Supabase-based auth (login/signup) at `/auth` route

## Target Users
- Job seekers wanting ATS-optimized resumes quickly
- Professionals needing polished cover letters
- Technical users wanting LaTeX-based resume templates
- Anyone managing a job search workflow

## Use Cases
1. Upload existing resume → AI parses and rebuilds it in ATS format
2. Start from scratch using structured form sections
3. Use LaTeX editor for premium typeset resumes
4. Generate cover letters matched to job descriptions
5. Browse curated job portals and networking resources
