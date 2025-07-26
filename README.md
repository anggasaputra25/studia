# 📚 Studia

Studia adalah platform pembelajaran berbasis web yang dirancang untuk membantu mahasiswa dalam memahami materi kuliah secara lebih efektif. Dengan menggunakan teknologi terkini seperti *Next.js, **Tailwind CSS, **Supabase, dan **Gemini AI*, Studia menyederhanakan materi, menyediakan kuis otomatis, dan menghadirkan diskusi interaktif dengan AI.

## 🚀 Fitur Utama

1. *Simplify Materi*

   - Dosen dapat mengunggah materi pembelajaran.
   - Mahasiswa dapat menyederhanakan materi tersebut dengan bantuan AI Gemini.
   - Mahasiswa juga dapat mengunggah file mandiri untuk disederhanakan.

2. *Generate Quiz dengan AI*

   - AI Gemini menghasilkan pertanyaan kuis dari materi unggahan.
   - Mahasiswa juga dapat mengunggah file mandiri untuk menghasilkan kuis personal.

3. *Diskusi Interaktif dengan AI*
   - Chat interaktif seputar materi dengan AI.
   - Bisa langsung mengupload file dan berdiskusi dengan AI.

## 🛠️ Teknologi yang Digunakan

- *Next.js* – Framework React modern untuk SSR dan pengelolaan halaman.
- *Tailwind CSS* – Utility-first CSS framework untuk styling yang cepat dan konsisten.
- *Supabase* – Backend as a Service yang menyediakan database, auth, dan storage.
- *Gemini AI (Google AI)* – Digunakan untuk menyederhanakan materi, membuat kuis, dan chat berbasis materi.

## 📁 Struktur Folder

bash
studia/
├── app/                        # Routing dan page level components
│   ├── auth/                   # Login/Register pages
│   ├── courses/                # Course dan materi terkait
│   └── api/                    # API routes (Next.js route handlers)
├── components/                 # Komponen UI reusable
│   ├── ui/                     # Shadcn UI, tombol, card, dialog, dll
├── lib/                        # Helper, Supabase client, Gemini wrapper
│   ├── supabase/               # Supabase client dan API util
│   └── gemini/                 # Konfigurasi dan request Gemini API
├── public/                     # Aset statis
├── middleware.ts               # Proteksi route (auth middleware)
├── tailwind.config.ts          # Konfigurasi Tailwind
├── tsconfig.json               # Konfigurasi TypeScript
└── README.md                   # Dokumentasi proyek


## 🎓 Arsitektur Studia

1. 🔐 Authentication

   - Login menggunakan Supabase Auth (email/password) & google

2. 📚 Materi Pembelajaran

   - Dosen meng-upload materi (PDF) ke Supabase Storage
   - Data metadata materi disimpan di Supabase Database (tabel materials)

3. 🧠 Simplify Materi Menggunakan AI

   - Mahasiswa memilih file yang sudah ada, ataupun mengunggah file mandiri
   - Mahasiswa klik tombol "Mulai"
   - Materi dikirim ke Google Gemini untuk disederhanakan
   - Hasil disimpan ke tabel simplify_materials

4. ❓ Quiz Generator

   - AI Gemini menghasilkan kuis berbasis materi yang di-upload
   - Format: Multiple Choice
   - Dapat berasal dari materi dosen atau upload mandiri mahasiswa

5. 💬 Diskusi AI

   - Chatbot berbasis Gemini AI dengan konteks materi yang diberikan
   - Mendukung upload file mandiri dan tanya jawab

6. 🗂️ Penyimpanan
   - File materi: Supabase Storage
   - Metadata: Supabase Database

## 📦 Database Struktur (Supabase)

📄 *users*

- id
- name
- role
- created_at

📄 *courses*

- id
- name
- program
- instructor
- weeks
- time_start
- time_end
- student_count
- created_at

📄 *materials*

- id
- name
- course_id (FK → courses)
- created_at

📄 *material_files*

- id
- material_id (FK → materials)
- file_name
- file_path
- file_url
- created_at

📄 *simplify_materials*

- id
- material_id (FK → materials)
- student_id (FK → users)
- title
- simplified_content
- created_at

📄 *quiz*

- id
- course_id (FK → courses)
- student_id (FK → users)
- title
- question_count
- poin_per_question
- attended
- finished
- created_at

📄 *quiz_questions*

- id
- quiz_id (FK → quiz)
- number
- question
- option_a / b / c / d
- correct_answer
- created_at

📄 *quiz_answer*

- id
- qq_id (FK → quiz_questions)
- student_id (FK → users)
- option
- student_answer
- is_correct
- created_at

📄 *quiz_result*

- id
- quiz_id (FK → quiz)
- student_id (FK → users)
- total_point
- created_at

📄 *discussion*

- id
- course_id (FK → courses)
- student_id (FK → users)
- prompt
- answer
- created_at

📄 *discussion_files*

- id
- discussion_id (FK → discussion)
- mf_id (FK → material_files)
- created_at

📄 *additional_discussion_files*

- id
- discussion_id (FK → discussion)
- file_name
- file_type
- file_path
- created_at

## 📌 Cara Menjalankan

bash
# Install dependencies
npm install

# Jalankan pengembangan lokal
npm run dev


Pastikan .env.local terisi dengan:

bash
NEXT_PUBLIC_SUPABASE_URL=https://jyclbbpodkkecxttswcq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Y2xiYnBvZGtrZWN4dHRzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0OTA4NDksImV4cCI6MjA2OTA2Njg0OX0.CrkmY4vEhjIctyFoKNvEFa_tFeWnR-qard7ZUPQjAvM
GEMINI_API_KEY=AIzaSyBGpO4EWgga1Nij3xDed0kKsfK6MFBD3rY


## 🤝 Kontributor

- I Ketut Danar Cahyadi
- I Putu Adi Saputra
- I Ketut Angga Saputra
- I Komang Gede Sutrisna

## 📜 Lisensi

All rights reserved. © 2025 Studia Team.
