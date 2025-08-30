import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthIndex() {
  const router = useRouter();
  return (
    <View style={{ flex:1, backgroundColor:'#000', alignItems:'center', justifyContent:'center', gap:16, padding:24 }}>
      <Text style={{ color:'#CF7022', fontSize:24, fontWeight:'700' }}>¿Cómo quieres entrar?</Text>

      <TouchableOpacity onPress={() => router.push('/auth/sign-up?role=coach')}
        style={{ backgroundColor:'#CF7022', padding:12, borderRadius:8, width:220 }}>
        <Text style={{ color:'#000', textAlign:'center', fontWeight:'600' }}>Crear cuenta Coach</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/sign-up?role=usuario')}
        style={{ backgroundColor:'#CF7022', padding:12, borderRadius:8, width:220 }}>
        <Text style={{ color:'#000', textAlign:'center', fontWeight:'600' }}>Crear cuenta Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/sign-in')}
        style={{ marginTop:8 }}>
        <Text style={{ color:'#fff', textDecorationLine:'underline' }}>Ya tengo cuenta (Iniciar sesión)</Text>
      </TouchableOpacity>
    </View>
  );
}
