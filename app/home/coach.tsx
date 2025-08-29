import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function CoachHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, last_name, role')
        .eq('id', user.id)
        .single();
      if (!error) setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/sign-in');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#CF7022" />
      ) : (
        <>
          <Text style={{ color: '#CF7022', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>
            Bienvenido, Coach
          </Text>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 4 }}>
            Nombre: {profile?.name ?? '—'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 20 }}>
            Apellido: {profile?.last_name ?? '—'}
          </Text>

          <TouchableOpacity
            onPress={onLogout}
            style={{ backgroundColor: '#CF7022', padding: 12, borderRadius: 8, width: 160 }}
          >
            <Text style={{ color: '#000', textAlign: 'center', fontWeight: '600' }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
