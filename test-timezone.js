const generateDate = () => {
  const date = new Date();
  const gmtPlus7Offset = 7 * 60;
  return new Date(date.getTime() + gmtPlus7Offset * 60 * 1000);
};

console.log("=== TIMEZONE DEBUGGING ===");
console.log("Current UTC time:", new Date().toISOString());
console.log("Local time:", new Date().toString());
console.log(
  "WIB time:",
  new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
);
console.log("generateDate() result:", generateDate().toString());
console.log("generateDate() ISO:", generateDate().toISOString());

const today = generateDate();
console.log("\n=== DATE RANGE CALCULATION ===");

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

// Test dengan data sample
const sampleCreatedAt = new Date("2025-05-31 19:03:35.120000");
console.log("\n=== SAMPLE DATA TEST ===");
console.log("Sample created_at:", sampleCreatedAt.toString());
console.log("Sample created_at ISO:", sampleCreatedAt.toISOString());
console.log(
  "Is sample between todayStart and todayEnd?",
  sampleCreatedAt >= todayStart && sampleCreatedAt < todayEnd
);

// Test dengan tanggal yang sama
const testToday = new Date();
console.log("\n=== TODAY TEST ===");
const testTodayStart = new Date(
  testToday.getFullYear(),
  testToday.getMonth(),
  testToday.getDate(),
  0,
  0,
  0
);

const testTodayEnd = new Date(
  testToday.getFullYear(),
  testToday.getMonth(),
  testToday.getDate() + 1,
  0,
  0,
  0
);

console.log("Test todayStart (local):", testTodayStart.toString());
console.log("Test todayStart ISO:", testTodayStart.toISOString());
console.log("Test todayEnd (local):", testTodayEnd.toString());
console.log("Test todayEnd ISO:", testTodayEnd.toISOString());
