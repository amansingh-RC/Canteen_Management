import { createRng } from "@/lib/random";
import { USER_CATEGORIES } from "@/config/meals";

export const USER_COUNT = 1420;

const FIRST_NAMES = [
  "Rahul", "Sneha", "Imran", "Priya", "Vikram", "Anjali", "Karan", "Meera",
  "Sahil", "Divya", "Arjun", "Neha", "Rohit", "Kavya", "Aditya", "Pooja",
  "Manish", "Ritika", "Sameer", "Tanvi", "Nikhil", "Isha", "Varun", "Aarti",
  "Deepak", "Sonal", "Yash", "Komal", "Harsh", "Swati",
];

const LAST_NAMES = [
  "Mehta", "Kapoor", "Sheikh", "Das", "Rao", "Nair", "Joshi", "Iyer",
  "Verma", "Menon", "Pillai", "Bhat", "Sinha", "Reddy", "Kulkarni", "Shah",
  "Gupta", "Jain", "Khan", "Patel", "Bose", "Chopra", "Saxena", "Naidu",
];

const rng = createRng(20260612);

/** Random "last verified at" time for a verified user. */
function verificationTime() {
  const am = rng.chance(0.5);
  const h = am ? rng.int(7, 9) : rng.int(12, 14);
  const m = rng.int(0, 59);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export const users = Array.from({ length: USER_COUNT }, (_, i) => {
  const name = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
  const faceVerification = rng.chance(0.765) ? "verified" : "pending";
  const isActive = rng.chance(0.93);

  return {
    id: `EMP${1000 + i}`,
    name,
    // department: rng.pick(DEPARTMENTS),
    category: rng.pick(USER_CATEGORIES),
    faceVerification,
    faceVerificationLabel: faceVerification === "verified" ? "Verified" : "Pending",
    monthlyAttendance: rng.int(62, 99),
    lastVerification: faceVerification === "verified" ? verificationTime() : "—",
    status: isActive ? "active" : "disabled",
    statusLabel: isActive ? "Active" : "Disabled",
  };
});

export const usersById = new Map(users.map((u) => [u.id, u]));
