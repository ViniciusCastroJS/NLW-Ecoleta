import React, {useState, useEffect} from 'react';
import {Feather as Icon} from '@expo/vector-icons';
import {View, StyleSheet, Text, Image, TouchableOpacity, Alert} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import  Constants from 'expo-constants'
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import {SvgUri} from 'react-native-svg'
import api from '../../services/api';
import * as Location from 'expo-location'

const Points = () => {

  interface Point {
    id: number,
    name: string,
    image: string,
    image_url: string,
    latitude: number,
    longitude: number,
  }
  
  interface Item {
    id: number,
    title: string,
    image_url: string
  }

  interface Params {
    uf: string,
    city: string,
  }
  
  const navigation = useNavigation();
  const Route = useRoute();
  const RouteParams = Route.params as Params;
  const [initialPosition,setinitialPosition] = useState<[number, number]>([0,0])
  const [items,setItems] = useState<Item[]>([])
  const [points,setpoints] = useState<Point[]>([])
  const [selecteditems,setselecteditems] = useState<number[]>([])


  useEffect(() => {
    return () => {
      api.get('points', {
        params: {
          city: RouteParams.city,
          uf: RouteParams.uf,
          items:selecteditems
        }
      }).then( res => setpoints(res.data))
    };
  }, [selecteditems])

  useEffect(() => {
    return () => {
      api.get('items')
        .then( res => {
          
          setItems(res.data)
        })
    };
  }, [])

  useEffect(() => {
    async function loadposition(){

      const { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted'){
        Alert.alert('Ooops... Precisamos da sua localização');
        return;
      }

      const location = await Location.getCurrentPositionAsync();
      const {latitude, longitude} = location.coords;
      setinitialPosition([latitude, longitude])

      loadposition();
    }


  }, [])

  function handleSelectedItem(id: number){
    const alreadySelected = selecteditems.findIndex(item => item === id)

    if (alreadySelected >= 0){
    const filteredItems = selecteditems.filter(item => item !== id);
    
    setselecteditems(filteredItems);
    }
    else {
      setselecteditems([...selecteditems, id])
    }
  }


  function handleNavigateBack(){
      navigation.goBack();
  }

  function handleNavigateToDetail(id: number){
    navigation.navigate('Detail', {point_id: id});
  }

  return (
    <>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack}>
        <Icon name="arrow-left" size={20} color-="#34cb79"></Icon>
      </TouchableOpacity>

      <Text style={styles.title}>Bem-vindo</Text>
      <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>
    
    { initialPosition[0] !== 0 && (
            <MapView 
            style={styles.map}
            loadingEnabled={initialPosition[0] === 0}
            initialRegion={
              {latitude: initialPosition[0],
              longitude: initialPosition[1], 
              latitudeDelta:0.014, 
              longitudeDelta:0.014}}>

            {points.map(
              point => (
                <Marker
                key={String(point.id)}
                onPress={() => handleNavigateToDetail(point.id)}
                style={styles.mapMarker} 
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude }
            }>
              <View style={styles.mapMarkerContainer}>   
                <Image style={styles.mapMarkerImage} source={{uri: point.image_url}}></Image>
                <Text style={styles.mapMarkerTitle}>{point.name}</Text>
              </View>
              </Marker>
              )
            )}    
            </MapView>
    )}


    </View>
    <View style={styles.itemsContainer}>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal:20}}>
    
      { items.map( item => (
          <TouchableOpacity 
            activeOpacity={0.5}
            key={String(item.id)} 
            style={
              [styles.item, 
              selecteditems.includes(item.id) ? styles.selectedItem : {}]
            } 
            onPress={ ()=>{handleSelectedItem(item.id)} }>
          <SvgUri width={42} height={42} uri=""/>
          <Text style={styles.itemTitle }>{item.title}</Text>
          </TouchableOpacity>
        )
      )}

      </ScrollView>
    </View>
    </>
  );
}


export default Points;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});