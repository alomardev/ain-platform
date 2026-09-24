CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('m','f')),
  national_id TEXT,
  birth_date TEXT,
  phone TEXT,
  email TEXT,
  qualification TEXT,
  job TEXT,
  join_date TEXT,
  photo TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);

CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT,
  category TEXT NOT NULL CHECK (category IN ('person','company')),
  since TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('internal','external')),
  executor_name TEXT,
  executor_logo TEXT,
  location TEXT,
  supervisor_name TEXT,
  beneficiaries INTEGER DEFAULT 0,
  date_mode TEXT NOT NULL CHECK (date_mode IN ('single','range','multiple')),
  dates TEXT NOT NULL DEFAULT '[]',
  logo TEXT,
  notes TEXT,
  status TEXT DEFAULT 'مكتمل'
);

CREATE TABLE IF NOT EXISTS program_sponsors (
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  sponsor_id INTEGER NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, sponsor_id)
);

CREATE TABLE IF NOT EXISTS program_partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  hours REAL NOT NULL DEFAULT 0,
  is_supervisor INTEGER NOT NULL DEFAULT 0,
  is_deputy INTEGER NOT NULL DEFAULT 0,
  date TEXT
);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_id INTEGER NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES programs(id) ON DELETE SET NULL,
  support_type TEXT NOT NULL CHECK (support_type IN ('cash','inkind')),
  amount REAL NOT NULL DEFAULT 0,
  inkind_item TEXT,
  date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_participations_volunteer ON participations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_participations_program ON participations(program_id);
CREATE INDEX IF NOT EXISTS idx_donations_sponsor ON donations(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_donations_program ON donations(program_id);
