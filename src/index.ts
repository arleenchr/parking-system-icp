import { Canister, Record, Variant, Opt, query, text, update, Void, int, bool, nat64, StableBTreeMap, Vec, Result, Ok } from 'azle';
import { v4 as uuidv4 } from "uuid";

// This is a global variable that is stored on the heap
// let message = '';

// type VehicleType = "car" | "motorcycle" | "bicycle";
const vehicleType: {name: text, rate: nat64}[] = [
    {
        name: "car",
        rate: 3000n,
    },
    {
        name: "motorcycle",
        rate: 1500n,
    },
    {
        name: "bicycle",
        rate: 1000n
    }
];

const vehicle = Record({
    id: text,
    owner: text,
    vehicle_type: Record({
        name: text,
        rate: nat64,
    })
});

// interface ParkingSlot {
//     id: string;
//     block: string;
//     address: string;
//     is_available: boolean;
// }

const parkingSlot = Record({
    id: text,
    block: text,
    address: text,
    is_available: bool,
});

const parkingPayload = Record({
    id: text,
    slot: Record({
        id: text,
        address: text,
        status: bool,
    }),
    vehicle: Record({
        id: text,
        owner: text,
        vehicle_type: Record({
            name: text,
            rate: nat64,
        }),
    }),
    start: nat64,
    end: nat64,
    price: nat64,
});

const Error = Variant({
    NotFound: text,
    InvalidPayload: text,
    InsufficientFunds: text,
    ProjectNotOpen: text,
    ProjectExpired: text,
});

type VehicleType = typeof vehicleType | any;
type Vehicle = typeof vehicle | object;
// type ParkingSlot = typeof parkingSlot;
type ParkingPayload = typeof parkingPayload | object;

// const parkingArea = StableBTreeMap<text, ParkingSlot>(0);
const parkingArea = StableBTreeMap(text, parkingSlot, 0);
// let parkingPayloads = StableBTreeMap<text, ParkingPayload>(0);

export default Canister({
    initParkingArea: update([], Void, () => {
        const blocks = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]
        const addresses = ["0", "1", "2", "3", "4"]
        for (const block in blocks){
            for (const address in addresses){
                let parkingSlot = {id: uuidv4(), block: block, address: address, is_available: true};
                parkingArea.insert(parkingSlot.id, parkingSlot);
            }
        }
    }),
    getParkingArea: query ([], Result(Vec(parkingSlot), Error), () => {
        return Ok(parkingArea.values());
    }),
    getVehicleType: query([], Vec(Record({name: text, rate: nat64})), () => {
        return vehicleType;
    }),
    addParkingSlot: update([parkingSlot], Result(parkingSlot, Error), (payload) => {
        const patient = { ...payload };
        parkingArea.insert(patient.id, patient);
        return Ok(patient);
    }),

    // addParkingSlot: update([text, text, text, bool], Void, (id, block, address, is_available) => {
    //     const slot: ParkingSlot = Record({
    //         id,
    //         block,
    //         address,
    //         is_available,
    //     });
    //     parkingArea.insert(slot.id, slot);
    // }),
    // getParkingSlot: query([text], text, (id) => {
    //     const slot: ParkingSlot = parkingArea.get(id);
    //     return ("id: " + id + ", address: " + slot.address + ", status: " + slot.is_available);
    // }),
});

