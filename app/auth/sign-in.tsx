import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data.user; if (!user) throw new Error('No user');

      const { data: profile, error: pErr } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (pErr) throw pErr;

      if (profile?.role === 'coach') router.replace('/home/coach');
      else router.replace('/home/usuario');
    } catch (e: any) {
      console.error('SignIn error:', e);
      Alert.alert('Error', e?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user; if (!u) return;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', u.id).single();
      if (profile?.role === 'coach') router.replace('/home/coach');
      else router.replace('/home/usuario');
    });
  }, []);

  return (
    <View style={{ flex: 1, gap: 12, padding: 24, backgroundColor: '#000', justifyContent: 'center' }}>
      <Text style={{ color: '#CF7022', fontSize: 24, fontWeight: '700' }}>Iniciar sesión</Text>
      <TextInput placeholder="Email" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" style={s.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Contraseña" placeholderTextColor="#888" secureTextEntry style={s.input} value={password} onChangeText={setPassword} />
      <TouchableOpacity disabled={loading} onPress={onSignIn} style={{ backgroundColor: '#CF7022', padding: 12, borderRadius: 8, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: '#000', textAlign: 'center' }}>{loading ? 'Entrando…' : 'Entrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = {
  input: { backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 8, borderColor: '#333', borderWidth: 1 },
} as const;
