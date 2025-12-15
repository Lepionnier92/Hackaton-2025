
import { useState } from 'react';
import { View, Text, Button, Image } from 'react-native';
export default function App() {
  const  [disponible, setDisponible] = useState(false);
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image 
        source={{uri: "https://i.pravatar.cc/150"}}
        className="w-32 h-32 rounded-full mb-4"
      />
      <Text className="text-2xl font-bold">Jean Dupont</Text>
      <Text className="text-green-600">Technicien Reseau - Paris</Text>
      <Text className="text-lg mb-2">
        Statut: {disponible ? 'Disponible' : 'Indisponible'}  
      </Text>
      <Button title="Changer le statut" onPress={() => setDisponible(!disponible)}/>
    </View>
  );
}