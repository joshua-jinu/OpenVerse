import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { API_KEY } from "../constants/keys";
import Toast from "react-native-toast-message";
interface TempContextType {
  TempMode: boolean;
}

const TempratureContext = React.createContext<TempContextType | null>(null);

export const useTemp = () => useContext(TempratureContext);

const TempratureContextProvider: React.FC<React.ReactNode> = ({ children }) => {
  {
    /* C | F*/
  }
  const [tempMode, setTempMode]: any = useState(false);
  const [weatherData, setWeatherData]: any = useState(null);
  const [StateWeatherData, setStateWeatherData]: any = useState(null);
  const [FetchError, setFetchError]: any = useState(false);
  const [LocName, setLocName]: any = useState(null);

  {
    /*Accessing Location From Expo and*/
  }
  {
    /*Weather Api Call */
  }
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("permission is required");
        return;
      } else {
        let location = await Location.getCurrentPositionAsync({});
        let Data: any = "Waiting..";
        let Longitude_Latitude: any = null;

        Data = JSON.stringify(location.coords);
        Longitude_Latitude = JSON.parse(Data);

        // extract city name from mobiles location
        const { latitude, longitude } = location.coords;
        let locName = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        console.log("Device Location: "+locName[0].city + ", " + locName[0].country);
        setLocName([locName[0].city, locName[0].country]);

        //APi Call After Getting Location
        const URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${Longitude_Latitude["latitude"]}&lon=${Longitude_Latitude["longitude"]}&units=metric&appid=${API_KEY}`;
        try {
          const res = await fetch(URL);
          const data = await res.json();
          setWeatherData(data);
        } catch (e) {
          setFetchError(true);
        }
      }
    })();
  }, []);

  const getStateWeatherData = async (cityVal: any) => {
    try {
      const URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&units=metric&appid=${API_KEY}`;
      const res = await fetch(URL);

      // Check if the response status indicates success
      if (res.ok) {
        const data = await res.json();
        setStateWeatherData(data);
      } else {
        // If the response status is not okay, handle the error
        throw new Error(`Weather data not found for ${cityVal}`);
      }
    } catch (e) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "City Not Found 🙁",
        text2: `Weather data for ${cityVal} not found.`,
        visibilityTime: 4000,
      });
    }
  };

  const value: any = {
    tempMode,
    weatherData,
    getStateWeatherData,
    StateWeatherData,
    FetchError,
    LocName,
  };
  return (
    <TempratureContext.Provider value={value}>
      {children}
    </TempratureContext.Provider>
  );
};

export default TempratureContextProvider;
