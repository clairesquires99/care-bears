-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships (people the child wants to send conversations to)
CREATE TABLE relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (a topic sent to a relationship)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  relationship_id UUID REFERENCES relationships,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  access_code TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers (submitted by parent)
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- relationships
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rel_select" ON relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rel_insert" ON relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rel_update" ON relationships FOR UPDATE USING (auth.uid() = user_id);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select_child" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conv_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conv_update_child" ON conversations FOR UPDATE USING (auth.uid() = user_id);
-- Parent (anon) can read non-draft conversations for code validation
CREATE POLICY "conv_select_anon" ON conversations FOR SELECT USING (status <> 'draft');
-- Parent (anon) can update status to in-progress/completed
CREATE POLICY "conv_update_anon" ON conversations FOR UPDATE USING (status <> 'draft');

-- answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ans_select" ON answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY "ans_insert" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "ans_update" ON answers FOR UPDATE USING (true);
