-- Store free-text input variables collected during story playthrough
ALTER TABLE conversations
  ADD COLUMN variables JSONB NOT NULL DEFAULT '{}';
