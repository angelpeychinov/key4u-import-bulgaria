// Delivered cars shown on /delivered. Add new cars at the TOP of the list.
// Photos: put images in src/assets/delivered/ and import them below.
// The first photo is the cover image.
import s1 from "@/assets/delivered/sample-1.jpg";
import s2 from "@/assets/delivered/sample-2.jpg";
import s3 from "@/assets/delivered/sample-3.jpg";

export interface DeliveredCar {
  id: string;
  title: string; // e.g. "BMW X5 xDrive40i"
  year: number;
  origin: "Канада" | "САЩ" | "Южна Корея";
  priceEur: number; // final price in Bulgaria
  mileageKm?: number;
  fuel?: string;
  deliveredOn?: string; // e.g. "Септември 2026"
  photos: string[];
}

// SAMPLE DATA — replace with real delivered cars.
export const deliveredCars: DeliveredCar[] = [
  { id: "bmw-x5-2021", title: "BMW X5 xDrive40i M Sport", year: 2021, origin: "Канада", priceEur: 48900, mileageKm: 42000, fuel: "Бензин", deliveredOn: "Септември 2026", photos: [s1, s3, s2] },
  { id: "mercedes-gle-2022", title: "Mercedes-Benz GLE 450 4MATIC", year: 2022, origin: "САЩ", priceEur: 56500, mileageKm: 31000, fuel: "Хибрид", deliveredOn: "Август 2026", photos: [s2, s3, s1] },
  { id: "audi-q7-2020", title: "Audi Q7 55 TFSI quattro", year: 2020, origin: "Южна Корея", priceEur: 39800, mileageKm: 58000, fuel: "Бензин", deliveredOn: "Юли 2026", photos: [s3, s1, s2] },
];
