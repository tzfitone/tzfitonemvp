import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, gap: 16, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#000' }}>
      <Text style={{ color: '#CF7022', fontSize: 32, fontWeight: '700' }}>TzFitOne</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Link href="/auth/sign-up?role=coach" asChild>
          <TouchableOpacity style={{ backgroundColor: '#CF7022', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#000' }}>Registrarse como Coach</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/auth/sign-up?role=usuario" asChild>
          <TouchableOpacity style={{ backgroundColor: '#7789AB', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#000' }}>Registrarse como Usuario</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <Link href="/auth/sign-in" asChild>
        <TouchableOpacity style={{ borderColor: '#CF7022', borderWidth: 1, padding: 12, borderRadius: 8, marginTop: 12 }}>
          <Text style={{ color: '#CF7022' }}>Iniciar sesión</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
