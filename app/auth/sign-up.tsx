import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function SignUp() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSignUp = async () => {
    try {
      if (!email || !password) throw new Error('Email y contraseña son obligatorios');
      setLoading(true);

      // 1) Registro
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      // 2) Asegurar sesión (algunos proyectos no la tienen tras signUp)
      //    Solo si no hay sesión activa intentamos iniciar sesión automáticamente.
      const { data: sessionCheck } = await supabase.auth.getSession();
      if (!sessionCheck.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      }

      // 3) Obtener usuario autenticado
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData.user;
      if (!user) throw new Error('No se obtuvo el usuario autenticado');

      // 4) Actualizar perfil (el trigger pudo crear la fila vacía)
      const finalRole = role === 'coach' ? 'coach' : 'usuario';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          last_name: lastName,
          role: finalRole,
        })
        .eq('id', user.id);
      if (updateError) throw updateError;

      // 5) Redirigir según rol
      if (finalRole === 'coach') router.replace('/home/coach');
      else router.replace('/home/usuario');
    } catch (e: any) {
      console.error('SignUp error:', e);
      Alert.alert('Error', e?.message ?? 'No se pudo registrar');
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
      <TouchableOpacity disabled={loading} onPress={onSignUp} style={{ backgroundColor: '#CF7022', padding: 12, borderRadius: 8, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: '#000', textAlign: 'center' }}>{loading ? 'Creando…' : 'Registrarse'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = {
  input: { backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 8, borderColor: '#333', borderWidth: 1 },
} as const;
