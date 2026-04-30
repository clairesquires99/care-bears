CREATE POLICY "conv_delete" ON conversations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "ans_delete" ON answers FOR DELETE USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);
