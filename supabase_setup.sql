-- Run this in your Supabase SQL Editor

-- Study Materials
create table if not exists study_materials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  source_type text default 'text',
  file_url text,
  content text,
  summary text,
  key_topics jsonb default '[]',
  audio_url text,
  word_count integer,
  estimated_read_time integer
);

-- Quizzes
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  material_id uuid references study_materials(id) on delete cascade,
  title text not null,
  subject text,
  difficulty text default 'medium',
  questions jsonb default '[]',
  total_questions integer default 0
);

-- Flashcards
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  material_id uuid references study_materials(id) on delete cascade,
  subject text,
  front text not null,
  back text not null,
  hint text,
  ease_factor float default 2.5,
  interval_days integer default 1,
  repetitions integer default 0,
  next_review_date date,
  last_reviewed timestamptz,
  mastery_level text default 'new'
);

-- Quiz Attempts
create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  quiz_id uuid references quizzes(id) on delete cascade,
  quiz_title text,
  subject text,
  score float,
  correct_count integer,
  total_questions integer,
  time_spent_seconds integer,
  difficulty text,
  answers jsonb default '[]'
);

-- Study Sessions
create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  material_id uuid references study_materials(id) on delete cascade,
  activity_type text not null,
  subject text,
  duration_minutes float,
  notes text
);

-- Enable Row Level Security on all tables
alter table study_materials enable row level security;
alter table quizzes enable row level security;
alter table flashcards enable row level security;
alter table quiz_attempts enable row level security;
alter table study_sessions enable row level security;

-- RLS Policies (users can only see their own data)
create policy "Users can manage their own study_materials" on study_materials for all using (auth.uid() = user_id);
create policy "Users can manage their own quizzes" on quizzes for all using (auth.uid() = user_id);
create policy "Users can manage their own flashcards" on flashcards for all using (auth.uid() = user_id);
create policy "Users can manage their own quiz_attempts" on quiz_attempts for all using (auth.uid() = user_id);
create policy "Users can manage their own study_sessions" on study_sessions for all using (auth.uid() = user_id);

-- Storage bucket for file uploads
insert into storage.buckets (id, name, public) values ('study-files', 'study-files', true) on conflict do nothing;
create policy "Users can upload their own files" on storage.objects for insert with check (bucket_id = 'study-files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Files are publicly readable" on storage.objects for select using (bucket_id = 'study-files');
create policy "Users can delete their own files" on storage.objects for delete using (bucket_id = 'study-files' and auth.uid()::text = (storage.foldername(name))[1]);
