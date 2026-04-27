CREATE POLICY "rel_delete" ON relationships FOR DELETE USING (auth.uid() = user_id);
