// Import fixed generateDate function
import { generateDate } from "./src/utils/generate-date.js";

console.log("=== TESTING FIXED TIMEZONE ===");
console.log("Current UTC time:", new Date().toISOString());
console.log("Local time:", new Date().toString());
console.log(
  "WIB time:",
  new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
);
console.log("Fixed generateDate() result:", generateDate().toString());
console.log("Fixed generateDate() ISO:", generateDate().toISOString());

const today = generateDate();
console.log("\n=== FIXED DATE RANGE CALCULATION ===");

const todayStart = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  0,
  0,
  0
);

const todayEnd = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1,
  0,
  0,
  0
);

console.log("todayStart:", todayStart.toString());
console.log("todayStart ISO:", todayStart.toISOString());
console.log("todayEnd:", todayEnd.toString());
console.log("todayEnd ISO:", todayEnd.toISOString());

// Test dengan data sample yang benar (tanggal hari ini)
const now = new Date();
const testCreatedAt = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  19,
  3,
  35,
  120 // Jam 19:03 hari ini
);

console.log("\n=== SAMPLE DATA TEST (TODAY) ===");
console.log("Test created_at:", testCreatedAt.toString());
console.log("Test created_at ISO:", testCreatedAt.toISOString());
console.log(
  "Is test data between todayStart and todayEnd?",
  testCreatedAt >= todayStart && testCreatedAt < todayEnd
);

// Simulasi kondisi jam 17:00 WIB (masalah yang Anda alami)
const fivePM = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  17,
  0,
  0 // Jam 17:00 hari ini
);

console.log("\n=== 5 PM TEST ===");
console.log("5 PM today:", fivePM.toString());
console.log("5 PM today ISO:", fivePM.toISOString());
console.log(
  "Is 5 PM between todayStart and todayEnd?",
  fivePM >= todayStart && fivePM < todayEnd
);
