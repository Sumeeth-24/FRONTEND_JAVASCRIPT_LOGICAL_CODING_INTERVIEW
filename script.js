// 🧠 1. LIVSPACE CODING QUESTION
// --------------------------------------------------------------
// You are given an array of activity objects where each object
// contains a user ID, a duration, and an array of equipment used
// during that activity.
//
// Your task is to:
// 1️⃣ Group the data by user
// 2️⃣ Remove duplicate entries inside each user's equipment list
// 3️⃣ Sum up the total duration of all activities for each user
// 4️⃣ Sort the equipment array lexicographically (alphabetically)
// 5️⃣ Return a new array where each element represents a unique
//     user with their total duration and sorted equipment list.
// --------------------------------------------------------------

const activities = [
  { user: 8, duration: 50, equipment: ["study"] },
  { user: 7, duration: 150, equipment: ["running", "running"] },
  { user: 1, duration: 10, equipment: ["eating", "eating"] },
  { user: 7, duration: 100, equipment: ["gyming", "coding"] },
  { user: 7, duration: 200, equipment: ["biking", "gyming", "coding"] },
  { user: 2, duration: 200, equipment: ["cocking"] },
  { user: 2, duration: 200, equipment: ["biking"] },
];

// --------------------------------------------------------------
// ✅ Step 1: Group data by user and calculate total duration
// --------------------------------------------------------------
const grouped = activities.reduce((map, { user, duration, equipment }) => {
  // Initialize user entry if not present
  if (!map.has(user)) {
    map.set(user, { totalDuration: 0, equipments: new Set() });
  }

  const userData = map.get(user);

  // Add up total durations for this user
  userData.totalDuration += duration;

  // Add equipments to a Set (automatically removes duplicates)
  equipment.forEach((item) => userData.equipments.add(item));

  return map;
}, new Map());

// --------------------------------------------------------------
// ✅ Step 2: Convert Map → Array and sort each equipment list
// --------------------------------------------------------------
const result = Array.from(grouped, ([user, { totalDuration, equipments }]) => ({
  user,
  duration: totalDuration,
  equipment: [...equipments].sort(),
}));

console.log(result);

// --------------------------------------------------------------
// 🧾 EXPLANATION
// --------------------------------------------------------------
//
// • We use `.reduce()` to iterate over all activity objects.
// • `map` is our accumulator — a `Map` (instead of plain `{}`)
//   to prevent key collisions and preserve insertion order.
//
// • For each user:
//    - If the user doesn’t exist yet → initialize an entry
//    - Add `duration` to their running total
//    - Add each equipment item to a `Set` (removes duplicates)
//
// • Finally, `Array.from()` converts the `Map` into a normal array.
//   Each `[key, value]` pair becomes a structured object:
//     { user, duration, equipment }
//
// • We spread `Set` → `[...equipments]` to get an array
//   and call `.sort()` for lexicographic ordering.
//
// --------------------------------------------------------------
// ✅ OUTPUT
// --------------------------------------------------------------
//
// [
//   { user: 8, duration: 50,  equipment: ['study'] },
//   { user: 7, duration: 450, equipment: ['biking', 'coding', 'gyming', 'running'] },
//   { user: 1, duration: 10,  equipment: ['eating'] },
//   { user: 2, duration: 400, equipment: ['biking', 'cocking'] }
// ]
// --------------------------------------------------------------
