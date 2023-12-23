import { Canister, Record, Variant, Opt, query, text, update, Void, int, bool, nat64, StableBTreeMap, Vec, Result, Ok, Err, Some, ic, None } from 'azle';
import { v4 as uuidv4 } from "uuid";

enum vehicleType {
    Car = "Car",
    Motorcycle = "Motorcycle",
    Bicycle = "Bicycle",
}

const Vehicle = Record({
    id: text,
    number: text,
    vehicle_type: text
});

const ParkingSlot = Record({
    id: text,
    block: text,
    address: text,
    is_available: bool,
});

const ParkingPayload = Record({
    id: text,
    slot: ParkingSlot,
    vehicle: Vehicle,
    start: nat64,
    price: Opt(nat64),
});

const Error = Variant({
    NotFound: text,
    InvalidPayload: text,
    InvalidSlot: text,
    PayloadExpired: text,
});

type Error = typeof Error.tsType;

type Vehicle = typeof Vehicle.tsType;
type ParkingSlot = typeof ParkingSlot.tsType;
type ParkingPayload = typeof ParkingPayload.tsType;

const vehicles = StableBTreeMap<text, Vehicle>(0);
const parkingArea = StableBTreeMap<text, ParkingSlot>(1);
const parkingPayloads = StableBTreeMap<text, ParkingPayload>(2);

function getParkingSlot(block: text, address: text): ParkingSlot {
    const parkSlot = parkingArea.values().filter(slot =>
        slot.block == block && slot.address == address);
    return parkSlot[0];
}

function createVehicle(vehicleNumber: text, vehicleType: text): Vehicle {
    const vehicle = {
        id: uuidv4(),
        number: vehicleNumber,
        vehicle_type: vehicleType,
    }
    return vehicle;
}

function getVehicle(vehicleNumber: text): Vehicle {
    const vehicle = vehicles.values().filter(v => v.number == vehicleNumber);
    return vehicle[0];
}

function getParkingPayload(slot_block: text, slot_addr: text, vehicle_number: text): ParkingPayload {
    const payload = parkingPayloads.values().filter(p =>
        p.slot.block == slot_block && p.slot.address == slot_addr && p.vehicle.number == vehicle_number);
    return payload[0];
}

function setSlotAvailability(slot_block: text, slot_addr: text, availability: bool): Void {
    const slot = getParkingSlot(slot_block, slot_addr);
    const slotOpt = parkingArea.get(slot.id);
    const parkSlot = slotOpt.Some;
    if (parkSlot){
        parkSlot.is_available = availability;
    }
}

export default Canister({
    initParkingArea: update([], Void, () => {
        const blocks = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]
        const addresses = ["0", "1", "2", "3", "4"]
        for (const block of blocks){
            for (const address of addresses){
                const slot = {id: uuidv4(), block: block, address: address, is_available: true};
                parkingArea.insert(slot.id, slot);
            }
        }
    }),

    rentParkingSlot: update([text, text, text, text], Result(ParkingPayload, Error), (slot_block, slot_addr, vehicle_number, vehicle_type) => {
        const slotArea = getParkingSlot(slot_block, slot_addr);
        if (!slotArea){
            return Err({ InvalidSlot: `Parking block or addr slot is invalid.`})
        }
        const vehicle = createVehicle(vehicle_number, vehicle_type);
        vehicles.insert(vehicle.id, vehicle);
        if (slotArea.is_available == false){
            return Err({ InvalidPayload: `Parking payload slot is not available.`})
        }
        const parkPayload = {
            id: uuidv4(),
            slot: slotArea,
            vehicle: vehicle,
            start: ic.time(),
            end: None,
            price: None,
        };
        parkingPayloads.insert(parkPayload.id, parkPayload);
        setSlotAvailability(slot_block, slot_addr, false);
        return Ok(parkPayload);
    }),

    exitParkingSlot: update([text, text, text], Result(ParkingPayload, Error), (slot_block, slot_addr, vehicle_number) => {
        const slotArea = getParkingSlot(slot_block, slot_addr);
        if (!slotArea){
            return Err({ InvalidSlot: `Parking block or addr slot is invalid.`})
        }
        const vehicle = getVehicle(vehicle_number);
        if (slotArea.is_available == false){
            return Err({ InvalidPayload: `Parking payload slot is not available.`})
        }
        const payload = getParkingPayload(slot_block, slot_addr, vehicle_number);
        const end = ic.time();
        const rate = vehicle.vehicle_type=="Car" ? 3000 : (vehicle.vehicle_type=="Motorcycle" ? 1500 : 1000);
        const price = BigInt(Math.ceil((Number(end) - Number(payload.start)) / 1e9 / 60 / 60) * Number(rate));
        payload.price = Some(price);
        setSlotAvailability(slot_block, slot_addr, true);
        return Ok(payload);
    }),
});

