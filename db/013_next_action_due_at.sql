ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_velvet_next_actions_due
  ON velvet_professional_next_actions(workspace_id,user_id,status,due_at);
