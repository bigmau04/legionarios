-- ══════════════════════════════════════
-- LEGIONARIOS R.C. — Setup Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════

-- ── Jugadores ──
CREATE TABLE IF NOT EXISTS players (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Activo',
  phone       TEXT,
  monthly_fee INTEGER DEFAULT 50000,
  last_payment DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Pagos ──
CREATE TABLE IF NOT EXISTS payments (
  id         BIGSERIAL PRIMARY KEY,
  player_id  BIGINT REFERENCES players(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  amount     INTEGER NOT NULL,
  date       DATE NOT NULL,
  method     TEXT,
  status     TEXT DEFAULT 'Completado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Eventos ──
CREATE TABLE IF NOT EXISTS events (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TEXT,
  location    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Solicitudes de Asistencia ──
CREATE TABLE IF NOT EXISTS attendance_requests (
  id           BIGSERIAL PRIMARY KEY,
  player_id    BIGINT,
  player_name  TEXT,
  event_id     BIGINT,
  event_title  TEXT,
  date         DATE,
  status       TEXT DEFAULT 'Pendiente',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Configuración del Club (fila única) ──
CREATE TABLE IF NOT EXISTS club_config (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  club_name     TEXT DEFAULT 'Legionarios',
  tagline       TEXT DEFAULT 'Rugby Club',
  primary_color TEXT DEFAULT '#FDC010',
  default_fees  JSONB DEFAULT '{"M16":45000,"M18":50000,"Primera":60000,"Veteranos":55000}',
  categories    JSONB DEFAULT '["M16","M18","Primera","Veteranos"]',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security (acceso público por ahora, agregar auth después) ──
ALTER TABLE players              ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_config          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON players             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON payments            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON events              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON attendance_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON club_config         FOR ALL USING (true) WITH CHECK (true);

-- ── Datos de ejemplo ──
INSERT INTO club_config (id) VALUES (1) ON CONFLICT DO NOTHING;

INSERT INTO players (name, category, status, phone, monthly_fee, last_payment) VALUES
  ('Mateo Salazar',  'M18',     'Activo',         '3001234567', 50000, '2026-04-25'),
  ('David Restrepo', 'Primera', 'Lesionado',       '3012345678', 60000, '2026-04-24'),
  ('Camilo Torres',  'M16',     'Activo',          '3023456789', 45000, '2026-04-22'),
  ('Santiago Velez', 'Primera', 'Pendiente Pago',  '3034567890', 60000, '2026-03-20')
ON CONFLICT DO NOTHING;

INSERT INTO events (title, type, date, time, location, description) VALUES
  ('vs Barbarians RC',      'Partido', '2026-04-29', '15:30', 'Cancha 4',       'Partido de liga local. Llevar kit completo.'),
  ('Entrenamiento Táctico', 'Entreno', '2026-04-28', '18:00', 'Sede Principal', 'Táctica de melé y line-out.'),
  ('Asamblea del Club',     'Reunión', '2026-05-03', '19:00', 'Sede Principal', 'Revisión de presupuesto semestral.'),
  ('vs Titanes RC',         'Partido', '2026-05-12', '14:00', 'Estadio Norte',  'Partido amistoso.'),
  ('Entrenamiento Física',  'Entreno', '2026-05-07', '07:00', 'Cancha 4',       'Trabajo físico y velocidad.')
ON CONFLICT DO NOTHING;
