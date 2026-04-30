CREATE POLICY "conv_delete" ON conversations FOR DELETE USING (auth.uid() = user_id);
