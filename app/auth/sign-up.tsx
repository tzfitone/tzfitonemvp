import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function SignUp() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const router = useRouter();

  const log = (msg: string) => {
    setStatus(msg);
    console.log('[SignUp]', msg);
  };

  const onSignUp = async () => {
    try {
      if (!email || !password) throw new Error('Email y contraseña son obligatorios');
      setLoading(true);
      setStatus('');

      log('1) signUp...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      log('2) comprobar sesión...');
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (!sessionCheck.session) {
        log('2.1) no hay sesión tras signUp → signInWithPassword...');
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      }

      log('3) obtener usuario...');
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData.user;
      if (!user) throw new Error('No se obtuvo el usuario autenticado');

      const finalRole = role === 'coach' ? 'coach' : 'usuario';

      log('4) upsert de perfil...');
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, name, last_name: lastName, role: finalRole },
          { onConflict: 'id' } // si existe, actualiza; si no, inserta
        );
      if (upsertErr) throw upsertErr;

      log(`5) redirigiendo a /home/${finalRole} ...`);
      router.replace(`/home/${finalRole}`);
    } catch (e: any) {
      console.error('SignUp error:', e);
      setStatus(`❌ ${e?.message ?? 'No se pudo registrar'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, gap: 12, padding: 24, backgroundColor: '#000', justifyContent: 'center' }}>
      <Text style={{ color: '#CF7022', fontSize: 24, fontWeight: '700' }}>
        Crear cuenta ({role === 'coach' ? 'coach' : 'usuario'})
      </Text>

      <TextInput placeholder="Nombre" placeholderTextColor="#888" style={s.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Apellido" placeholderTextColor="#888" style={s.input} value={lastName} onChangeText={setLastName} />
      <TextInput placeholder="Email" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" style={s.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Contraseña" placeholderTextColor="#888" secureTextEntry style={s.input} value={password} onChangeText={setPassword} />

      <TouchableOpacity disabled={loading} onPress={onSignUp}
        style={{ backgroundColor: '#CF7022', padding: 12, borderRadius: 8, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: '#000', textAlign: 'center' }}>{loading ? 'Creando…' : 'Registrarse'}</Text>
      </TouchableOpacity>

      {!!status && (
        <Text style={{ color: '#fff', marginTop: 8 }}>Estado: {status}</Text>
      )}
    </View>
  );
}

const s = {
  input: { backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 8, borderColor: '#333', borderWidth: 1 },
} as const;
