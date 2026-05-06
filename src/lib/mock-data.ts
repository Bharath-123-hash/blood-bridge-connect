export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  lastDonation: string; // ISO
  available: boolean;
  area: string;
  donations: number;
  phone: string;
}

export interface EmergencyRequest {
  id: string;
  hospital: string;
  bloodGroup: BloodGroup;
  units: number;
  patient: string;
  urgency: "Critical" | "High" | "Moderate";
  postedMinutesAgo: number;
  distanceKm: number;
  contact: string;
  area: string;
}

const today = new Date();
const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000).toISOString();

export const donors: Donor[] = [
  { id: "d1", name: "Aarav Patil",   bloodGroup: "O+",  distanceKm: 1.2, lastDonation: daysAgo(120), available: true,  area: "Shahupuri",    donations: 6, phone: "+91 98••• ••421" },
  { id: "d2", name: "Sneha Kulkarni",bloodGroup: "B+",  distanceKm: 2.4, lastDonation: daysAgo(45),  available: false, area: "Rajarampuri",  donations: 3, phone: "+91 98••• ••112" },
  { id: "d3", name: "Rohan Desai",   bloodGroup: "A+",  distanceKm: 3.8, lastDonation: daysAgo(200), available: true,  area: "Kasba Bawada", donations: 9, phone: "+91 98••• ••778" },
  { id: "d4", name: "Priya Joshi",   bloodGroup: "O-",  distanceKm: 4.5, lastDonation: daysAgo(95),  available: true,  area: "Tarabai Park", donations: 4, phone: "+91 98••• ••339" },
  { id: "d5", name: "Vikram Shinde", bloodGroup: "AB+", distanceKm: 6.1, lastDonation: daysAgo(60),  available: false, area: "Nagala Park",  donations: 2, phone: "+91 98••• ••561" },
  { id: "d6", name: "Anaya Mane",    bloodGroup: "O+",  distanceKm: 7.3, lastDonation: daysAgo(180), available: true,  area: "Sangli Road",  donations: 5, phone: "+91 98••• ••904" },
  { id: "d7", name: "Karan Bhosale", bloodGroup: "B-",  distanceKm: 8.9, lastDonation: daysAgo(30),  available: false, area: "Ichalkaranji", donations: 7, phone: "+91 98••• ••243" },
  { id: "d8", name: "Meera Gaikwad", bloodGroup: "A-",  distanceKm: 9.6, lastDonation: daysAgo(150), available: true,  area: "Hatkanangle",  donations: 8, phone: "+91 98••• ••687" },
  { id: "d9", name: "Sahil Pawar",   bloodGroup: "O+",  distanceKm: 12.1,lastDonation: daysAgo(240), available: true,  area: "Jaysingpur",   donations: 11,phone: "+91 98••• ••150" },
];

export const emergencyRequests: EmergencyRequest[] = [
  { id: "r1", hospital: "CPR Hospital",       bloodGroup: "O-",  units: 2, patient: "Trauma — RTA",        urgency: "Critical", postedMinutesAgo: 4,  distanceKm: 2.1, contact: "Dr. Kamble",  area: "Shivaji Peth" },
  { id: "r2", hospital: "Aster Aadhar",       bloodGroup: "B+",  units: 1, patient: "Surgery — Delivery",  urgency: "High",     postedMinutesAgo: 18, distanceKm: 4.6, contact: "Dr. Sawant",  area: "Tarabai Park" },
  { id: "r3", hospital: "Apple Saraswati",    bloodGroup: "A+",  units: 3, patient: "Thalassemia child",   urgency: "Moderate", postedMinutesAgo: 42, distanceKm: 6.8, contact: "Dr. Desai",   area: "Rajarampuri" },
];

export const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const COOLDOWN_DAYS = 90;
export const PROXIMITY_KM = 10;

export function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
export function isEligible(d: Donor) {
  return d.available && daysSince(d.lastDonation) >= COOLDOWN_DAYS;
}
