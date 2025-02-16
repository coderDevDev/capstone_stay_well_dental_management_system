'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePhilippineAddress() {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isRegionLoading, setIsRegionLoading] = useState(true);
  const [isProvinceLoading, setIsProvinceLoading] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isBarangayLoading, setIsBarangayLoading] = useState(false);

  useEffect(() => {
    setIsRegionLoading(true);
    fetch('https://psgc.cloud/api/regions')
      .then(response => response.json())
      .then(data => {
        setRegions(data);
        setIsRegionLoading(false);
      })
      .catch(error => {
        console.error('Error fetching regions:', error);
        setIsRegionLoading(false);
      });
  }, []);

  const handleRegionChange = useCallback(regionCode => {
    setSelectedRegion(regionCode);
    setSelectedProvince('');
    setSelectedCity('');
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setIsProvinceLoading(true);

    fetch(`https://psgc.cloud/api/regions/${regionCode}/provinces`)
      .then(response => response.json())
      .then(data => {
        setProvinces(data);
        setIsProvinceLoading(false);
      })
      .catch(error => {
        console.error('Error fetching provinces:', error);
        setIsProvinceLoading(false);
      });
  }, []);

  const handleProvinceChange = useCallback(provinceCode => {
    setSelectedProvince(provinceCode);
    setSelectedCity('');
    setCities([]);
    setBarangays([]);
    setIsCityLoading(true);

    fetch(
      `https://psgc.cloud/api/provinces/${provinceCode}/cities-municipalities`
    )
      .then(response => response.json())
      .then(data => {
        setCities(data);
        setIsCityLoading(false);
      })
      .catch(error => {
        console.error('Error fetching cities:', error);
        setIsCityLoading(false);
      });
  }, []);

  const handleCityChange = useCallback(cityCode => {
    setSelectedCity(cityCode);
    setBarangays([]);
    setIsBarangayLoading(true);

    fetch(`https://psgc.cloud/api/cities/${cityCode}/barangays`)
      .then(response => response.json())
      .then(data => {
        setBarangays(data);
        setIsBarangayLoading(false);
      })
      .catch(error => {
        console.error('Error fetching barangays:', error);
        setIsBarangayLoading(false);
      });
  }, []);

  const initializeAddress = useCallback(
    async (regionCode, provinceCode, cityCode, barangayCode) => {
      setIsRegionLoading(true);
      setIsProvinceLoading(true);
      setIsCityLoading(true);
      setIsBarangayLoading(true);

      try {
        const [regionsData, provincesData, citiesData, barangaysData] =
          await Promise.all([
            fetch('https://psgc.cloud/api/regions').then(res => res.json()),
            fetch(
              `https://psgc.cloud/api/regions/${regionCode}/provinces`
            ).then(res => res.json()),
            fetch(
              `https://psgc.cloud/api/provinces/${provinceCode}/cities-municipalities`
            ).then(res => res.json()),
            fetch(`https://psgc.cloud/api/cities/${cityCode}/barangays`).then(
              res => res.json()
            )
          ]);

        setRegions(regionsData);
        setProvinces(provincesData);
        setCities(citiesData);
        setBarangays(barangaysData);

        setSelectedRegion(regionCode);
        setSelectedProvince(provinceCode);
        setSelectedCity(cityCode);
      } catch (error) {
        console.error('Error initializing address data:', error);
      } finally {
        setIsRegionLoading(false);
        setIsProvinceLoading(false);
        setIsCityLoading(false);
        setIsBarangayLoading(false);
      }
    },
    []
  );

  return {
    regions,
    provinces,
    cities,
    barangays,
    selectedRegion,
    selectedProvince,
    selectedCity,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    isRegionLoading,
    isProvinceLoading,
    isCityLoading,
    isBarangayLoading,
    initializeAddress
  };
}
