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
    const [loading, setLoading] = useState<boolean>(false);

    const fuelPrice = 13.19; 

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

    function addAddressField() {
      setAddresses([...addresses, '']);
      setInitials([...initials, '']);
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

    async function calculateCosts() {
      if (addresses.length < 2) {
        console.error("At least 2 addresses are needed.");
        return;
      }
    
      setLoading(true);
    
      const distances = [];
      let totalCostPerPerson = [];
      let totalDistanceDriven = 0;
    
      for (let i = 0; i < addresses.length - 1; i++) { // Iterate excluding the final destination
        // Calculate the distance from the previous address to the current pickup point
        const distanceToPickup = i === 0 ? 0 : await getDistance(addresses[i - 1], [addresses[i]]);
    
        // Calculate the distance from the current pickup point to the final destination
        const distanceToDestination = await getDistance(addresses[i], [addresses[addresses.length - 1]]);
    
        const totalDistanceForPerson = (distanceToPickup + distanceToDestination) / 1000; // Convert to km
    
        totalDistanceDriven += totalDistanceForPerson;
    
        // Assign initials for the first address and all others except the final destination
        distances.push({
          initials: initials[i], // Now includes initials for the first address
          distanceToPickup: distanceToPickup / 1000, // in km
          distanceToDestination: distanceToDestination / 1000, // in km
          totalDistanceForPerson
        });
    
        // Calculate the cost for each person based on km/L
        const litersUsed = totalDistanceForPerson / (kmL || 1); // Prevent division by 0
        const costForPerson = litersUsed * fuelPrice;
    
        console.log(`Cost for ${initials[i]}: ${costForPerson.toFixed(2)}`);
        totalCostPerPerson.push({
          initials: i == addresses.length ? "Full Ride" : initials[i], 
          cost: costForPerson.toFixed(2) // round to 2 decimal places
        });
      }
    
      setDistancesPerPerson(distances);
      setTotalCostPerPerson(totalCostPerPerson);
      setLoading(false);
    }
    
  

    function getKmL() {
      axios.get(`https://api.synsbasen.dk/v1/vehicles/registration/${licensePlate}?expand[]=engine`, {
        headers: {
          'Authorization': apiKey
        }
      })
        .then((response) => {
          console.log(response.data.data.engine.fuel_efficiency);
          if (response.data.data.engine) {
            setKmL(response.data.data.engine.fuel_efficiency);
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
                {kmL ? <span>{kmL} km/L</span> : null}
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
                    {(index > 0 && index < addresses.length - 1) && (
                      <Input
                        value={initials[index - 1]}
                        onChange={(e) => handleInitialsChange(index - 1, e)}
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
              onClick={showOwnAddress ? calculateCosts : getKmL}
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
                      <tr key={index} className="border-b border-gray-600">
                        <td className="px-4 py-2">{entry.initials}</td>
                        <td className="px-4 py-2">{entry.totalDistanceForPerson}</td>
                        <td className="px-4 py-2">{totalCostPerPerson[index].cost}</td>
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
