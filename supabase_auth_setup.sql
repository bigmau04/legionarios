-- ══════════════════════════════════════════
-- AUTH SETUP — Ejecutar en Supabase SQL Editor
-- ══════════════════════════════════════════

-- Tabla de perfiles (vincula auth.users con roles)
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'player',   -- 'admin' | 'player'
  player_id BIGINT REFERENCES players(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve y edita solo su propio perfil
DROP POLICY IF EXISTS "own_profile" ON profiles;
CREATE POLICY "own_profile" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admins ven todos los perfiles
DROP POLICY IF EXISTS "admin_see_all_profiles" ON profiles;
CREATE POLICY "admin_see_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Actualizar RLS de las tablas existentes ──

-- Players: admin ve todo, jugador solo se ve a sí mismo
DROP POLICY IF EXISTS "public_all" ON players;
DROP POLICY IF EXISTS "admin_all_players" ON players;
CREATE POLICY "admin_all_players" ON players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "player_see_self" ON players;
CREATE POLICY "player_see_self" ON players
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND player_id = players.id)
  );

-- Payments: admin ve todo, jugador solo sus pagos
DROP POLICY IF EXISTS "public_all" ON payments;
DROP POLICY IF EXISTS "admin_all_payments" ON payments;
CREATE POLICY "admin_all_payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "player_see_own_payments" ON payments;
CREATE POLICY "player_see_own_payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND player_id = payments.player_id)
  );

-- Events: todos pueden ver
DROP POLICY IF EXISTS "public_all" ON events;
DROP POLICY IF EXISTS "all_see_events" ON events;
CREATE POLICY "all_see_events" ON events FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin_manage_events" ON events;
CREATE POLICY "admin_manage_events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Attendance: admin ve todo, jugador solo las suyas
DROP POLICY IF EXISTS "public_all" ON attendance_requests;
DROP POLICY IF EXISTS "admin_all_attendance" ON attendance_requests;
CREATE POLICY "admin_all_attendance" ON attendance_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "player_manage_own_attendance" ON attendance_requests;
CREATE POLICY "player_manage_own_attendance" ON attendance_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND player_id = attendance_requests.player_id)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND player_id = attendance_requests.player_id)
  );

-- Config: solo admin
DROP POLICY IF EXISTS "public_all" ON club_config;
DROP POLICY IF EXISTS "admin_config" ON club_config;
CREATE POLICY "admin_config" ON club_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Función automática: crear perfil al registrar usuario ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_player_id BIGINT;
  new_name TEXT;
BEGIN
  new_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  
  -- Insertar en players y obtener el ID
  INSERT INTO public.players (name, category, status)
  VALUES (new_name, 'Primera', 'Activo')
  RETURNING id INTO new_player_id;

  -- Insertar en profiles
  INSERT INTO public.profiles (id, full_name, role, player_id)
  VALUES (
    NEW.id,
    new_name,
    COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
    new_player_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Crear el primer admin (ejecutar DESPUÉS de crear el usuario en Supabase Auth) ──
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'TU_CORREO_AQUI');
