"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import axios from 'axios';
import { Button } from "@/components/ui/button";

export default function Page() {
  const [licensePlate, setLicensePlate] = useState<string>('')
  const [kmL, setKmL] = useState<number | null>(null)
  const [showOwnAddress, setShowOwnAddress] = useState<boolean>(false)
  const [addresses, setAddresses] = useState<string[]>([''])
  const [totalDetourDistance, setTotalDetourDistance] = useState<number | null>(null);
  const [distanceDifference, setDistanceDifference] = useState<number | null>(null);
  const [liter, setLiter] = useState<number | null>(null);

  function handleLicensePlateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLicensePlate(e.target.value)
  }

  function handleAddressChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const newAddresses = [...addresses];
    newAddresses[index] = e.target.value;
    setAddresses(newAddresses);
  }

  function addAddressField() {
    setAddresses([...addresses, '']);
  }

  const apiKey: string = process.env.NEXT_PUBLIC_SynBaseAPIKey || "";
  const googleApiKey: string = process.env.NEXT_PUBLIC_GoogleAPIKey || "";

  async function getDistance(origin: string, destinations: string[]): Promise<number> {
    const destinationString = destinations.join('|');
  
    try {
      const response = await axios.get(`/api/distance`, {
        params: {
          origin,
          destinations: destinationString,
          apiKey: googleApiKey,
        }
      });
  
      const totalDistance = response.data.rows[0].elements.reduce(
        (acc: number, element: any) => acc + element.distance.value,
        0
      );
      return totalDistance;
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      return 0;
    }
  }
  
  function calculateLiter(distanceDifference: number | null, kmL: number | null) {
    if (distanceDifference !== null && kmL !== null) {
      setLiter(distanceDifference / kmL)
      console.log(liter)
    }
  }

  async function calculateDetourDistance() {
    if (addresses.length < 2 && showOwnAddress) {
      console.error("At least 2 addresses are needed.");
      return;
    }


    const firstAddress = addresses[0];
    const lastAddress = addresses[addresses.length - 1];

    // Calculate the direct distance from the first to the last address
    const originToDestinationDistance = await getDistance(firstAddress, [lastAddress]);

    // Calculate the total distance to all destinations (including detours)
    const originToDestinationWithDetoursDistance = await getDistance(firstAddress, addresses);

    // Calculate the difference
    const distanceDiff = originToDestinationWithDetoursDistance - originToDestinationDistance;

    setTotalDetourDistance(originToDestinationWithDetoursDistance / 1000); // converting meters to km
    setDistanceDifference(distanceDiff / 1000); // converting meters to km
    calculateLiter(distanceDifference, kmL);
  }

  function getKmL() {
    axios.get(`https://api.synsbasen.dk/v1/vehicles/registration/${licensePlate}?expand[]=engine`, {
      headers: {
        'Authorization': apiKey
      }
    })
      .then((response) => {
        console.log(response.data.data.engine.fuel_efficiency)
        if (response.data.data.engine) {
          setKmL(response.data.data.engine.fuel_efficiency)
          setShowOwnAddress(true)
        } else {
          console.error('No data found')
        }
      })
      .catch(error => console.error(error));
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-md w-full px-4 md:px-0">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Carpool</h1>
          <p className="text-muted-foreground md:text-lg">
            Get your friends to drive you around guilt free and fair.
          </p>
        </div>
        <form className="mt-8 space-y-4">
          <div className="relative">
            <Input
              value={licensePlate}
              onChange={handleLicensePlateChange}
              type="text"
              id="license-plate"
              placeholder="Enter your license plate"
              className="pr-20 bg-[#1f1f1f] border-[#4b2a7a] focus:border-[#7a4ab2] focus:ring-[#7a4ab2]"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              {kmL ? <span>{kmL} km/L</span> : null}
            </div>
          </div>
          {showOwnAddress && (
            <div className='relative'>
              <p className='text-center m-4 mt-8'>Now input addresses</p>
              {addresses.map((address, index) => (
                <div key={index} className="relative mb-4">
                  <Input
                    value={address}
                    onChange={(e) => handleAddressChange(index, e)}
                    type="text"
                    placeholder={`Enter address ${index + 1}`}
                    className="pr-20 bg-[#1f1f1f] border-[#4b2a7a] focus:border-[#7a4ab2] focus:ring-[#7a4ab2]"
                  />
                </div>
              ))}
              <Button
                type="button"
                className="w-full bg-[#4b2a7a] text-primary-foreground hover:bg-[#7a4ab2] focus-visible:outline-none"
                onClick={addAddressField}
              >
                Add More Addresses
              </Button>
            </div>
          )}

          <Button
            type="button"
            className="w-full bg-[#7a4ab2] text-primary-foreground hover:bg-[#5c3784] focus-visible:outline-none"
            onClick={showOwnAddress ? calculateDetourDistance : getKmL}
          >
            Calculate Detour Distance
          </Button>
          <div className='text-center'>
          {totalDetourDistance !== null && (
            <div className="mt-4">
              <p>Total Distance (with detours): {totalDetourDistance} km</p>
            </div>
          )}
          {distanceDifference !== null && (
            <div className="mt-4">
              <p>Distance Difference: {distanceDifference} km</p>
              <p>Price: {liter ? (liter * 13.19).toFixed(2) : null} kr</p>
            </div>
          )}
          </div>
        </form>
      </div>
    </div>
  )
}
