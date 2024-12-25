import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Image, Animated, Easing, Dimensions } from 'react-native';
import axios from 'axios';

// Получаем размеры экрана
const { height, width } = Dimensions.get('window');

export default function App() {
  const [pokemon, setPokemon] = useState(null); // Данные о покемоне
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [pokemonId, setPokemonId] = useState(1); // ID покемона (по умолчанию 1)
  const [throwing, setThrowing] = useState(false); // Состояние для анимации броска покебола
  const [animation] = useState(new Animated.Value(0)); // Начальное значение для анимации
  const [pokeballScale] = useState(new Animated.Value(1)); // Начальный масштаб покебола
  const [pokeballOpacity] = useState(new Animated.Value(1)); // Начальная прозрачность покебола

  // Функция для получения данных о покемоне
  const fetchPokemonData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      setPokemon(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для начала анимации броска покебола
  const throwPokeball = () => {
    setThrowing(true);
    // Сначала анимируем прыжок в центр
    Animated.sequence([
      // 1. Покебол прыгает в центр экрана
      Animated.timing(animation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.bounce, // Прыжок с отскоком
      }),

      // 2. После того как покебол в центре, анимируем взрыв
      Animated.parallel([
        // Увеличиваем масштаб покебола
        Animated.timing(pokeballScale, {
          toValue: 5, // Масштабируем покебол до 5 раз больше
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        // Прозрачность исчезает
        Animated.timing(pokeballOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        })
      ])
    ]).start(() => {
      setThrowing(false);
      setPokemonId(pokemonId + 1); // Переходим к следующему покемону
      // Возвращаем покебол к исходному состоянию
      pokeballScale.setValue(1);
      pokeballOpacity.setValue(1);
      animation.setValue(0);
    });
  };

  useEffect(() => {
    fetchPokemonData();
  }, [pokemonId]);

  // Переводим значение анимации в смещение
  const moveY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height / 2 + 50], // Покебол двигается вверх в центр экрана
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PokeApp</Text>

      {/* Информация о покемоне */}
      {loading ? (
        <Text>Загрузка...</Text>
      ) : pokemon ? (
        <View style={styles.pokemonContainer}>
          <Text style={styles.pokemonName}>{pokemon.name.toUpperCase()}</Text>
          <Image source={{ uri: pokemon.sprites.front_default }} style={styles.pokemonImage} />
        </View>
      ) : (
        <Text>Не удалось загрузить покемона</Text>
      )}

      {/* Кнопка для запуска анимации */}
      <Button title="Бросить Покебол" onPress={throwPokeball} />

      {/* Анимация покебола */}
      <View style={styles.pokeballContainer}>
        <Animated.View
          style={[
            styles.pokeball,
            {
              transform: [
                { translateY: moveY }, // Применяем анимацию движения
                { scale: pokeballScale }, // Применяем анимацию масштаба (взрыв)
              ],
              opacity: pokeballOpacity, // Применяем анимацию прозрачности
            },
          ]}
        >
          <Image
            source={require('./assets/pokeball.png')} // Убедитесь, что путь правильный
            style={styles.pokeballImage}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pokemonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pokemonImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  pokeballContainer: {
    bottom: -190,
    transform: [{ translateX: -30 }], // Сдвигаем покебол в центр экрана
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokeball: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', 
    bottom: 0,
  },
  pokeballImage: {
    width: 50,
    height: 50,
  },
});
