-- Add updated_at column (auto-updated by trigger)
ALTER TABLE conversations
  ADD COLUMN updated_at TIMESTAMPTZ,
  ADD COLUMN choices JSONB NOT NULL DEFAULT '[]';

-- Trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Deduplicate before adding unique constraint, keeping the most recently created row
DELETE FROM conversations
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, topic_id, relationship_id) id
  FROM conversations
  ORDER BY user_id, topic_id, relationship_id, created_at DESC
);

-- Unique constraint enabling upsert ON CONFLICT (user_id, topic_id, relationship_id)
-- Ensures exactly one progress row per user per topic per relationship
ALTER TABLE conversations
  ADD CONSTRAINT conversations_user_topic_rel_unique UNIQUE (user_id, topic_id, relationship_id);
