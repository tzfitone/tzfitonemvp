import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

type Profile = { name: string | null; last_name: string | null; role: string | null };

export default function UsuarioHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr('');

        const { data: uData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        const user = uData.user;
        if (!user) throw new Error('No hay usuario activo');

        setEmail(user.email ?? '');

        const { data, error } = await supabase
          .from('profiles')
          .select('name,last_name,role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data as Profile);
      } catch (e: any) {
        setErr(e?.message ?? 'No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/sign-in');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ color: '#fff', marginTop: 8 }}>Cargando…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#CF7022', fontSize: 18, marginBottom: 8 }}>Error</Text>
        <Text style={{ color: '#fff', textAlign: 'center' }}>{err}</Text>
        <TouchableOpacity onPress={onLogout} style={{ marginTop: 20, backgroundColor: '#CF7022', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#000' }}>Volver a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName = [profile?.name, profile?.last_name].filter(Boolean).join(' ') || 'Sin nombre';
  const role = profile?.role ?? 'usuario';

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 24 }}>
      {/* Header */}
      <View style={{ marginTop: 24, marginBottom: 24 }}>
        <Text style={{ color: '#CF7022', fontSize: 24, fontWeight: '700' }}>Inicio</Text>
        <Text style={{ color: '#aaa', marginTop: 4 }}>Hola, {fullName}</Text>
      </View>

      {/* Tarjeta perfil */}
      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 16, borderColor: '#333', borderWidth: 1 }}>
        <Row label="Nombre" value={fullName} />
        <Row label="Email" value={email || '—'} />
        <Row label="Rol" value={role} />
      </View>

      {/* Acciones */}
      <View style={{ marginTop: 24 }}>
        <TouchableOpacity onPress={onLogout} style={{ backgroundColor: '#CF7022', padding: 12, borderRadius: 8, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#000' }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <Text style={{ color: '#888', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 16 }}>{value}</Text>
    </View>
  );
}
