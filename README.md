# Parking System

## Overview
This project implements a simple parking system on the Azle platform that allows users to initiate parking area, rent a parking slot and exitting a parking slot. This project implements a messaging smart contract (canister) of ICP platform in TypeScript.

## Prerequisites
- Node
- Typescript
- DFX

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/arleenchr/parking-system-icp.git
    cd parking_system
    nvm install 18
    nvm use 18
    npm install
    ```
2. **INSTALL DFX**
    ```bash
    DFX_VERSION=0.14.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
    ```
3. **Add DFX to your path**
    ```bash
    echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
    ```

## Usage

Here are the main functionalities provided by this system:

### Managing Products

- `initParkingArea`
  - Creates a new parking area, containing parking slots that varies from block [A1, A2, A3, B1, B2, B3, C1, C2, C3] and each block has addresses from 0 to 4.
- `rentParkingSlot`
  - Allows user to rent a parking slot.
- `exitParkingSlot`
  - Allows user to exit the parking slot they rented.

## Testing Instructions 

- Make sure you have the required environment for running ICP canisters and the dfx is running in background `dfx start --background --clean`
- Deploy the canisters `dfx deploy`
- Open the URL for Backend canister via Candid interface

To conclude your work session, you can stop your local Azle replica by executing the following command in your terminal:
  ```bash
   dfx stop
  ```