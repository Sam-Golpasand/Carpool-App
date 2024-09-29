# Project Title

This page is designed for a carpooling web app where users can calculate and share the costs of driving based on real-world data.

## Description

This project is a web application that interacts with the Synsbasen API to fetch vehicle information based on the license plate number. It also includes a fallback function for testing purposes.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Sam-Golpasand/Carpool-App
    ```
2. Navigate to the project directory:
    ```sh
    cd Carpool-App
    ```
3. Install the dependencies:
    ```sh
    npm i
    ```

## Usage

1. Start the development server:
    ```sh
    npm run dev
    ```
2. Open your browser and navigate to `http://localhost:3000`.

## API Information

This project uses the Synsbasen and Google cloud API to fetch vehicle and route data. You need to provide the API key to access the API.
NOTICE: A fake synsbasen response has been implemented because the API suddenly doesn't work. This isn't our fault and it isn't in the scope of the school project to fix it. Hope it's okay. Sincerely Sam 👍

## Development

To run the project in development mode, use the following command:
```sh
npm run dev