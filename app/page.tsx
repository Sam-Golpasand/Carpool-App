"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import axios from 'axios';
import { Button } from "@/components/ui/button";

export default function Page() {
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [kmL, setKmL] = useState<number | null>(null);
  const [showOwnAddress, setShowOwnAddress] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [initials, setInitials] = useState<string[]>(['']);
  const [distancesPerPerson, setDistancesPerPerson] = useState<any[]>([]);
  const [totalCostPerPerson, setTotalCostPerPerson] = useState<any[]>([]);
  const [fuelType, setFuelType] = useState<string>('Benzin');
  const [loading, setLoading] = useState<boolean>(false);

  const fuelPriceBenzin = 13.19;
  const fuelPriceDiesel = 12.19;

  function handleLicensePlateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLicensePlate(e.target.value);
  }

  function handleAddressChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const newAddresses = [...addresses];
    newAddresses[index] = e.target.value;
    setAddresses(newAddresses);
  }

  function handleInitialsChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const newInitials = [...initials];
    newInitials[index] = e.target.value;
    setInitials(newInitials);
  }

  // Add a new address field
  function addAddressField() {
    setAddresses([...addresses, '']);
    setInitials([...initials, '']);
  }

  const apiKey: string = process.env.NEXT_PUBLIC_SynBaseAPIKey || "";
  const googleApiKey: string = process.env.NEXT_PUBLIC_GoogleAPIKey || "";

  async function getDistance(origin: string, destinations: string[]): Promise<number> {
    const destinationString = destinations.join('|');
    try {
      // Fetch the distance matrix from Google Maps API
      const response = await axios.get(`/api/distance`, {
        params: {
          origin,
          destinations: destinationString,
          apiKey: googleApiKey,
        }
      });
      // Sum up the total distance from the origin to all destinations
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

  async function calculateCosts() {
    // Tjekker om der er mindst 2 adresser (en til afhentning og en til destinationen)
    if (addresses.length < 2) return;
  
    setLoading(true);  // Indikerer at beregningen er i gang
  
    const distances = [];
    let totalCostPerPerson = [];
    let totalDistanceDriven = 0;
  
    // Loop gennem alle adresser (undtagen destinationen) for at beregne afstande
    for (let i = 0; i < addresses.length - 1; i++) {
      const distance = await getDistance(addresses[i], [addresses[addresses.length - 1]]);
      const totalDistanceForPerson = distance / 1000;  // Konverterer afstand til kilometer
      totalDistanceDriven += totalDistanceForPerson;   // Holder styr på den samlede kørte distance
  
      // Gemmer initialer og distance for hver person
      distances.push({
        initials: initials[i],
        totalDistanceForPerson 
      });
  
      // Beregner omkostninger for hver person baseret på bilens km/L og brændstofpris
      const litersUsed = totalDistanceForPerson / (kmL || 1);
      const costForPerson = litersUsed * (fuelType === "Benzin" ? fuelPriceBenzin : fuelPriceDiesel);
  
      totalCostPerPerson.push({
        initials: initials[i],
        cost: costForPerson.toFixed(2)  // Runder beløbet af til 2 decimaler
      });
    }
  
    // Opdaterer state med beregnede distance og omkostninger
    setDistancesPerPerson(distances);
    setTotalCostPerPerson(totalCostPerPerson);
    setLoading(false);  // Stopper loading-indikatoren
  }
  

  function fakeKmL() { // Fake data for testing since the api doesn't work anymore :(
    setKmL(17.5);
    setFuelType("Benzin");
    setShowOwnAddress(true);
  }

  function getKmL() {
    axios.get(`https://api.synsbasen.dk/v1/vehicles/registration/${licensePlate}?expand[]=engine`, {
      headers: {
        'Authorization': "Bearer " + apiKey
      }
    })
      .then((response) => {
        console.log(response.data);

        if (response.data.data.engine) {
          setKmL(response.data.data.engine.fuel_efficiency);
          setFuelType(response.data.data.engine.fuel_type);
          setShowOwnAddress(true);
        } else {
          console.error('No data found');
        }
      })
      .catch(error => console.error(error));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-md w-full px-4 md:px-0">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Out of Pocket</h1>
          <p className="text-muted-foreground md:text-lg">
            Get your friends to drive you around guilt-free and fair.
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
              {kmL ? (
                <span className="flex items-center space-x-2">
                  <span>{kmL} km/L</span>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFF">
                    <path d="M160-120v-640q0-33 23.5-56.5T240-840h240q33 0 56.5 23.5T560-760v280h40q33 0 56.5 23.5T680-400v180q0 17 11.5 28.5T720-180q17 0 28.5-11.5T760-220v-288q-9 5-19 6.5t-21 1.5q-42 0-71-29t-29-71q0-32 17.5-57.5T684-694l-84-84 42-42 148 144q15 15 22.5 35t7.5 41v380q0 42-29 71t-71 29q-42 0-71-29t-29-71v-200h-60v300H160Zm80-440h240v-200H240v200Zm480 0q17 0 28.5-11.5T760-600q0-17-11.5-28.5T720-640q-17 0-28.5 11.5T680-600q0 17 11.5 28.5T720-560ZM240-200h240v-280H240v280Zm240 0H240h240Z"/>
                  </svg>
                  <span>{fuelType}</span>
                </span>
              ) : null}
            </div>
          </div>
          {showOwnAddress && (
            <div className='relative'>
              <p className='text-center m-4 mt-8'>Now input addresses and initials</p>
              {addresses.map((address, index) => (
                <div key={index} className="relative mb-4 flex space-x-2">
                  <Input
                    value={address}
                    onChange={(e) => handleAddressChange(index, e)}
                    type="text"
                    placeholder={`Enter address ${index + 1}`}
                    className="pr-20 bg-[#1f1f1f] border-[#4b2a7a] focus:border-[#7a4ab2] focus:ring-[#7a4ab2]"
                  />
                  {index !== addresses.length - 1 && ( // Make sure initials show for first address but not for the last one
                    <Input
                      value={initials[index]}
                      onChange={(e) => handleInitialsChange(index, e)}
                      type="text"
                      placeholder="Initials"
                      className="w-16 pr-2 bg-[#1f1f1f] border-[#4b2a7a] focus:border-[#7a4ab2] focus:ring-[#7a4ab2]"
                    />
                  )}
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
            onClick={showOwnAddress ? calculateCosts : fakeKmL}
          >
            {loading ? 'Calculating...' : 'Calculate Costs'}
          </Button>

          {distancesPerPerson.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">Cost Breakdown</h2>
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-4 py-2 text-left">Initials</th>
                    <th className="px-4 py-2 text-left">Total Distance (km)</th>
                    <th className="px-4 py-2 text-left">Cost (kr)</th>
                  </tr>
                </thead>
                <tbody>
                  {distancesPerPerson.map((entry, index) => (
                    console.log(entry),
                    <tr key={index} className="border-b border-gray-600">
                      <td className="px-4 py-2">{entry.initials}</td>
                      <td className="px-4 py-2">{entry.totalDistanceForPerson.toFixed(3)}</td>
                      <td className="px-4 py-2">{totalCostPerPerson[index]?.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
