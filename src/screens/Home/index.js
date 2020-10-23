import React, { useState, useEffect } from 'react';
import { Platform, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { request, PERMISSIONS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import Api from '../../services/Api';
import BarberItem from '../../components/BarberItem';
import { 
    Container,
    Scroller,

    HeaderArea,
    HeaderTitle,
    SearchButton,

    
    LocationArea,
    LocationInput,
    LocationFinder,

    LoadingIcon,
    ListArea
} from './styles';

import SearchIcon from '../../assets/search.svg';
import MyLocationIcon from '../../assets/my_location.svg';

export default () => {

    const navigation = useNavigation();
    const handleToPageSearch = () => {
        navigation.navigate('Search')
    }

    const [ locationText, setLocationText ] = useState('');
    const [ coords, setCoords ] = useState(null);
    const [ loading, setLoading ] = useState(false);
    const [ list, setList ] = useState([]);
    const [ refreshing, setRefreshing ] = useState(false);

    const handleLocationFinder = async () => {
        setCoords(null);

        let result = await request(
            
            Platform.OS === 'ios' ?
                PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                :
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        );

        if(result == 'granted'){
            setLoading(true);
            setLocationText('');
            setList([]);
            //console.log(result);
            Geolocation.getCurrentPosition(       
                coords => {
                    setCoords(coords);
                    //console.log(coords.coords.latitude);
                    getBarbers();
                },
                error => {
                    console.log(error.code, error.message);
                },{
                    enableHighAccuracy: true, 
                    timeout: 200000, 
                    maximumAge: 1000                    
                }
                
                
            );
        }
    }

    const getBarbers = async () => {
        setLoading(true);
        setList([]);

        let lat = null;
        let lng = null;

        if(coords){
            lat = coords.coords.latitude;
            lng = coords.coords.longitude;
        }

        let res = await Api.getBarbers(lat, lng, locationText);
        //console.log(res);
        if(res.error == ''){
            if(res.loc){
                setLocationText(res.loc);
            }
            setList(res.data)
        }else{
            alert('error: '+ res.error);
        }

        setLoading(false);
    }

    useEffect(() => {
        getBarbers();
    }, []);

    const onRefresh = () => {
        setRefreshing(false);
        getBarbers();
    }

    const hanleLocationSearch = () => {
        setCoords({});
        getBarbers();
    }

    return(
        <Container>
            <Scroller refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>

                <HeaderArea>
                    <HeaderTitle numberOfLines={2}>Encontre o seu barbeiro favorito</HeaderTitle>
                    <SearchButton onPress={handleToPageSearch}>
                        <SearchIcon width="26" height="26" fill="#fff" />
                    </SearchButton>
                </HeaderArea>

                <LocationArea>
                    <LocationInput 
                        placeholder="Onde você está?"
                        placeholderTextColor="#fff"
                        value={locationText}
                        onChangeText={t => setLocationText(t)}
                        onEndEditing={hanleLocationSearch}
                    />
                    <LocationFinder onPress={handleLocationFinder}>
                        <MyLocationIcon width="24" height="24" fill="#fff" />
                    </LocationFinder>
                </LocationArea>

                {loading && 
                    <LoadingIcon size="large" color="#fff" />
                }

                <ListArea>
                    {list.map((item, k) => (
                        <BarberItem key={k} data={item} />
                    ))}
                </ListArea>


            </Scroller>
        </Container>
    );
}