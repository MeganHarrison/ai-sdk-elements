-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Project information
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled', 'not_started')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  
  -- Dates
  start_date DATE,
  due_date DATE,
  
  -- Client and team
  client_name TEXT,
  team_members TEXT[] DEFAULT '{}',
  
  -- Financial
  budget DECIMAL(10, 2),
  
  -- Progress tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Additional metadata
  tags TEXT[] DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to view all projects
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to insert projects
CREATE POLICY "Users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to update projects
CREATE POLICY "Users can update projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to delete projects
CREATE POLICY "Users can delete projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample projects (optional - remove in production)
INSERT INTO projects (title, description, status, priority, start_date, due_date, client_name, budget, team_members, tags)
VALUES 
  ('Website Redesign', 'Complete redesign of company website with modern UI/UX', 'active', 'high', '2024-01-15', '2024-04-15', 'Acme Corp', 50000, ARRAY['John Doe', 'Jane Smith'], ARRAY['web', 'design']),
  ('Mobile App Development', 'Native iOS and Android app for customer portal', 'active', 'medium', '2024-02-01', '2024-06-30', 'Tech Solutions Inc', 120000, ARRAY['Mike Johnson', 'Sarah Williams', 'Tom Brown'], ARRAY['mobile', 'app']),
  ('Database Migration', 'Migrate legacy database to cloud infrastructure', 'not_started', 'high', '2024-03-01', '2024-05-01', 'Enterprise Co', 30000, ARRAY['David Lee'], ARRAY['database', 'cloud']),
  ('Marketing Campaign', 'Q2 2024 digital marketing campaign', 'completed', 'low', '2024-01-01', '2024-03-31', 'StartUp LLC', 15000, ARRAY['Emma Davis', 'Chris Wilson'], ARRAY['marketing', 'digital']);