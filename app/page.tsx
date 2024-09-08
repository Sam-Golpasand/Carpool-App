"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import axios, { AxiosResponse } from 'axios';
import { Button } from "@/components/ui/button";



export default function page() {

  const [licensePlate, setLicensePlate] = useState<string>('')
  const [kmL, setKmL] = useState<number | null>(null)


  const handleLicensePlateChange = (e: any) => {
    setLicensePlate(e.target.value)
  }
  const apiKey = process.env.NEXT_PUBLIC_SynBaseAPIKey;

  const handleSubmit = (e: any) => {
    e.preventDefault()


    axios.get(`https://api.synsbasen.dk/v1/vehicles/registration/${licensePlate}?expand[]=engine`, {
      headers: {
        'Authorization': apiKey
    }
    })
    .then((response) => {
      console.log(response.data.data.engine.fuel_efficiency)
      if (response.data.data.engine)  {
        setKmL(response.data.data.engine.fuel_efficiency)
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
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
          <Button
            type="submit"
            className="w-full bg-[#7a4ab2] text-primary-foreground hover:bg-[#5c3784] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7a4ab2] disabled:pointer-events-none disabled:opacity-50"
          >
            Calculate
          </Button>
        </form>
      </div>
    </div>
  )
}
