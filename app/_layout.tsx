import { Stack, useSegments, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const segments = useSegments();          // ruta actual en segmentos
  const router = useRouter();
  const [bootLoading, setBootLoading] = useState(true);
  const [role, setRole] = useState<'coach' | 'usuario' | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  // Carga inicial: ¿hay sesión? ¿qué rol tiene?
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getSession();
        const session = sessionRes.session;
        setIsAuthed(!!session);

        if (session?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const r = (prof?.role === 'coach' ? 'coach' : 'usuario') as 'coach' | 'usuario';
          if (mounted) setRole(r);
        } else {
          if (mounted) setRole(null);
        }
      } finally {
        if (mounted) setBootLoading(false);
      }
    };

    init();

    // Mantener estado en cambios de auth (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthed(!!session);
      if (session?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(prof?.role === 'coach' ? 'coach' : 'usuario');
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Redirecciones
  useEffect(() => {
    if (bootLoading || isAuthed === null) return;

    const inAuth = segments[0] === 'auth'; // rutas /auth/*
    if (!isAuthed) {
      // Si no hay sesión: solo permitimos /auth/*
      if (!inAuth) router.replace('/auth/sign-in');
      return;
    }

    // Con sesión: si está en /auth/*, lo mandamos a su home por rol
    if (inAuth) {
      if (role === 'coach') router.replace('/home/coach');
      else router.replace('/home/usuario');
      return;
    }

    // Si intenta entrar a la home del otro rol, lo mandamos a la suya
    const inCoach = segments.includes('coach');
    const inUser = segments.includes('usuario');

    if (role === 'coach' && inUser) router.replace('/home/coach');
    if (role === 'usuario' && inCoach) router.replace('/home/usuario');
  }, [bootLoading, isAuthed, role, segments]);

  if (bootLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ color: '#fff', marginTop: 8 }}>Cargando…</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
