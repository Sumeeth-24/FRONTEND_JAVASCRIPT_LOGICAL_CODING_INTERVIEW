// 🧠 1. LIVSPACE CODING QUESTION
// --------------------------------------------------------------
// You are given an array of activity objects where each object
// contains a user ID, a duration, and an array of equipment used
// during that activity.
//
// Your task is to:3
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
//   Map {
//    8 =>
//       {
//
//         totalDuration:0,
//         equipments:Set {}
//       }
// }
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

// --------------------------------------------------------------
// 2. FLATTEN AN ARRAY
// --------------------------------------------------------------

function myFlatArray() {
  let inputArray = this; // 'this' refer to the array that called this method
  let finalFlattenArray = []; // this will hold the fully flattened result

  for (let i = 0; i < inputArray.length; i++) {
    // Check if current element is an array
    const currentElement = inputArray[i];
    if (Array.isArray(currentElement)) {
      // Recursively call myFlatArray on the nested array
      let result = currentElement.myFlatArray();
      // Merge the result into the final flattened array
      finalFlattenArray.push(...result);
    } else {
      // If not an array (primitive value), directly push into result
      finalFlattenArray.push(currentElement);
    }
  }

  return finalFlattenArray; // Return the final flattened array
}

// APPROACH 2 USING REDUCE METHOD
function myFlatArray() {
  const inputArray = this;

  return inputArray.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      // If current element is an array, recursively flatten it
      acc.push(...curr.myFlatArray());
    } else {
      // If it's a primtiive value, add directly to accumulator
      acc.push(curr);
    }
    return acc;
  }, []);
}

// Attach the custom method to all arrays
Array.prototype.myFlatArray = myFlatArray;
// Test Input
const arr1 = [0, 1, 2, [3, 4], [5, 6], [1, 2, 3, [4, [6, 7]]]];
// Output the flattened version
console.log("# RESULT: ", arr1.myFlatArray()); // [0,1,2,3,4,5,6,1,2,3,4,6,7]


// --------------------------------------------------------------
// 3. FLATTEN ARRAY WITH DEPTH (Polyfill)
// --------------------------------------------------------------

function myFlatArray(depth = 1) {
  let inputArray = this;
  let result = [];

  for (let i = 0; i < inputArray.length; i++) {
    const currentElement = inputArray[i];

    // Check if element is an array AND depth is still available
    if (Array.isArray(currentElement) && depth > 0) {
      // Flatten one level and reduce depth
      const flattened = currentElement.myFlatArray(depth - 1);
      result.push(...flattened);
    } else {
      // Push as-is (primitive or depth exhausted)
      result.push(currentElement);
    }
  }

  return result;
}

// Attach to Array prototype
Array.prototype.myFlatArray = myFlatArray;
const arr = [0, 1, [2, [3, [4, 5]]]];
console.log(arr.myFlatArray(1));
// [0, 1, 2, [3, [4, 5]]]
console.log(arr.myFlatArray(2));
// [0, 1, 2, 3, [4, 5]]
console.log(arr.myFlatArray(3));
// [0, 1, 2, 3, 4, 5]


// --------------------------------------------------------------
// 4. FLATTEN DEEPLY NESTED OBJECT
// --------------------------------------------------------------

// Function to deeply flatten an object (handles nested objects + arrays)
// obj     → input object to flatten
// prefix  → keeps track of the key path (used for recursion)
// result  → accumulator object that stores final flattened output
const flattenObject = (obj, prefix = "", result = {}) => {
  // Object.entries() returns only own enumerable properties.
  // Avoids using hasOwnProperty() inside the loop.
  // [
  //   ["name", "John"], const [key, value] = ["name", "John"];
  //   ["age", 25]
  // ]
  // Object.entries() return Each element is an array of two values.
  for (const [key, value] of Object.entries(obj)) {

    // Build the current key path.
    // "" + name          -> name
    // address + city     -> address_city
    // phones_0 + type    -> phones_0_type
    const newKey = prefix ? `${prefix}_${key}` : key;

    // ==========================
    // CASE 1: Value is an Array
    // ==========================
    if (Array.isArray(value)) {

      value.forEach((item, index) => {

        // Preserve array index in flattened key.
        // Example:
        // phones_0
        // phones_1
        const arrayKey = `${newKey}_${index}`;

        // Array item is another object/array
        // Recurse deeper.
        if (item !== null && typeof item === "object") {
          flattenObject(item, arrayKey, result);
        }
        // Array item is primitive
        // Store directly.
        else {
          result[arrayKey] = item;
        }
      });
    }

    // ==========================
    // CASE 2: Nested Object
    // ==========================
    else if (value !== null && typeof value === "object") {

      // Continue building the key path.
      flattenObject(value, newKey, result);
    }

    // ==========================
    // CASE 3: Primitive Value
    // ==========================
    else {

      // Base case of recursion.
      // Store the final flattened key-value pair.
      result[newKey] = value;
    }
  }

  // Same result object is shared across recursive calls,
  // avoiding unnecessary object creation.
  return result;
};

const user = {
  name: "Vishal",
  age: null,
  address: {
    primary: {
      house: "109",
      street: {
        main: "21",
        cross: null,
      },
    },
    secondary: null,
  },
  phones: [
    { type: "home", number: "1234567890" },
    { type: "work", number: null },
  ],
  preferences: null,
};

const flattenedUser = flattenObject(user);
console.log(flattenedUser);

// Output
// {
//   name: 'Vishal',
//   age: null,
//   address_primary_house: '109',
//   address_primary_street_main: '21',
//   address_primary_street_cross: null,
//   address_secondary: null,
//   phones_0_type: 'home',
//   phones_0_number: '1234567890',
//   phones_1_type: 'work',
//   phones_1_number: null,
//   preferences: null
// }


// --------------------------------------------------------------
// 5. ADD SUM OF DEEPLY NESTED OBJECT
// --------------------------------------------------------------

let data = {
  a: {
    a: "a",
    b: 1,
  },
  b: {
    b: 1,
  },
  c: {
    c: {
      e: "e",
      b: {
        c: "c",
        a: 1,
      },
    },
  },
};

// Function to sum all numeric values in a deeply nested object
const sumDeepObject = (obj) => {
  // Accumulates the sum for the current object level.
  let sum = 0;

  // Object.values() returns only the object's own values.
  // No need for hasOwnProperty().
  for (const value of Object.values(obj)) {

    // ==========================
    // CASE 1: Primitive Number
    // ==========================
    if (typeof value === "number") {
      // Add number directly to the running total.
      sum += value;
    }

    // ==========================
    // CASE 2: Nested Object
    // ==========================
    else if (value !== null && typeof value === "object") {
      // Recursively sum all numbers inside the nested object
      // and add them to the current sum.
      sum += sumDeepObject(value);
    }

    // ==========================
    // CASE 3: Ignore Everything Else
    // ==========================
    // Strings, booleans, undefined, functions, etc.
  }

  // Return the total sum for this object level.
  return sum;
};


console.log(sumDeepObject(data)); // 3


// --------------------------------------------------------------
// 6. IMPLEMENT DEEP FILTER
// --------------------------------------------------------------

function deepFilter(collection, callback) {
  // ❌ SAFETY CHECK #1
  // If collection is:
  // - undefined / null
  // - not an object
  // - an array (explicitly disallowed)
  // then this function should not proceed
  if (
    !collection ||
    typeof collection !== "object" ||
    Array.isArray(collection)
  ) {
    throw new TypeError("Invalid collection");
  }

  // ❌ SAFETY CHECK #2
  // Callback must be a function
  // Otherwise calling it will cause a runtime error
  if (typeof callback !== "function") {
    throw new TypeError("Invalid callback");
  }

  // 📦 Create a fresh object.
  // We'll build a new filtered version instead of mutating the original.
  const result = {};

  // 🔁 Iterate over all own enumerable key-value pairs in the object.
  // Object.entries() automatically skips inherited properties,
  // so no hasOwnProperty() check is needed.
  for (const [key, value] of Object.entries(collection)) {
    // 🔍 CASE 1: If value is a nested object
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // 🔁 Recursively filter the nested object
      const filteredChild = deepFilter(value, callback);

      // ✅ Keep the object ONLY if it has valid keys left
      // This avoids returning empty objects
      //
      // b: {
      //   c: -2,
      //   d: 3
      // }
      // 1️⃣ deepFilter(b)
      // 2️⃣ filteredChild = { d: 3 }
      // 3️⃣ Object.keys(filteredChild) → ["d"]
      // 4️⃣ length is 1 → ✅ keep b
      //
      // b: {
      //   c: -2,
      //   d: -3
      // }
      // 1️⃣ deepFilter(b)
      // 2️⃣ filteredChild = {}
      // 3️⃣ Object.keys(filteredChild) → []
      // 4️⃣ length is 0 → ❌ discard b

      if (Object.keys(filteredChild).length > 0) {
        result[key] = filteredChild;
      }
    }
    // 🔍 CASE 2: If value is a primitive (number, string, boolean, etc.)
    else {
      // 🎯 Apply callback condition
      // If callback returns true → keep the key
      if (callback(value, key)) {
        result[key] = value;
      }
    }
  }

  return result;
}

const input1 = {
  a: 1,
  b: {
    c: 2,
    d: -3,
    e: {
      f: {
        g: -4,
      },
    },
    h: {
      i: 5,
      j: 6,
    },
  },
};

const input2 = {
  a: 1,
  b: {
    c: "Hello World",
    d: 2,
    e: {
      f: {
        g: -4,
      },
    },
  },
  h: "Good Night Moon",
};

const callback1 = (element) => element > 0; // Keep only non-negative numbers

const callback2 = (element) => typeof element === "string"; // Keep only string values

const filtered1 = deepFilter(input1, callback1);
const filtered2 = deepFilter(input2, callback2);

console.log("filtered1 ==>", filtered1);
console.log("filtered2 ==>", filtered2);

// --------- OUTPUT --------
// filtered1 ==> { a: 1, b: { c: 2, h: { i: 5, j: 6 } } }
// filtered2 ==> { b: { c: 'Hello World' }, h: 'Good Night Moon' }



// --------------------------------------------------------------
// 7. IMPLEMENT DEEP EQUAL
// --------------------------------------------------------------

// Implement a function deepEqual that performs a deep comparison between two values. It returns true if two input values are deemed equal, and returns false if not.

// You can assume there are only JSON-serializable values (numbers, strings, boolean, null, objects, arrays).
// There wouldn't be cyclic objects, i.e. objects with circular references.
// Examples

// deepEqual('foo', 'foo'); // true
// deepEqual({ id: 1 }, { id: 1 }); // true
// deepEqual([1, 2, 3], [1, 2, 3]); // true
// deepEqual([{ id: '1' }], [{ id: '2' }]); // false

export default function deepEqual(value1, value2) {
  // Step 1: Check for strict equality (quick exit for primitive types and identical references)
  if (value1 === value2) {
    return true;
  }

  // Step 2: Check for `null` values or if either is not an object (covers primitives)
  if (
    value1 === null ||
    value2 === null ||
    typeof value1 !== "object" ||
    typeof value2 !== "object"
  ) {
    return false;
  }

  // Step 3: Handle array case specifically
  const isArray1 = Array.isArray(value1);
  const isArray2 = Array.isArray(value2);

  if (isArray1 !== isArray2) {
    return false; // If one is an array and the other is not, return false
  }

  if (isArray1 && isArray2) {
    if (value1.length !== value2.length) {
      return false; // Arrays of different lengths are not equal
    }

    // Compare arrays element by element using recursion
    for (let i = 0; i < value1.length; i++) {
      if (!deepEqual(value1[i], value2[i])) {
        return false;
      }
    }
    return true; // If all elements match, arrays are deeply equal
  }

  // Step 4: Get all own enumerable key-value pairs
    const entries1 = Object.entries(value1);
    const entries2 = Object.entries(value2);

    // If the number of own properties differ, objects cannot be equal
    if (entries1.length !== entries2.length) {
      return false;
    }

    // Step 5: Compare each property recursively
    for (const [key, value] of entries1) {
      // Ensure value2 has the same own property
      if (!Object.hasOwn(value2, key)) {
        return false;
      }

      // Recursively compare the property values
      if (!deepEqual(value, value2[key])) {
        return false;
      }
    }

  return true; // If all checks pass, the objects are deeply equal
}


// --------------------------------------------------------------
// 8. IMPLEMENT DEEP MAP
// --------------------------------------------------------------

export default function deepMap(value, fn) {
  // Start the recursive traversal.
  // Pass the original value so it becomes the `this` context
  // when invoking the callback.
  return deepMapHelper(value, fn, value);
}

// Function to check if a given value is a "plain object"
// A "plain object" is an object created using `{}`, `new Object()`,
// or `Object.create(null)`.
//
// isPlainObject({})                // ✅ true
// isPlainObject(new Object())      // ✅ true
// isPlainObject(Object.create(null)) // ✅ true
// isPlainObject([])                // ❌ false
// isPlainObject(new Date())        // ❌ false
// isPlainObject(/abc/)             // ❌ false
// isPlainObject(null)              // ❌ false
// isPlainObject(42)                // ❌ false

function isPlainObject(value) {
  // Null, undefined, and primitives are not plain objects.
  if (value == null || typeof value !== "object") {
    return false;
  }

  // Get the object's prototype.
  const prototype = Object.getPrototypeOf(value);

  // Plain objects have either:
  // 1. Object.prototype (normal objects)
  // 2. null (Object.create(null))
  return prototype === Object.prototype || prototype === null;
}

// Recursive helper function
function deepMapHelper(value, fn, original) {
  // ----------------------------------------------------------
  // CASE 1: Arrays
  // ----------------------------------------------------------
  // Recursively map every array element.
  if (Array.isArray(value)) {
    return value.map(item => deepMapHelper(item, fn, original));
  }

  // ----------------------------------------------------------
  // CASE 2: Plain Objects
  // ----------------------------------------------------------
  // Recursively map every property value.
  if (isPlainObject(value)) {
    const mappedObject = {};

    // Object.entries() returns only the object's own enumerable
    // key-value pairs, so no hasOwnProperty() check is required.
    for (const [key, child] of Object.entries(value)) {
      mappedObject[key] = deepMapHelper(child, fn, original);
    }

    return mappedObject;
  }

  // ----------------------------------------------------------
  // CASE 3: Primitive values / Special objects
  // ----------------------------------------------------------
  // Apply the callback to leaf values.
  // fn.call(original, value) ensures `this` inside the callback
  // refers to the original input passed to deepMap().
  return fn.call(original, value);
}

// --------------------------------------------------------------
// EXAMPLES
// --------------------------------------------------------------

// const double = x => x * 2;

// deepMap(2, double);
// // → 4

// deepMap([1, 2, 3], double);
// // → [2, 4, 6]

// deepMap({ a: 1, b: 2, c: 3 }, double);
// // → { a: 2, b: 4, c: 6 }

// deepMap(
//   {
//     foo: 1,
//     bar: [2, 3, 4],
//     qux: { a: 5, b: 6 },
//   },
//   double,
// );
// → {
//     foo: 2,
//     bar: [4, 6, 8],
//     qux: { a: 10, b: 12 }
//   }



// --------------------------------------------------------------
// 9. IMPLEMENT DEEP MERGE
// --------------------------------------------------------------

// Implement a function deepMerge(objA, objB) to takes in two objects and returns a new object after deep merging them:

// The resulting object should contain a union of the keys/values of both objects.
// If the same key is present on both objects, the merged value will be from objB, unless:
// Both values are arrays: the elements from objB will be appended behind objA's.
// Both values are objects: merge the objects as per the same rules for deepMerge.
// Arrays and objects within the merged object should be new instances.
// The input objects should not be modified.

// Examples

// deepMerge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
// deepMerge({ a: 1 }, { a: 2 }); // { a: 2 }
// deepMerge({ a: 1, b: [2] }, { b: [3, 4] }); // { a: 1, b: [2, 3, 4] }

export default function deepMerge(valA, valB) {
  // Step 1: Check if both values are arrays.
  // If both are arrays, merge them by concatenating their elements.
  if (Array.isArray(valA) && Array.isArray(valB)) {
    return [...valA, ...valB]; // Combines both arrays into a new array.
  }

  // Step 2: Check if both values are plain objects.
  // If both are objects, we need to merge them deeply.
  if (isPlainObject(valA) && isPlainObject(valB)) {
    const newObj = { ...valA }; // Create a new object to avoid mutating valA.

    // Iterate over each own enumerable property in valB.
    for (const [key, value] of Object.entries(valB)) {
      // Check if valA also has this key (to perform a deep merge).
      if (Object.hasOwn(valA, key)) {
        // Recursively merge the values of the current key.
        newObj[key] = deepMerge(valA[key], value);
      } else {
        // If valA doesn't have the key, just copy it from valB.
        newObj[key] = value;
      }
    }
    return newObj; // Return the merged object.
  }

  // Step 3: If neither arrays nor objects match, return valB.
  // This means valB overwrites valA when they are different types.
  return valB;
}

// Function to check if a given value is a "plain object"
// A "plain object" is an object created using `{}`, `new Object()`,
// or `Object.create(null)`.
//
// isPlainObject({})                // ✅ true
// isPlainObject(new Object())      // ✅ true
// isPlainObject(Object.create(null)) // ✅ true
// isPlainObject([])                // ❌ false
// isPlainObject(new Date())        // ❌ false
// isPlainObject(/abc/)             // ❌ false
// isPlainObject(null)              // ❌ false
// isPlainObject(42)                // ❌ false

function isPlainObject(value) {
  // Null, undefined, and primitives are not plain objects.
  if (value == null || typeof value !== "object") {
    return false;
  }

  // Get the object's prototype.
  const prototype = Object.getPrototypeOf(value);

  // Plain objects have either:
  // 1. Object.prototype (normal objects)
  // 2. null (Object.create(null))
  return prototype === Object.prototype || prototype === null;
}


// --------------------------------------------------------------
// 10. IMPLEMENT DEEP OMIT
// --------------------------------------------------------------

// Implement a function deepOmit(obj, keys) that removes specified keys and their corresponding values from an object, including nested objects or arrays. It works recursively to traverse through the entire object structure, ensuring that all occurrences of the specified keys are removed at all levels. The function takes in an object (obj) and an array of string keys (keys).

// EXAMPLE:
// const obj = {
//   a: 1,
//   b: 2,
//   c: {
//     d: 3,
//     e: 4,
//   },
//   f: [5, 6],
// };
// deepOmit(obj, ['b', 'c', 'e']); // { a: 1, f: [5, 6] }

// When dealing with nested data structures, arrays require special handling because:
// They are iterable (like objects), but their structure is ordered and indexed.
// Keys to omit only apply to objects, not arrays.
// Array elements may contain objects, which must be processed recursively.

// const obj = {
//   a: 1,
//   b: [ { c: 2, d: 3 }, { e: 4 } ],
// };

// console.log(deepOmit(obj, ['c', 'e']));  
// Expected Output: { a: 1, b: [ { d: 3 }, {} ] } 

export default function deepOmit(obj, keys) {
  // Convert the array of keys into a Set for faster lookups.
  const omitSet = new Set(keys);

  function helper(value) {
    // Base case: If value is not an object or array, return it as is.
    if (typeof value !== "object" || value === null) {
      return value;
    }

    // If value is an array, recursively process each element.
    if (Array.isArray(value)) {
      return value.map(helper);  // when the helper only needs the current item.
    }

    // Create a new object to store filtered properties.
    const result = {};

    // Iterate over all own enumerable key-value pairs.
    for (const [key, child] of Object.entries(value)) {
      // Skip keys that need to be omitted.
      if (omitSet.has(key)) {
        continue;
      }

      // Recursively process nested objects and arrays.
      result[key] = helper(child);
    }

    return result;
  }

  return helper(obj);
}


// --------------------------------------------------------------
// 11. CHAIN CALCULATOR
// --------------------------------------------------------------

class Calculator {

  // 🏗️ Constructor initializes the calculator
  constructor(initialValue = 0) {
    // `this.value` holds the current calculation result
    // Stored on the instance so it persists across chained calls
    this.currentValue = initialValue;
  }

  lacs(amount) {
    // Update internal state
    // We mutate the instance instead of creating a new object
    this.currentValue += amount * 100000;

    // 🔁 Return `this` so that another method
    // can be called on the same instance
    return this;
  }

  crore(amount) {
    // Modify the stored value
    this.currentValue += amount * 10000000;

    // 🔁 Returning `this` enables chaining like:
    // calculator.subtract(2).multiply(3)
    return this;
  }

  thousand(amount) {
    // Apply multiplication on the internal value
    this.currentValue += amount * 1000;

    // 🔁 Returning the instance maintains the chain
    return this;
  }

  // 📤 Retrieves the final calculated value
  value() {
    // Separate "computation" from "retrieval"
    // Improves readability and API design
    return this.currentValue;
  }
}

const computeAmount = new Calculator(15);

const answer = computeAmount
 .lacs(15)
 .crore(5)
 .crore(2)
 .lacs(20)
 .thousand(45)
 .crore(7)
 .value();

console.log(answer);



// --------------------------------------------------------------
// 12. POLYFILL FOR MEMOIZE AN ASYNC FUNCTION
// --------------------------------------------------------------

/* Write a function that wraps an async function and caches its results so that the same async call is not executed again for the same inputs. */

async function getUserData(query, searchKey, signal) {
  /**
   * WHY normalize query?
   * - If query is an object, URL would become [object Object]
   * - Stringify ensures meaningful query value
   */
  const normalizedQuery =
    typeof query === "object" && query !== null
      ? JSON.stringify(query)
      : query;

  // Construct API URL safely
  const url = `https://jsonplaceholder.typicode.com/users?username=${normalizedQuery}&key=${searchKey}`;

  console.log(`🌐 API CALL → Fetching from: ${url}`);

  // Fetch with AbortSignal support
  const res = await fetch(url, { signal });

    // WHY check res.ok?
    //
    // fetch() only throws on NETWORK errors.
    // HTTP errors (404, 500, etc.) still resolve successfully.
    //
    // Check res.ok to convert HTTP failures into JavaScript errors
    // so they can be handled in catch().
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const data = await res.json();

  // Return enriched response
  return {
    success: true,
    query,
    searchKey,
    result: data,
    timestamp: Date.now(),
  };
}

// --------------------------------------------------------------
// HELPER: Stable serialization for cache keys
// --------------------------------------------------------------

/*
WHY outside the memoized function?
- Avoid recreating the function on every invocation.
- Cleaner and slightly more performant.
*/
function serialize(arg) {
  // Symbols / Functions
  // WHY?
  // JSON.stringify ignores functions and symbols.
  // Convert them into strings so cache keys stay deterministic.
  if (typeof arg === "symbol" || typeof arg === "function") {
    return arg.toString();
  }

  // Objects
  if (typeof arg === "object" && arg !== null) {

    /*
    WHY sort object keys?

    Avoid:
    { a: 1, b: 2 }
    and
    { b: 2, a: 1 }

    Both objects contain identical data but
    JSON.stringify() would normally produce different strings
    depending on insertion order.

    Sorting ensures BOTH generate the SAME cache key.
    */
    return JSON.stringify(
      Object.fromEntries(Object.entries(arg).sort())
    );
  }

  // Primitive values
  return String(arg);
}

function memoizeUserData(fn, ttl = 300000) {
  // 🧠 Cache Map
  // key → { value: Promise, expiry: number }
  const cache = new Map();

  // 🛑 AbortController Map
  // (kept for learning / future use cases like search)
  const controllers = new Map();

  return async function (...args) {

        /*
      WHY generate a cache key?

      Cache works using:
          key  -> Promise

      Same inputs should always produce
      the same cache key.

      Different inputs should produce
      different cache keys.
      */

      const key = JSON.stringify(args.map(serialize));

      const now = Date.now();
      const cached = cache.get(key);

    // --------------------------------------------------------------
    // CACHE HIT
    // --------------------------------------------------------------

    /*
    WHY return the cached Promise instead of waiting
    for it to resolve first?

    Example:

    memoized("Bret");
    memoized("Bret");

    If the first request is still fetching,
    both callers receive the SAME Promise.

    Result:
    ✅ Only ONE API request
    ✅ No duplicate network calls

    This is called
    "In-flight Request Deduplication"
    */

    if (cached && now < cached.expiry) {
      console.log(`✅ CACHE HIT → ${key}`);
      return cached.value;
    }

    console.log(`📡 FETCHING → New request for key: ${key}`);

    // --------------------------------------------------------------
      // CACHE MISS
      // --------------------------------------------------------------

      console.log(`📡 CACHE MISS → Fetching new data`);

      // Create controller (optional feature)
      const controller = new AbortController();
      controllers.set(key, controller);

      /*
      WHY cache the Promise immediately?

      Wrong approach:

      const data = await fn(...);
      cache.set(key, data);

      Problem:
      Two callers arriving before await finishes
      will BOTH call the API.

      Correct approach:

      const promise = fn(...);
      cache.set(key, promise);

      Now every caller shares the SAME Promise.

      Interview keyword:
      Promise Memoization
      */

      const promise = fn(...args, controller.signal)
        .catch(err => {

        /*
        WHY remove failed requests?

        Never cache failed Promises.

        Otherwise:

        First request ❌ fails

        Second request
            ↓
        Returns same rejected Promise forever.

        Delete it so future calls
        can retry successfully.
        */

        cache.delete(key);

        /*
        WHY handle AbortError separately?

        User intentionally cancelled the request.

        This isn't an application error.

        Remove from cache and silently exit.
        */

        if (err.name === "AbortError") {
          console.log("⚠️ Request aborted");
          return;
        }

        throw err;
      })
     .finally(() => {

      /*
      WHY delete AbortController?

      Request is finished.

      Keeping unused controllers
      wastes memory.

      Clean up after completion.
      */

      controllers.delete(key);
    });

    // 💾 Cache the Promise immediately
    // If two identical requests arrive before the first one finishes, caching only the resolved value means both requests trigger separate API calls. Caching the Promise immediately ensures all callers await the same in-flight request, preventing duplicate work.
    cache.set(key, {
      value: promise,
      expiry: now + ttl,
    });

    return promise;
  };
}

const memoizedGetUserData = memoizeUserData(getUserData, 5000);

// 1️⃣ Fresh call → API hit
memoizedGetUserData("Bret", 1)
  .then(res => console.log("👉 RESULT 1:", res))
  .catch(console.error);

// 2️⃣ Cached call → no API hit
setTimeout(() => {
  memoizedGetUserData("Bret", 1)
    .then(res => console.log("👉 RESULT 2 (cached):", res))
    .catch(console.error);
}, 3000);

// 3️⃣ After TTL expires → API hit again
setTimeout(() => {
  memoizedGetUserData("Bret", 1)
    .then(res => console.log("👉 RESULT 3 (after TTL):", res))
    .catch(console.error);
}, 6000);


// --------------------------------------------------------------
// 13. RETRY A PROMISE N NUMBER OF TIMES
// --------------------------------------------------------------

/*
Retry an async operation if it fails.

Common use cases:
✔ API requests
✔ Database queries
✔ File uploads
✔ Third-party services
*/

// --------------------------------------------------------------
// WAIT (Delay Helper)
// --------------------------------------------------------------

/*
WHY create wait()?

JavaScript has no built-in sleep().

wait(ms) creates a Promise that resolves
after the specified time.

Useful for delaying retries.
*/

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --------------------------------------------------------------
// RETRY FUNCTION
// --------------------------------------------------------------

/*
Parameters

operation -> Async function to execute
retries   -> Maximum retry attempts
delay     -> Wait time before each retry
finalErr  -> Error message after all retries fail

WHY add attempt?

retries tells us how many retries remain.

attempt tells us which retry we're currently on.

Attempt number is needed to calculate
Exponential Backoff.
*/

const retryWithDelay = async (
  operation,
  retries = 3,
  delay = 1000,
  finalErr = "Retry Failed",
  attempt = 1
) => {

  try {

    /*
    WHY call operation() instead of passing a Promise?

    Passing a function allows creating
    a NEW Promise on every retry.

    Wrong ❌

    retry(fetch(...))

    fetch() already started.

    Correct ✅

    retry(() => fetch(...))

    A fresh request is created every retry.
    */

    const result = await operation();

    /*
    SUCCESS

    Return immediately.

    No more retries needed.
    */

    return result;

  } catch (error) {

    /*
    WHY use try/catch?

    When an awaited Promise rejects,

    await throws an exception.

    catch() decides whether to:

    ✔ Retry
    OR
    ✔ Fail permanently
    */

    /*
    WHY stop when retries reach 0?

    Prevent infinite recursion.

    All retry attempts have been exhausted.

    throw inside an async function automatically
    returns a rejected Promise.
    */

    if (retries <= 0) {
      throw new Error(finalErr);
    }

   console.log(
    `🔄 Attempt ${attempt + 1} of ${attempt + retries + 1}`
    );

    /*
    WHY use Exponential Backoff?

    Instead of waiting the same time
    between every retry,

    increase the delay after each failure.

    Example

    Attempt 1 → wait 1 sec
    Attempt 2 → wait 2 sec
    Attempt 3 → wait 4 sec
    Attempt 4 → wait 8 sec

    Benefits

    ✔ Reduces server load
    ✔ Prevents request storms
    ✔ Gives the service time to recover
    ✔ Common strategy used by AWS, Google Cloud, Stripe, etc.
    */

    // Calculate exponentially increasing delay
    const backoffDelay = delay * Math.pow(2, attempt - 1);

    console.log(`⏳ Waiting ${backoffDelay} ms before retry...`);

    await wait(backoffDelay);

    /*
    WHY return the recursive call?

    Very important interview point.

    Wrong ❌

    retryWithDelay(...)

    The retry executes,
    but its Promise is ignored.

    Caller never receives
    the successful retry result.

    Correct ✅

    return retryWithDelay(...)

    The recursive Promise is returned
    back to the original caller.
      
    WHY increment attempt?

    Each retry represents a new attempt.

    Increasing attempt causes
    the delay to grow exponentially.

    Attempt 1 → 1 sec
    Attempt 2 → 2 sec
    Attempt 3 → 4 sec
    ...

    */

    return retryWithDelay(
      operation,
      retries - 1,
      delay,
      finalErr,
      attempt + 1
    );
  }
};

// --------------------------------------------------------------
// SAMPLE ASYNC FUNCTION
// --------------------------------------------------------------

/*
Simulate an unreliable API.

Math.random() > 0.9

≈10% Success
≈90% Failure

Useful for testing retry logic.
*/

const fetchUserData = () => {

  return new Promise((resolve, reject) => {

    setTimeout(() => {

      if (Math.random() > 0.9) {

        resolve({
          userId: 1,
          name: "Smith Jone",
        });

      } else {

        reject("Network Error");

      }

    }, 1000);

  });

};

// --------------------------------------------------------------
// TEST
// --------------------------------------------------------------

const testRetryLogic = async () => {

  try {

    /*
    retryWithDelay() returns the final result
    if any retry succeeds.

    "Why do we pass fetchUserData instead of fetchUserData()?"
    "fetchUserData() executes immediately and returns a Promise that's already in progress. If it fails, retrying the same Promise won't start a new request. Passing fetchUserData (the function itself) lets retryWithDelay call it again on each retry, creating a fresh Promise and a new network request every time."
    */

    const userData = await retryWithDelay(
      fetchUserData,
      5,
      2000
    );

    console.log(
      "✅ User data retrieved successfully",
      userData
    );

  } catch (error) {

    /*
    WHY catch here?

    If ALL retries fail,

    retryWithDelay() throws.

    Final caller must still handle
    the rejection.
    */

    console.log(
      "❌ Failed to retrieve user data",
      error
    );

  }

};

testRetryLogic();


// --------------------------------------------------------------
// 14. DEEP CLONE AN OBJECT
// --------------------------------------------------------------

function deepClone(obj, seen = new WeakMap()) {

  /*
  ==================================================
  🧠 BASE CASE
  ==================================================

  Return immediately if the value is:

  ✔ null
  ✔ number
  ✔ string
  ✔ boolean
  ✔ bigint
  ✔ symbol
  ✔ undefined
  ✔ function

  WHY?

  Only Objects and Arrays can contain
  nested references that require deep cloning.

  Primitive values are immutable,
  so returning them directly is safe.

  NOTE

  typeof null === "object"   // Historical JavaScript quirk
  typeof [] === "object"
  typeof {} === "object"

  That's why we explicitly check

  obj === null
  */

  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  /*
  ==================================================
  🔁 CIRCULAR REFERENCE CHECK
  ==================================================

  WHY keep track of cloned objects?

  Example

  const person = {
      name: "John"
  };

  person.self = person;

  Without WeakMap

  deepClone(person)

        ↓

  person.self

        ↓

  person.self.self

        ↓

  person.self.self.self

        ↓

  Infinite recursion

        ↓

  Maximum call stack exceeded

  WeakMap stores

      Original Object
              ↓
      Cloned Object

  If we encounter the same object again,
  simply return the existing clone.

  This preserves circular references.
  */

  if (seen.has(obj)) {
    return seen.get(obj);
  }

  /*
  ==================================================
  🏗 CREATE THE CLONE
  ==================================================

  WHY not simply write {} ?

  {}

  always creates a plain object.

  Example

  class User {}

  const user = new User();

  {}

  loses the prototype.

  Instead

  Object.create(Object.getPrototypeOf(obj))

  preserves the prototype chain.

  Result

  deepClone(user) instanceof User

  ✔ true
  */

  const prototype = Object.getPrototypeOf(obj);

  const clone = Array.isArray(obj)
    ? []
    : Object.create(prototype);

  /*
  ==================================================
  🧷 STORE IN WEAKMAP
  ==================================================

  WHY store BEFORE recursion?

  Nested objects may reference
  the current object.

  Example

      A
     / \
    B   C
     \ /
      A

  If we don't store the clone first,

  recursion never knows that A
  has already been cloned.

  WHY WeakMap instead of Map?

  ✔ Keys must be objects.
  ✔ Automatically garbage collected.
  ✔ Prevents memory leaks.

  A normal Map keeps strong references,
  preventing unused objects
  from being garbage collected.
  */

  seen.set(obj, clone);

  /*
  ==================================================
  🔄 ITERATE OVER PROPERTIES
  ==================================================

  WHY use Reflect.ownKeys()?

  It returns ALL own property keys.

  ✔ String keys
  ✔ Symbol keys
  ✔ Non-enumerable keys

  Unlike

  for...in

  which

  ❌ Includes inherited enumerable properties
  ❌ Ignores Symbol keys

  Unlike

  Object.keys()

  which

  ❌ Ignores Symbol keys
  ❌ Ignores non-enumerable properties

  Reflect.ownKeys() is the most complete
  way to clone an object's own properties.
  */

  for (const key of Reflect.ownKeys(obj)) {

    const value = obj[key];

    /*
    ==================================================
    📅 DATE
    ==================================================

    WHY special handling?

    Date is an object.

    Normal assignment

    clone.date = value

    copies only the reference.

    Both objects would point
    to the SAME Date instance.

    getTime()

    returns the timestamp.

    new Date(timestamp)

    creates a NEW Date object
    with the same value.
    */

    if (value instanceof Date) {

      clone[key] = new Date(value.getTime());

    }

    /*
    ==================================================
    🔍 REGEXP
    ==================================================

    WHY recreate RegExp?

    RegExp stores

    ✔ Pattern
    ✔ Flags
    ✔ lastIndex

    We recreate it to preserve
    its complete state.

    lastIndex is especially important
    for global (/g)
    and sticky (/y) regex.
    */

    else if (value instanceof RegExp) {

      const regexClone = new RegExp(
        value.source,
        value.flags
      );

      regexClone.lastIndex = value.lastIndex;

      clone[key] = regexClone;

    }

    /*
    ==================================================
    🧬 NESTED OBJECT / ARRAY
    ==================================================

    WHY recurse?

    Objects may contain

    Object
      ↓
    Object
      ↓
    Object
      ↓
    Array
      ↓
    Date

    We recursively deep clone
    every nested reference.

    WHY pass the SAME WeakMap?

    Every recursive call must share
    the same record of already-cloned objects.

    Creating a NEW WeakMap every time

    would forget previously cloned objects

    and circular references would fail.
    */

    else if (value !== null && typeof value === "object") {

      clone[key] = deepClone(value, seen);

    }

    /*
    ==================================================
    🧾 PRIMITIVES / FUNCTIONS
    ==================================================

    WHY aren't functions deep cloned?

    Functions are executable objects.

    JavaScript cannot clone
    their implementation.

    Functions are intentionally copied
    by reference.

    This matches

    structuredClone()

    which also does not clone functions.
    */

    else {

      clone[key] = value;

    }

  }

  /*
  ==================================================
  ✅ RETURN FINAL CLONE
  ==================================================

  At this point

  ✔ Every nested object is cloned.
  ✔ Arrays are cloned.
  ✔ Dates are cloned.
  ✔ RegExp objects are cloned.
  ✔ Circular references are preserved.
  ✔ Prototype chain is preserved.

  Return the completed deep clone.
  */

  return clone;

}


  // --------------------------------------------------------------
  // 15. CANCELLABLE PROMISE
  // --------------------------------------------------------------

  /*
  ==================================================
  WHAT IS A CANCELLABLE PROMISE?
  ==================================================

  JavaScript Promises CANNOT be cancelled.

  Once an async operation starts,

  fetch()
  database query
  file upload

  they continue running until completion.

  This utility DOES NOT stop
  the async operation.

  Instead,

  it ignores the final result
  if cancel() was called.

  Think of it as

  "Ignore the result"

  rather than

  "Stop the work."

  True cancellation requires

  ✔ AbortController
  ✔ clearTimeout()
  ✔ clearInterval()
  ✔ Worker termination
  */

  // --------------------------------------------------------------
  // CUSTOM CANCELLATION ERROR
  // --------------------------------------------------------------

  /*
  WHY create a custom Error?

  Without it,

  catch(error)

  cannot distinguish

  ✔ Network Error
  ✔ Server Error
  ✔ Cancellation

  Consumers can detect

  error instanceof CanceledPromiseError

  or

  error.name
  */

  class CanceledPromiseError extends Error {

    constructor() {

      super("Promise has been canceled");

      this.name = "CanceledPromiseError";

    }

  }

  // --------------------------------------------------------------
  // MAKE PROMISE CANCELABLE
  // --------------------------------------------------------------

  /*
  WHY create a utility function?

  Avoid modifying built-in objects.

  Don't do

  Promise.cancelable(...)

  This is called

  Monkey Patching

  Problems

  ❌ Changes global behavior
  ❌ Can conflict with libraries
  ❌ Surprises other developers

  Instead

  makeCancelable(promise)

  is safer and preferred
  in interviews.
  */

  function makeCancelable(originalPromise) {

    /*
    Cancellation Flag

    WHY?

    Promises have no

    cancel()

    stop()

    pause()

    methods.

    We simply remember
    whether cancellation
    was requested.
    */

    let canceled = false;

    /*
    Wrapped Promise

    WHY wrap the original Promise?

    Gives us control over

    resolve()

    reject()

    without modifying
    the original Promise.
    */

    const promise = new Promise((resolve, reject) => {

      originalPromise

        .then((value) => {

          /*
          Promise completed successfully.

          Was it cancelled?
          */

          if (canceled) {

            /*
            WHY reject instead of resolve?

            Cancellation means

            "Ignore this result."

            Rejecting allows callers
            to handle cancellation
            inside catch().

            Similar to AbortController.
            */

            reject(new CanceledPromiseError());

            return;

          }

          resolve(value);

        })

        .catch((error) => {

          /*
          WHY forward original errors?

          Cancellation should NEVER hide

          ✔ Network failures
          ✔ Server errors
          ✔ Programming errors

          Real failures should still
          reach the caller.
          */

          reject(error);

        });

    });

    /*
    Return BOTH

    ✔ Promise
    ✔ cancel()

    WHY?

    Keep Promise as a normal Promise.

    Don't attach custom methods

    promise.cancel()

    Returning an object keeps
    responsibilities separate.
    */

    return {

      promise,

      cancel() {

        /*
        IMPORTANT

        This DOES NOT stop

        fetch()

        or any async work.

        It only changes
        how the final result
        is handled.
        */

        canceled = true;

      }

    };

  }

  // --------------------------------------------------------------
  // SAMPLE ASYNC FUNCTIONS
  // --------------------------------------------------------------

  function delayResolve(value, ms) {

    return new Promise((resolve) => {

      setTimeout(() => {

        resolve(value);

      }, ms);

    });

  }

  function delayReject(error, ms) {

    return new Promise((_, reject) => {

      setTimeout(() => {

        reject(error);

      }, ms);

    });

  }

  // --------------------------------------------------------------
  // TEST 1
  // NORMAL RESOLUTION
  // --------------------------------------------------------------

  /*
  Expected

  Resolved: SUCCESS
  */

  const request1 = makeCancelable(

    delayResolve("SUCCESS", 1000)

  );

  request1.promise

    .then((result) => {

      console.log("Resolved:", result);

    })

    .catch((error) => {

      console.error(error);

    });

  // --------------------------------------------------------------
  // TEST 2
  // CANCEL BEFORE COMPLETION
  // --------------------------------------------------------------

  /*
  Expected

  Caught

  CanceledPromiseError

  Promise has been canceled
  */

  const request2 = makeCancelable(

    delayResolve("SHOULD NOT RESOLVE", 1000)

  );

  setTimeout(() => {

    request2.cancel();

  }, 300);

  request2.promise

    .then((result) => {

      console.log(result);

    })

    .catch((error) => {

      console.log(

        "Caught:",

        error.name,

        error.message

      );

    });



    // --------------------------------------------------------------
    // 16. EVENT EMITTER
    // --------------------------------------------------------------

    /*
    ====================================================
    WHAT IS AN EVENT EMITTER?
    ====================================================

    An Event Emitter implements the

    Publisher → Subscriber (Pub/Sub)

    design pattern.

    Publisher

    ↓

    Emits an event

    ↓

    Every subscriber listening
    to that event gets notified.

    Examples

    ✔ Button Click
    ✔ API Success
    ✔ Chat Message
    ✔ Notification
    ✔ Socket Events

    Node.js itself provides
    an EventEmitter class.
    */

    class EventEmitter {

      constructor() {

        /*
        ==================================================
        🗂 EVENT STORE
        ==================================================

        Structure

        Map {

          eventName

                ↓

          Map {

            subscriptionId

                  ↓

            callback

          }

        }

        WHY Map?

        ✔ O(1) lookup
        ✔ O(1) insertion
        ✔ O(1) deletion

        Preserves insertion order.

        Keys can be

        ✔ String
        ✔ Symbol
        ✔ Number

        Better than plain objects
        for dynamic collections.
        */

        this.events = new Map();

      }

      // --------------------------------------------------
      // SUBSCRIBE
      // --------------------------------------------------

      subscribe(eventName, callback) {

        /*
        WHY validate callback?

        Prevent runtime errors.

        Only functions
        can be executed.
        */

        if (typeof callback !== "function") {
          throw new TypeError(
            "Callback must be a function."
          );
        }

        /*
        Create a new event bucket
        if this is the first subscriber.
        */

        if (!this.events.has(eventName)) {

          this.events.set(

            eventName,

            new Map()

          );

        }

        /*
        WHY Symbol?

        Every subscription gets
        a unique identifier.

        Even identical callbacks
        receive different IDs.

        No collision risk.
        */

        const subscriptionId = Symbol(eventName);

        const subscriptions =
          this.events.get(eventName);

        subscriptions.set(
          subscriptionId,
          callback
        );

        /*
        Return an unsubscribe handle.

        WHY?

        Don't expose
        internal Maps.

        Caller only receives

        unsubscribe()

        similar to

        RxJS

        DOM events

        etc.
        */

        return {

          unsubscribe: () => {

            /*
            Calling unsubscribe()
            multiple times should NOT crash.

            Real EventEmitter
            implementations usually
            make this operation idempotent.

            delete()

            already returns

            true / false

            so we simply ignore
            repeated calls.
            */

            subscriptions.delete(
              subscriptionId
            );

            /*
            OPTIONAL CLEANUP

            Remove the event itself
            when no subscribers remain.

            Prevents empty Maps
            accumulating over time.
            */

            if (subscriptions.size === 0) {

              this.events.delete(
                eventName
              );

            }

          }

        };

      }

      // --------------------------------------------------
      // EMIT
      // --------------------------------------------------

      emit(eventName, ...args) {

        /*
        WHY use a guard clause?

        No subscribers.

        Nothing to do.

        Real EventEmitter
        implementations simply return.

        Throwing an error
        isn't necessary.
        */

        const subscriptions =
          this.events.get(eventName);

        if (!subscriptions) {

          return;

        }

        /*
        WHY spread arguments?

        Every subscriber receives

        exactly the same arguments.

        Example

        emit(

          "message",

          "Hello",

          "John"

        )

        becomes

        callback(

          "Hello",

          "John"

        )
        */

        for (const callback of subscriptions.values()) {

          callback(...args);

        }

      }

    }

    // --------------------------------------------------------------
    // TEST CASE 1
    // MULTIPLE SUBSCRIBERS
    // --------------------------------------------------------------

    const emitter1 = new EventEmitter();

    const sub1 = emitter1.subscribe("login", (user) => {
      console.log("Analytics:", user);
    });

    const sub2 = emitter1.subscribe("login", (user) => {
      console.log("Welcome:", user);
    });

    const sub3 = emitter1.subscribe("login", (user) => {
      console.log("Audit Log:", user);
    });

    console.log("----- Emit login -----");

    emitter1.emit("login", "John");

    /*
    Expected Output

    ----- Emit login -----

    Analytics: John
    Welcome: John
    Audit Log: John
    */

    // --------------------------------------------------------------
    // TEST CASE 2
    // UNSUBSCRIBE ONE LISTENER
    // --------------------------------------------------------------

    console.log("----- Remove Welcome Listener -----");

    sub2.unsubscribe();

    emitter1.emit("login", "Alice");

    /*
    Expected Output

    ----- Remove Welcome Listener -----

    Analytics: Alice
    Audit Log: Alice

    (Welcome listener is no longer called.)
    */

    // --------------------------------------------------------------
    // TEST CASE 3
    // DIFFERENT EVENTS
    // --------------------------------------------------------------

    const emitter2 = new EventEmitter();

    emitter2.subscribe("click", () => {
      console.log("Button Clicked");
    });

    emitter2.subscribe("hover", () => {
      console.log("Mouse Hover");
    });

    console.log("----- Click Event -----");
    emitter2.emit("click");

    console.log("----- Hover Event -----");
    emitter2.emit("hover");

    /*
    Expected Output

    ----- Click Event -----

    Button Clicked

    ----- Hover Event -----

    Mouse Hover
    */


    // --------------------------------------------------------------
    // TEST CASE 4
    // NO SUBSCRIBERS
    // --------------------------------------------------------------

    const emitter3 = new EventEmitter();
    console.log("Before emit");
    emitter3.emit("unknown");
    console.log("After emit");

    /*
    Expected Output

    Before emit
    After emit

    No error is thrown.
    Nothing happens.
    */



// --------------------------------------------------------------
// 17. CONVERT FLAT DATA TO TREE STRUCTURE
// --------------------------------------------------------------

/**
I was asked to build a function convertToTree to transform a flat array of folders/files 
into a nested tree structure for a recursive Sidebar component (similar to a File Explorer UI)
 */

const flatData = [
  { id: 4, parentId: 2, name: "Resume.pdf" },
  { id: 1, parentId: null, name: "Root" },
  { id: 2, parentId: 1, name: "Documents" },
  { id: 3, parentId: null, name: "Config" }
];


// EXPECTED OUTPUT
[
  {
    id: 1,
    parentId: null,
    name: "Root",
    children: [
      {
        id: 2,
        parentId: 1,
        name: "Documents",
        children: [
          {
            id: 4,
            parentId: 2,
            name: "Resume.pdf",
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 3,
    parentId: null,
    name: "Config",
    children: []
  }
]

function convertToTree(flatData) {

  /*
  ==================================================
  STEP 1

  CREATE

      id

        ↓

      node

  LOOKUP MAP
  ==================================================

  WHY Map?

  Need constant time lookup.

  id

      ↓

  Node

  Complexity

  Lookup

  O(1)

  Without Map

  We'd search the array
  every time.

  Complexity becomes

  O(n²)
  */

  const idToNode = new Map();

  /*
  Root nodes.

  These become

  Tree Entry Points.
  */

  const tree = [];

  /*
  ==================================================
  PASS 1

  CREATE EVERY NODE
  ==================================================

  WHY two passes?

  Imagine

      Child

         ↓

      Parent

  appears later
  in the array.

  If we immediately try

  parent.children.push(child)

  parent might not exist yet.

  First

  Create EVERY node.

  Second

  Connect them.

  This works regardless
  of input order.
  */

  for (const item of flatData) {

    idToNode.set(item.id, {

      ...item,

      children: []

    });

  }

  /*
  ==================================================
  PASS 2

  CONNECT PARENTS
  ==================================================
  */

  for (const item of flatData) {

    const node = idToNode.get(item.id);

    /*
    Root Node

    No parent.

    Add directly
    to the tree.
    */

    if (item.parentId === null) {

      tree.push(node);

      continue;

    }

    /*
    Child Node

    Find parent.

    Parent

      ↓

    Push child.
    */

    const parent = idToNode.get(item.parentId);

    /*
    WHY defensive check?

    Data may be invalid.

    Example

    parentId = 999

    but no node
    with id 999 exists.

    Avoids runtime errors.
    */

    if (parent) {

      parent.children.push(node);

    }

  }

  return tree;

}

const treeData = convertToTree(flatData);

console.log(treeData);


// --------------------------------------------------------------
// 18. BREADCRUMB TRAIL CONSTRUCTION
// --------------------------------------------------------------

/**
   * A breadcrumb is a UI navigation pattern that shows where the user currently is inside a hierarchical structure.
   * Why “Bottom → Top” in Code?
   * Every node knows its parent
   * No node knows all its children (for breadcrumbs)
   * So traversal is child → parent
   * “Breadcrumbs represent the path from the root to the current node. Since each node only knows its parent, the most efficient way is to traverse bottom-up and then reverse the path.”
*/

const breadCrum = [
  { id: 3, parentId: 12, title: "Headphones" },
  { id: 19, parentId: 28, title: "True wireless" },
  { id: 28, parentId: 3, title: "Wired" },
  { id: 12, parentId: null, title: "Audio" },
  { id: null, parentId: 19, title: "Bluetooth" }
];

function buildBreadcrumbTrail(data) {

  /*
  ==================================================
  STEP 1

  CREATE

      id

        ↓

      node

  LOOKUP MAP
  ==================================================

  WHY Map?

  Parent lookup

  O(1)

  Without Map

  Every lookup would scan
  the entire array.

  Complexity

  O(n²)
  */

  const idMap = new Map();

  for (const item of data) {

    /*
    This example uses

    id === null

    to represent
    the current page.

    Don't store it
    in the lookup Map.
    */

    if (item.id !== null) {

      idMap.set(item.id, item);

    }

  }

  /*
  ==================================================
  STEP 2

  FIND CURRENT NODE
  ==================================================

  NOTE

  In a real application,

  you'd usually receive

  currentId

  as a function parameter.

  This example identifies

  id === null

  as the current page.
  */

  const currentNode = data.find(

    item => item.id === null

  );

  /*
  Defensive check.

  Invalid input.
  */

  if (!currentNode) {

    return "";

  }

  /*
  ==================================================
  STEP 3

  WALK

  CURRENT

      ↓

  ROOT
  ==================================================
  */

  const path = [];

  let current = currentNode;

  while (current) {

    /*
    WHY unshift()?

    We traverse

    Bottom

      ↓

    Top

    But breadcrumbs display

    Top

      ↓

    Bottom

    unshift()

    inserts at the beginning,

    avoiding a final reverse().
    */

    path.unshift(current.title);

    if (current.parentId === null) {

      break;

    }

    current = idMap.get(

      current.parentId

    );

  }

  /*
  ==================================================
  STEP 4

  BUILD UI STRING
  ==================================================
  */

  return path.join(" > ");

}

const breadResult = buildBreadcrumbTrail(breadCrum);
console.log(breadResult); // Audio >> Headphones >> Wired >> True wireless >> Bluetooth


// --------------------------------------------------------------
// 19. CONCURRENCY CONTROL (Worker Pool Pattern)
// -------------------------------------------------------------

/**
   * You are given:
   * An array of async tasks (functions that return Promises)
   * A concurrency limit
   
  Requirements:
   * At most limit promises run at the same time
   * When any task finishes, immediately start the next pending task
   * Preserve result order (same index as input)
   * Resolve when all tasks complete

   /*
    ====================================================
    WHAT IS A WORKER POOL?
    ====================================================

    Imagine

    Limit = 2

    Tasks

    T1 T2 T3 T4 T5

    Initially

    Worker 1 → T1

    Worker 2 → T2

    When T2 finishes

    ↓

    Worker 2 immediately starts T3

    When T1 finishes

    ↓

    Worker 1 starts T4

    Workers never stay idle
    while pending tasks exist.

    This keeps maximum concurrency
    without exceeding the limit.

*/

async function runWithConcurrency(tasks, limit) {
  /*
    WHY

    new Array(tasks.length)

    instead of []

    Tasks finish in random order.

    We store each result
    at its original index.

    This preserves the input order.
  */
  // 🧺 Stores final results in input order
  const results = new Array(tasks.length);

  // 👉 Index of next task to execute
  let nextTaskIndex = 0;

  // 🧑‍🏭 Number of tasks currently running
  let activeCount = 0;
  
  /*1️⃣ Fail Fast (Abort everything on first error)
     First error → reject immediately
     Remaining tasks should:
     either be ignored
     or safely handled so they don’t throw unhandled rejections
  */
  //let hasErrored = false; // 🚨 global error flag /* TYPE 1 */

  return new Promise((resolve, reject) => {
    function runNext() {
        
         /* TYPE 1 */
        // 🛑 Stop scheduling if error already occurred
        // if (hasErrored) return;
      
      /**
       * ✅ Base case:
       * - No tasks left
       * - No running tasks
       */
      if (nextTaskIndex === tasks.length && activeCount === 0) {
        resolve(results);
        return;
      }

      /**
       * 🚦 Start tasks while:
       * - Workers are available
       * - Tasks are remaining
       */

      /*
          WHY while instead of if?

          Suppose

          Limit = 4

          Active = 0

          We should start

          4 workers

          immediately.

          An if statement
          would only start one worker.

          while fills every
          available worker slot.
       */
      while (activeCount < limit && nextTaskIndex < tasks.length) {
        /*
          WHY save currentIndex?

          nextIndex keeps changing
          as more workers start.

          Store the current task index

          before starting the async work,

          otherwise we'd lose
          the correct position.
       */
        const currentIndex = nextTaskIndex;
        const task = tasks[currentIndex];

        nextTaskIndex++;
        activeCount++;

        // ▶️ Execute task
        task()
          .then((result) => {
              /* TYPE 1 */
              // 🎯 Preserve order
             // results[currentIndex] = result;
           
           /* TYPE 2 */
            results[currentIndex] = { status: "fulfilled", value: result };
          })
          .catch(err => {
            /* TYPE 1 */
            // ❌ Fail fast
            // hasErrored = true;
            // reject(err);
            
            /* TYPE 2 */
            results[currentIndex] = { status: "rejected", reason: err};
          })
          .finally(() => {
            /*
            WHY finally()?

            Runs whether

            ✔ fulfilled

            or

            ✔ rejected

            A worker becomes free
            regardless of success
            or failure.

            Without finally,

            failed tasks might never
            release a worker.
          */
            // ⬇️ Worker freed
            activeCount--;

            // 🔁 Start next task
            runNext();
          });
      }
    }

    // 🚀 Initial kick-off
    runNext();
  });
}

function createTask(name, delay) {
  return function () {
    const value = Math.floor(Math.random() * 10);

    return new Promise((resolve, reject) => {
      console.log(`🚀 START ${name}`);

      setTimeout(() => {
        if (value < 5) {
          console.log(`❌ FAIL ${name}`);
          reject(`Error ${name}`);
        } else {
          console.log(`✅ END ${name}`);
          resolve(value * 1000);
        }
      }, delay);
    });
  };
}

const tasks = [
  createTask("Task 1", 3000),
  createTask("Task 2", 1000),
  createTask("Task 3", 2000),
  createTask("Task 4", 500),
];

/* TYPE 1: FAIL FAST */
// runWithConcurrency(tasks, 2)
//   .then((results) => {
//     console.log("🎯 FINAL RESULTS:", results);
//   })
//   .catch((err) => {
//     console.error("❌ Execution stopped due to error:", err);
//   });

/* TYPE 2: Collect All Results (allSettled style) */
runWithConcurrency(tasks, 2).then((results) => {
  console.log("🎯 FINAL RESULTS:", results);

  results.forEach((res, index) => {
    if (res.status === "fulfilled") {
      console.log(`✅ Task ${index} succeeded with`, res.value);
    } else {
      console.error(`❌ Task ${index} failed with`, res.reason);
    }
  });
});

/* FAIL FAST TYPE 1 */

// 🚀 START Task 1
// 🚀 START Task 2
// ❌ FAIL Task 2
// ERROR!
// ❌ Execution stopped due to error: Error Task 2
// ✅ END Task 1

/* COLLECT ALL RESULT TYPE 2 */

// 🚀 START Task 1
// 🚀 START Task 2
// ✅ END Task 2
// 🚀 START Task 3
// ❌ FAIL Task 1
// 🚀 START Task 4
// ✅ END Task 3
// ❌ FAIL Task 4
// 🎯 FINAL RESULTS: [
//   { status: 'rejected', reason: 'Error Task 1' },
//   { status: 'fulfilled', value: 9000 },
//   { status: 'fulfilled', value: 5000 },
//   { status: 'rejected', reason: 'Error Task 4' }
// ]
// ❌ Task 0 failed with Error Task 1
// ✅ Task 1 succeeded with 9000
// ✅ Task 2 succeeded with 5000
// ❌ Task 3 failed with Error Task 4


// --------------------------------------------------------------
// 20. TASK RUNNER 
// -------------------------------------------------------------

/**
   Design and implement an TaskRunner utility that processes asynchronous tasks with a maximum concurrency limit. The utility should ensure that at most a defined number of tasks (concurrency) are running at any given time. If more tasks are pushed into the queue when the limit is reached, they should wait until at least one running task is completed before execution
	The push method is used to add tasks (asynchronous function) to the executor. If the current number of running tasks is below the concurrency limit, the task should be executed immediately. If the number of running tasks is equal to or exceeds the concurrency limit, the task should wait until a running task finishes before starting

  Side-by-side diff (INTERVIEW GOLD)
  Aspect:	          Worker Pool	            TaskRunner
  Task source:	    Fixed array	            Dynamic (push)
  Execution:        One-time	              Continuous
  Return value:	    Promise of results	    Fire-and-forget
  Order guarantee:	Required	              Not required
  Lifecycle:	      Ends automatically	    Needs onIdle()
  Queue size:	      Implicit	              Explicit
  Backpressure:	    Rare	                  Important
  Real-world use:  	Batch jobs	            Systems / pipelines
*/

class TaskRunner {

  constructor(concurrency, options = {}) {

    /*
    ==================================================
    MAXIMUM CONCURRENCY
    ==================================================

    Maximum number of tasks
    allowed to run simultaneously.

    Example

    concurrency = 2

    Worker 1

    Worker 2

    Any additional tasks

    wait in the queue.
    */

    this.concurrency = concurrency;

    /*
    ==================================================
    ACTIVE WORKERS
    ==================================================

    Number of tasks currently running.

    WHY track this?

    Prevent starting more than

    concurrency

    tasks at the same time.
    */

    this.activeWorkers = 0;

    /*
    ==================================================
    WAITING QUEUE
    ==================================================

    Stores pending tasks.

    WHY queue?

    Suppose

    Concurrency = 2

    Push

    T1
    T2
    T3
    T4

    Only

    T1

    T2

    start immediately.

    T3

    T4

    wait here until
    a worker becomes free.
    */

    this.queue = [];

    /*
    ==================================================
    BACKPRESSURE
    ==================================================

    Prevent unlimited queue growth.

    Example

    Producer

    pushes

    100000 tasks

    Workers

    can only process

    100 tasks.

    Without limits,

    memory usage grows forever.
    */

    this.maxQueueSize =
      options.maxQueueSize ?? Infinity;

    /*
    Used by

    onIdle()

    to notify callers
    when every task
    has finished.
    */

    this.idleResolvers = [];

  }

  // --------------------------------------------------
  // PUSH
  // --------------------------------------------------

  async push(task) {

    /*
    WHY queue limit?

    Prevent memory explosion
    when producers generate
    tasks faster than
    workers can execute them.
    */

    if (this.queue.length >= this.maxQueueSize) {

      throw new Error("Queue overflow");

    }

    /*
    Worker available?

    Start immediately.

    Otherwise

    place the task
    in the waiting queue.
    */

    if (this.activeWorkers < this.concurrency) {

      this.execute(task);

    } else {

      this.queue.push(task);

    }

  }

  // --------------------------------------------------
  // EXECUTE
  // --------------------------------------------------

  async execute(task) {

    /*
    Reserve a worker.
    */

    this.activeWorkers++;

    try {

      /*
      Execute async work.

      TaskRunner is

      fire-and-forget.

      We don't return
      the task result here.
      */

      await task();

    } catch (err) {

      /*
      WHY catch errors?

      One failed task

      should NOT stop

      the remaining queue.

      Otherwise

      one bad task

      blocks every future task.
      */

      console.error("Task failed:", err);

    } finally {

      /*
      WHY finally?

      Runs whether

      ✔ success

      ✔ failure

      Every completed task

      frees one worker.

      Without finally,

      failed tasks could
      permanently reduce
      available concurrency.
      */

      this.activeWorkers--;

      /*
      Start another task
      if one is waiting.
      */

      this.scheduleNext();

      /*
      Idle means

      ✔ No running workers

      ✔ Queue empty

      Notify everyone waiting
      for completion.
      */

      if (

        this.activeWorkers === 0 &&

        this.queue.length === 0

      ) {

        this.resolveIdle();

      }

    }

  }

  // --------------------------------------------------
  // SCHEDULE NEXT TASK
  // --------------------------------------------------

  scheduleNext() {

    /*
    WHY FIFO?

    Queue follows

    First In

    First Out.

    The oldest waiting task

    executes first.
    */

    if (

      this.queue.length > 0 &&

      this.activeWorkers < this.concurrency

    ) {

      const nextTask = this.queue.shift();

      this.execute(nextTask);

    }

  }

  // --------------------------------------------------
  // ON IDLE
  // --------------------------------------------------

  onIdle() {

    /*
    WHAT does idle mean?

    No running workers

    AND

    Queue is empty.

    Only then

    all work has completed.
    */

    if (

      this.activeWorkers === 0 &&

      this.queue.length === 0

    ) {

      return Promise.resolve();

    }

    /*
    Otherwise

    save the resolver.

    It'll be called later
    when the runner
    becomes idle.
    */

    return new Promise(resolve => {

      this.idleResolvers.push(resolve);

    });

  }

  // --------------------------------------------------
  // RESOLVE IDLE WAITERS
  // --------------------------------------------------

  resolveIdle() {

    /*
    Multiple callers
    may be awaiting

    onIdle().

    Notify all of them.
    */

    while (this.idleResolvers.length > 0) {

      const resolve =
        this.idleResolvers.shift();

      resolve();

    }

  }

}

// Helper: delay for given ms
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create async tasks with name + duration
function createTask(name, duration, shouldFail = false) {
  return async () => {
    console.log(`⏳ Starting ${name}`);
    await delay(duration);

    if (shouldFail) {
      throw new Error(`${name} failed`);
    }

    console.log(`✅ Finished ${name}`);
  };
}

const runner = new TaskRunner(2, {
  maxQueueSize: 10
});

runner.push(createTask("T1", 1000));
runner.push(createTask("T2", 500));
runner.push(createTask("T3", 300));
runner.push(createTask("T4", 400, true)); // intentionally fail
runner.push(createTask("T5", 600));

runner.onIdle().then(() => {
  console.log("🎉 All tasks completed");
});

/*
⏳ Starting T1
⏳ Starting T2
✅ Finished T2
⏳ Starting T3
✅ Finished T3
⏳ Starting T4
✅ Finished T1
⏳ Starting T5
ERROR!
Task failed: Error: T4 failed
    at /tmp/xJIKfwjyG6/main.js:95:13
    at async TaskRunner.execute (/tmp/xJIKfwjyG6/main.js:35:7)
✅ Finished T5
🎉 All tasks completed
*/


// --------------------------------------------------------------
// 21. KLARNA MASKIFY 
// -------------------------------------------------------------

/**
 * Given a card number (string or number), mask all digits except:
 -  the first character
 -  the last 4 characters
   Non-digit characters (spaces, hyphens, symbols) should remain unchanged.
*/

function maskify(cardNumber) {
  // 🔹 Convert input to string
  // WHY: card numbers may come as numbers, but string ops are safer
  const str = String(cardNumber);

  // 🔹 If length is 4 or less, nothing to mask
  // WHY: Klarna rule — last 4 characters remain visible
  if (str.length <= 4) {
    return str;
  }

  // 🔹 Store first character separately
  // WHY: This variant keeps the first character unmasked
  const firstChar = str[0];

  // 🔹 Store last 4 characters
  // WHY: Sensitive data masking rule
  const lastFour = str.slice(-4);

  // 🔹 This will hold the masked middle portion
  let maskedMiddle = "";

  // 🔹 Loop through the middle section only
  // Start → index 1 (after first char)
  // End   → length - 4 (before last 4 chars)
  for (let i = 1; i < str.length - 4; i++) {
    // 🔸 If the character is a digit (0–9)
    // WHY: Only digits are sensitive and should be masked
    if (str[i] >= "0" && str[i] <= "9") {
      maskedMiddle += "#";
    } else {
      // 🔸 Keep non-digit characters unchanged
      // WHY: Preserve formatting like "-", spaces, symbols
      maskedMiddle += str[i];
    }
  }

  // 🔹 Combine all parts:
  // first character + masked middle + last 4 characters
  return firstChar + maskedMiddle + lastFour;
}

console.log(maskify("51234567893773"));
// "5##########3773"

console.log(maskify("4444-5555-6666-2222"));
// "4###-####-####-2222"

console.log(maskify(""));
// ""

console.log(maskify("DevTools Tech"));
// "DevTools Tech"

console.log(maskify("Sk#ip#p$5k4y"));
// "S#k#ip#p$#k4y"


// --------------------------------------------------------------
// 22. MAP LIMIT
// --------------------------------------------------------------

/*
====================================================
WHAT IS mapLimit()?
====================================================

mapLimit()

behaves like

Array.map()

except

it limits

how many async operations

run simultaneously.

Example

Inputs

[1, 2, 3, 4, 5]

Concurrency = 2

Initially

Worker 1 → 1

Worker 2 → 2

↓

When Worker 2 finishes

↓

Worker 2 → 3

↓

When Worker 1 finishes

↓

Worker 1 → 4

...

Until every value
has been processed.

====================================================

Worker Pool

↓

Executes

Functions

(() => Promise)

mapLimit

↓

Converts

Values

↓

Functions

↓

Delegates execution
to Worker Pool.

So

mapLimit

is simply

a value-to-task adapter.

====================================================
*/


// --------------------------------------------------------------
// WORKER POOL
// --------------------------------------------------------------

async function runWithConcurrency(tasks, limit) {

  /*
  WHY preallocate?

  Tasks finish
  in random order.

  Store every result

  at its original index

  to preserve

  input order.
  */

  const results = new Array(tasks.length);

  /*
  Next task
  waiting to start.
  */

  let nextIndex = 0;

  /*
  Currently running workers.
  */

  let activeWorkers = 0;

  return new Promise((resolve) => {

    function runNext() {

      /*
      No waiting tasks.

      No active workers.

      Everything finished.
      */

      if (

        nextIndex === tasks.length &&

        activeWorkers === 0

      ) {

        resolve(results);

        return;

      }

      /*
      WHY while?

      Fill EVERY available worker.

      Example

      limit = 4

      Active = 0

      We should immediately
      start

      four tasks.

      An if statement

      would only start one.
      */

      while (

        activeWorkers < limit &&

        nextIndex < tasks.length

      ) {

        /*
        WHY save currentIndex?

        nextIndex changes

        as new workers start.

        Save it now

        so we know where
        this task's result belongs.
        */

        const currentIndex = nextIndex;

        const task = tasks[currentIndex];

        nextIndex++;

        activeWorkers++;

        task()

          .then((value) => {

            results[currentIndex] = {

              status: "fulfilled",

              value

            };

          })

          .catch((error) => {

            /*
            Similar to

            Promise.allSettled()

            Store failure

            instead of rejecting
            the whole execution.
            */

            results[currentIndex] = {

              status: "rejected",

              reason: error

            };

          })

          .finally(() => {

            /*
            WHY finally()?

            Runs whether

            ✔ fulfilled

            ✔ rejected

            A worker becomes free

            regardless of success
            or failure.
            */

            activeWorkers--;

            runNext();

          });

      }

    }

    runNext();

  });

}



// --------------------------------------------------------------
// MAP LIMIT
// --------------------------------------------------------------

function mapLimit(

  inputs,

  limit,

  mapper,

  done

) {

  /*
  STEP 1

  Convert

  Values

      ↓

  Async Tasks

  WHY?

  Worker Pool knows
  how to execute

  functions.

  It doesn't know
  anything about values.
  */

  const tasks = inputs.map(

    value =>

      () => mapper(value)

  );

  /*
  STEP 2

  Delegate execution.

  mapLimit()

  doesn't implement
  concurrency.

  Worker Pool does.
  */

  runWithConcurrency(

    tasks,

    limit

  )

    .then(results => {

      done(

        null,

        results

      );

    })

    .catch(error => {

      /*
      Normally won't happen

      because Worker Pool

      collects errors

      similar to

      Promise.allSettled().

      Added for safety.
      */

      done(error);

    });

}


    // inputs

    // [1, 2, 3, 4, 5]

    //         │
    //         ▼

    // mapper(value)

    //         │

    // 1 → Promise
    // 2 → Promise
    // 3 → Promise
    // 4 → Promise
    // 5 → Promise

    //         │

    // Convert into lazy tasks

    // () => mapper(1)
    // () => mapper(2)
    // () => mapper(3)
    // () => mapper(4)
    // () => mapper(5)

    //         │

    // Worker Pool

    // (concurrency = 2)

    //         │
    // Runs only two tasks at a time    

    // "mapLimit doesn't know what operation to perform on each input. The mapper callback defines the asynchronous work for each value. We wrap it as () => mapper(value) so the work is lazy—it doesn't start until the worker pool schedules it. If we created the Promises immediately, the concurrency limit would be ineffective because all async operations would already be running."


function mapper(x) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 START ${x}`);
    setTimeout(() => {
      if (x === 3) {
        reject(`Error at ${x}`);
      } else {
        console.log(`✅ END ${x}`);
        resolve(x * 2);
      }
    }, 1000);
  });
}

const inputs = [1, 2, 3, 4, 5];

mapLimit(inputs, 2, mapper, (err, results) => {
  if (err) {
    console.error("❌ Error:", err);
  } else {
    console.log("🎯 Results:", results);
  }
});

// OUTPUT
// 🚀 START 1
// 🚀 START 2
// ✅ END 1
// 🚀 START 3
// ✅ END 2
// 🚀 START 4
// 🚀 START 5
// ✅ END 4
// ✅ END 5
// ERROR!
// 🎯 Results: [
//   { status: 'fulfilled', value: 2 },
//   { status: 'fulfilled', value: 4 },
//   { status: 'rejected', error: 'Error at 3' },
//   { status: 'fulfilled', value: 8 },
//   { status: 'fulfilled', value: 10 }
// ]



// --------------------------------------------------------------
 /* 23. Given a 2D array of [name, marks]:
      // 1️⃣ Group marks by name
     // 2️⃣ Compute average per name
     // 3️⃣ Return the maximum average 
*/
// -------------------------------------------------------------

function processData(data) {
  /**
   * 🛑 EDGE CASE #1
   * If input is empty, no students exist
   * Returning 0 (or -Infinity depending on requirement)
   */
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  // =====================================================
  // 1️⃣ GROUP MARKS BY NAME
  // =====================================================
  /**
   * We convert:
   * [
   *   ["Alice", 80],
   *   ["Bob", 90],
   *   ["Alice", 100]
   * ]
   *
   * Into:
   * {
   *   Alice: [80, 100],
   *   Bob: [90]
   * }
   */
  const grouped = data.reduce((acc, pair) => {
    /**
     * 🧠 Destructuring improves readability
     * pair = ["Alice", 80]
     */
    const [name, mark] = pair;

    /**
     * 🛑 EDGE CASE #2
     * Ignore invalid entries
     * - missing name
     * - non-number marks
     */
    if (typeof name !== "string" || typeof mark !== "number") {
      return acc;
    }

    /**
     * If this is the first time we see the name,
     * initialize an empty array
     */
    if (!acc[name]) {
      acc[name] = [];
    }

    /**
     * Push the current mark into that student's list
     */
    acc[name].push(mark);

    return acc;
  }, {}); // initial accumulator is an empty object
  
    console.log("STEP 1 - Grouped:", grouped);

  // =====================================================
  // 2️⃣ COMPUTE AVERAGE PER NAME
  // =====================================================
  /**
   * Convert grouped object into an array:
   * { Alice: [80, 100] }
   * →
   * [ ["Alice", [80, 100]] ]
   */
  const averages = Object.entries(grouped).map(([name, marks]) => {
    /**
     * Sum all marks for this student
     */
    const total = marks.reduce((sum, value) => {
      return sum + value;
    }, 0);

    /**
     * Average = total marks / number of subjects
     * marks.length is safe because empty arrays never occur
     */
    const avg = total / marks.length;

    return [name, avg];
  });
  console.log("STEP 2 - Averages:", averages);
  
  // =====================================================
  // 3️⃣ FIND MAXIMUM AVERAGE
  // =====================================================
  /**
   * Extract only the average values
   * [ ["Alice", 90], ["Bob", 80] ] → [90, 80]
   */
  const maxAverage = Math.max(
    ...averages.map(([, avg]) => avg)
  );
  console.log("STEP 3 - Max Average:", maxAverage);
  return maxAverage;
}

const dataRecord = [
  ["Alice", 80],
  ["Bob", 90],
  ["Alice", 100],
  ["Bob", 70],
];

console.log(processData(dataRecord)); 
// STEP 1 - Grouped: { Alice: [ 80, 100 ], Bob: [ 90, 70 ] }
// STEP 2 - Averages: [ [ 'Alice', 90 ], [ 'Bob', 80 ] ]
// STEP 3 - Max Average: 90
// 90


// --------------------------------------------------------------
   // 24. GENERATE SUM
   /**
    * Implement a function generateSum(n) such that:
      1️⃣ It allows exactly n chained calls
      2️⃣ Each call receives one number
      3️⃣ After the nth call, it returns the sum of all numbers
    */
// -------------------------------------------------------------

// APPROACH 1 USING CLOSURE
function generateSum(n) {
  /**
   * 🧠 `count` tracks how many times function is called
   * 🧠 `total` stores cumulative sum
   * These values persist due to closure
   */
  let count = 0;
  let total = 0;

  /**
   * This inner function is returned and called repeatedly
   */
  function inner(value) {
    count++;
    total += value;

    /**
     * 🛑 BASE CONDITION
     * Once called `n` times, return final sum
     */
    if (count === n) {
      return total;
    }

    /**
     * Otherwise, return the same function
     * → enables chaining: fn(1)(2)(3)...
     */
    return inner;
  }

  return inner;
}


// APPROACH 2 USING THIS AND BIND

function generateSum(n) {
  /**
   * State object that will be bound as `this`
   */
  const context = {
    limit: n,
    count: 0,
    total: 0,
  };

  function inner(value) {
    this.count++;
    this.total += value;

    /**
     * When enough calls are made → return sum
     */
    if (this.count === this.limit) {
      return this.total;
    }

    /**
     * Bind `this` again so chaining continues
     */
    return inner.bind(this);
  }

  // Initial bind
  return inner.bind(context);
}

const sum = generateSum(4);
console.log(sum(1)(2)(3)(4)); // 10

// Yes. Each call to bind creates a new function reference.
// call executes the function immediately, whereas bind returns a new function reference required for chaining.
//What bind does:
// Creates a new function
// Permanently attaches (locks) this
// Returns a function that remembers the same context


// --------------------------------------------------------------
// 25. STORE CLASS
// --------------------------------------------------------------

    /*
    ====================================================
    INTERVIEW QUESTION
    ====================================================

    Design a Store class that supports:

    1️⃣ subscribe(key, onUpdate, onCleanup)

    Subscribe to changes for a specific key.

    onUpdate(value)

    Called whenever the value changes.

    onCleanup()

    Called when this subscription
    is removed.

    Must return a cleanup function
    that unsubscribes ONLY
    this subscriber.

    ----------------------------------------------------

    2️⃣ save(key, value)

    Save a value.

    Immediately notify every
    subscriber of that key.

    ----------------------------------------------------

    3️⃣ remove(key)

    Remove the key completely.

    Delete its stored value

    AND

    clean up every subscriber.

    ====================================================


    WHAT IS A STORE?

    A Store is a centralized place
    to keep application state.

    Instead of components asking

    "Has the value changed?"

    the Store automatically pushes
    updates to subscribers.

    This is an example of the

    Observer Pattern

    Publisher

    ↓

    Subscribers

    Examples

    ✔ Redux

    ✔ Zustand

    ✔ MobX

    ✔ Vuex

    ✔ Pinia

    ====================================================
    */

    class Store {

      constructor() {

        /*
        ==================================================
        STORE DATA
        ==================================================

        key

            ↓

        latest value

        WHY Map?

        O(1)

        lookup

        insert

        delete
        */

        this.data = new Map();

        /*
        ==================================================
        SUBSCRIBERS
        ==================================================

        Structure

        key

            ↓

        Set

            ↓

        {
          onUpdate,
          onCleanup
        }

        WHY Map?

        Quickly find
        subscribers
        for one key.

        WHY Set?

        ✔ O(1) add

        ✔ O(1) delete

        ✔ Prevents duplicate
          subscriber references.
        */

        this.subscribers = new Map();

      }

      // --------------------------------------------------
      // SUBSCRIBE
      // --------------------------------------------------

      subscribe(

        key,

        onUpdate,

        onCleanup

      ) {

        /*
        Defensive programming.

        Avoid runtime errors later
        during notifications.
        */

        if (typeof onUpdate !== "function") {

          throw new TypeError(

            "onUpdate must be a function."

          );

        }

        /*
        First subscriber
        for this key?

        Create a Set.
        */

        if (!this.subscribers.has(key)) {

          this.subscribers.set(

            key,

            new Set()

          );

        }

        /*
        WHY wrap callbacks
        into one object?

        Makes it easy
        to remove

        THIS

        subscriber later.
        */

        const subscriber = {

          onUpdate,

          onCleanup

        };

        this.subscribers
          .get(key)
          .add(subscriber);

        /*
        WHY immediately notify?

        Example

        save("user", John)

        happened BEFORE

        subscribe()

        A new subscriber should
        immediately receive

        John

        Otherwise

        the UI starts with
        stale data.
        */

        if (this.data.has(key)) {

          onUpdate(

            this.data.get(key)

          );

        }

        /*
        Return cleanup function.

        IMPORTANT

        Removes ONLY

        this subscriber.

        Other subscribers
        continue receiving updates.
        */

        return () => {

          const subs =

            this.subscribers.get(key);

          if (!subs) return;

          subs.delete(subscriber);

          /*
          Notify cleanup.
          */

          try {

            onCleanup?.();

          } catch (err) {

            console.error(

              "Cleanup error:",

              err

            );

          }

          /*
          Memory optimization.

          Remove empty Sets.

          Prevent unused keys
          from staying in memory.
          */

          if (subs.size === 0) {

            this.subscribers.delete(key);

          }

        };

      }

      // --------------------------------------------------
      // SAVE
      // --------------------------------------------------

      save(key, value) {

        /*
        Store latest value.
        */

        this.data.set(

          key,

          value

        );

        const subs =

          this.subscribers.get(key);

        /*
        Nobody listening.

        Nothing else to do.
        */

        if (!subs) return;

        /*
        Notify every subscriber.

        WHY try/catch?

        One subscriber crashing

        should NOT stop

        other subscribers
        from receiving updates.
        */

        subs.forEach(

          ({ onUpdate }) => {

            try {

              onUpdate(value);

            } catch (err) {

              console.error(

                "Subscriber error:",

                err

              );

            }

          }

        );

      }

      // --------------------------------------------------
      // REMOVE
      // --------------------------------------------------

      remove(key) {

        /*
        Remove stored value.
        */

        this.data.delete(key);

        const subs =

          this.subscribers.get(key);

        if (!subs) return;

        /*
        WHY cleanup?

        Components may need
        to release resources.

        Example

        Remove timers

        Remove sockets

        Remove DOM listeners
        */

        subs.forEach(

          ({ onCleanup }) => {

            try {

              onCleanup?.();

            } catch (err) {

              console.error(

                "Cleanup error:",

                err

              );

            }

          }

        );

        /*
        Remove every subscriber
        for this key.
        */

        this.subscribers.delete(key);

      }

    }

    /*
    ====================================================

    TEST CASE 1

    Basic subscribe

    ====================================================
    */

    const store = new Store();

    const unsubscribe = store.subscribe(

      "user",

      value => {

        console.log(

          "🔄 User updated:",

          value

        );

      },

      () => {

        console.log(

          "🧹 User subscription cleaned"

        );

      }

    );

    store.save(

      "user",

      {

        name: "Sumeeth",

        age: 25

      }

    );

    // 🔄 User updated...

    unsubscribe();

    // 🧹 User subscription cleaned

    store.save(

      "user",

      {

        name: "Updated"

      }

    );

    // No update



    /*
    ====================================================

    TEST CASE 2

    Multiple subscribers

    ====================================================
    */

    const removeOne = store.subscribe(

      "theme",

      value =>

        console.log(

          "🎨 Component A:",

          value

        ),

      () =>

        console.log(

          "🧹 Component A removed"

        )

    );

    store.subscribe(

      "theme",

      value =>

        console.log(

          "🎨 Component B:",

          value

        ),

      () =>

        console.log(

          "🧹 Component B removed"

        )

    );

    store.save(

      "theme",

      "Dark"

    /*

    Both subscribers receive

    Dark

    */

    );

    removeOne();

    store.save(

      "theme",

      "Light"

    /*

    Only Component B

    receives update.

    */

    );



    /*
    ====================================================

    TEST CASE 3

    Late subscription

    ====================================================
    */

    store.save(

      "language",

      "JavaScript"

    );

    store.subscribe(

      "language",

      value =>

        console.log(

          "📘 Current:",

          value

        )

    );

    /*

    Immediately prints

    JavaScript

    WHY?

    Because the Store
    already had the value.

    */



    /*
    ====================================================

    TEST CASE 4

    remove()

    ====================================================
    */

    store.subscribe(

      "session",

      value =>

        console.log(

          "Session:",

          value

        ),

      () =>

        console.log(

          "Session cleaned"

        )

    );

    store.save(

      "session",

      "Active"

    );

    store.remove(

      "session"

    );

    /*

    Cleanup runs.

    Future saves

    won't notify anyone.

    */

    store.save(

      "session",

      "New Session"

    );


    // --------------------------------------------------------------
    // 26. UBER DRIVER (CHAINABLE CLASS)
    // --------------------------------------------------------------

    /*
    ====================================================

    INTERVIEW QUESTION

    ====================================================

    Design a chainable JavaScript class
    UberDriver with methods:

    ✔ pick(name, location)

    ✔ drive(minutes)

    ✔ drop()

    ✔ rest(minutes)

    ✔ coffeeBreak(minutes)

    ✔ status()

    Requirements

    1.

    Methods should be chainable.

    driver
      .pick(...)
      .drive(...)
      .drop()

    2.

    Execution order matters.

    3.

    Some operations are asynchronous.

    4.

    coffeeBreak()

    must ALWAYS execute before
    every normal task.

    ====================================================

    WHY USE A QUEUE?

    If every method executed immediately,

    driver
        .pick()
        .drive()
        .drop()

    would start running
    while chaining is still happening.

    Instead,

    every method

    ADDS

    a task into a queue.

    Only after chaining finishes

    do we execute the queue.

    This is exactly how

    Promise chains

    middleware

    and command queues

    work.

    ====================================================
    */

    class UberDriver {

      constructor() {

        /*
        ==================================================
        NORMAL TASKS
        ==================================================

        Stores actions in

        FIFO

        order.

        Example

        pick

        drive

        drop

        */

        this.queue = [];

        /*
        ==================================================
        PRIORITY TASKS
        ==================================================

        Some operations

        must execute before

        every normal task.

        Example

        coffeeBreak()

        So we maintain

        a separate queue.
        */

        this.priorityQueue = [];

        /*
        Driver state.
        */

        this.currentPassenger = null;

        this.location = null;

        /*
        WHY Promise.resolve()?

        It delays execution

        until the current
        synchronous code finishes.

        Example

        new UberDriver()

          .pick()

          .drive()

          .drop()

        Constructor executes first.

        All chained methods

        finish adding tasks.

        THEN

        run() starts.

        Without this,

        run()

        would execute immediately

        before the chain completes.
        */

        Promise.resolve()

          .then(() => this.run());

      }

      // --------------------------------------------------
      // EXECUTE QUEUES
      // --------------------------------------------------

      async run() {

        /*
        Execute every

        priority task

        first.
        */

        for (const task of this.priorityQueue) {

          await task();

        }

        /*
        Then execute

        normal tasks

        in insertion order.
        */

        for (const task of this.queue) {

          await task();

        }

      }

      // --------------------------------------------------
      // DELAY
      // --------------------------------------------------

      delay(seconds) {

        /*
        Helper used by

        drive()

        rest()

        coffeeBreak()
        */

        return new Promise(resolve =>

          setTimeout(

            resolve,

            seconds * 1000

          )

        );

      }

      // --------------------------------------------------
      // PICK
      // --------------------------------------------------

      pick(name, location) {

        this.queue.push(async () => {

          /*
          Driver already busy?
          */

          if (this.currentPassenger) {

            console.log(

              `❌ Already driving ${this.currentPassenger}`

            );

            return;

          }

          this.currentPassenger = name;

          this.location = location;

          console.log(

            `🚕 Picked up ${name} at location ${location}`

          );

        });

        /*
        WHY return this?

        Enables chaining.

        driver

          .pick()

          .drive()

          .drop()
        */

        return this;

      }

      // --------------------------------------------------
      // DRIVE
      // --------------------------------------------------

      drive(minutes) {

        this.queue.push(async () => {

          if (!this.currentPassenger) {

            console.log(

              "⚠️ No passenger to drive"

            );

            return;

          }

          console.log(

            `🚗 Driving ${this.currentPassenger} for ${minutes} minutes`

          );

          await this.delay(minutes);

        });

        return this;

      }

      // --------------------------------------------------
      // STATUS
      // --------------------------------------------------

      status() {

        this.queue.push(async () => {

          if (this.currentPassenger) {

            console.log(

              `📊 On trip with ${this.currentPassenger}`

            );

          } else {

            console.log(

              "📊 Driver is idle"

            );

          }

        });

        return this;

      }

      // --------------------------------------------------
      // DROP
      // --------------------------------------------------

      drop() {

        this.queue.push(async () => {

          if (!this.currentPassenger) {

            console.log(

              "⚠️ No passenger to drop"

            );

            return;

          }

          console.log(

            `📍 Dropped ${this.currentPassenger}`

          );

          this.currentPassenger = null;

          this.location = null;

        });

        return this;

      }

      // --------------------------------------------------
      // REST
      // --------------------------------------------------

      rest(minutes) {

        this.queue.push(async () => {

          console.log(

            `😴 Resting for ${minutes} minutes`

          );

          await this.delay(minutes);

        });

        return this;

      }

      // --------------------------------------------------
      // PRIORITY TASK
      // --------------------------------------------------

      coffeeBreak(minutes) {

        /*
        WHY separate queue?

        Requirement says

        coffeeBreak()

        must always execute

        before

        normal tasks.

        */

        this.priorityQueue.push(async () => {

          console.log(

            `☕ Coffee break for ${minutes} minutes`

          );

          await this.delay(minutes);

        });

        return this;

      }

    }

    /*
    ====================================================

    TEST CASE 1

    ====================================================
    */

    new UberDriver()

      .pick("Alice", 1)

      .status()

      .drive(2)

      .drop()

      .status()

      .pick("Bob", 2)

      .coffeeBreak(1)

      .drive(1)

      .drop();


    /*
    Expected

    "☕ Coffee break for 1 minutes"
    "🚕 Picked up Alice at location 1"
    "📊 On trip with Alice"
    "🚗 Driving Alice for 2 minutes"
    "📍 Dropped Alice"
    "📊 Driver is idle"
    "🚕 Picked up Bob at location 2"
    "🚗 Driving Bob for 1 minutes"
    "📍 Dropped Bob"
    */


    /*
    ====================================================

    TEST CASE 2

    Driver already busy

    ====================================================
    */

    new UberDriver()

      .pick("Alice", 1)

      .pick("Bob", 2)

      .drop();

    /*

    "🚕 Picked up Alice at location 1"
    "❌ Already driving Alice"
    "📍 Dropped Alice"

    */


    /*
    ====================================================

    TEST CASE 3

    Drive without passenger

    ====================================================
    */

    new UberDriver()

      .drive(2)

      .drop();

    /*

    ⚠️ No passenger to drive
    ⚠️ No passenger to drop

    */

// --------------------------------------------------------------
   // 26. CUSTOM JSON.STRINGIFY()
   /**
    Why WeakSet?
      Doesn't prevent garbage collection
      Used for tracking object references
// -------------------------------------------------------------

/**
 * 🧠 Custom JSON.stringify implementation
 * @param {*} value
 * @returns {string|undefined}
 */
function myStringify(value, seen = new WeakSet()) {
    
     if (value && typeof value === "object") {
        if (seen.has(value)) {
          throw new TypeError("Converting circular structure to JSON");
        }
        seen.add(value);
     }

  /**
   * 1️⃣ Handle primitive types first
   */

  // null is special (typeof null === "object")
  if (value === null) {
    return "null";
  }

  // String → wrap in double quotes
  if (typeof value === "string") {
    return `"${value}"`;
  }

  // Number → convert directly
  if (typeof value === "number") {
    // JSON.stringify converts NaN & Infinity to null
    if (!isFinite(value)) return "null";
    return String(value);
  }

  // Boolean
  if (typeof value === "boolean") {
    return String(value);
  }

  // undefined, function, symbol at root → return undefined
  if (
    typeof value === "undefined" ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    return undefined;
  }

  /**
   * 2️⃣ Handle Arrays
   */
  if (Array.isArray(value)) {

    /**
     * JSON behavior:
     * undefined / function inside array → becomes null
     *
     * Example:
     * JSON.stringify([1, undefined, 3])
     * → "[1,null,3]"
     */

    const result = value.map((item) => {
      const serialized = myStringify(item, seen);
      return serialized === undefined ? "null" : serialized;
    });

    return `[${result.join(",")}]`;
  }

  /**
   * 3️⃣ Handle Objects
   */
  if (typeof value === "object") {

    const keys = Object.keys(value); // only enumerable keys
    const result = [];

    for (let key of keys) {

      const serializedValue = myStringify(value[key], seen);

      /**
       * JSON behavior:
       * Skip keys where value is:
       * - undefined
       * - function
       * - symbol
       */
      if (serializedValue !== undefined) {

        // Key must always be string-wrapped
        result.push(
          `"${key}":${serializedValue}`
        );
      }
    }

    return `{${result.join(",")}}`;
  }
}

console.log(myStringify("hello"));
// "hello"

console.log(myStringify(123));
// 123

console.log(myStringify([1, undefined, 3]));
// [1,null,3]


const obj = {
  name: "Sumeeth",
  age: 25,
  test: undefined,
};

// obj.self = obj;

try {
  console.log(myStringify(obj));  // {"name":"Sumeeth","age":25}
} catch (e) {
  console.error(e.message);
}



// --------------------------------------------------------------
// 27. DAG TASK SCHEDULER
// (Topological Sort + Cycle Detection + Concurrency)
// --------------------------------------------------------------

/*
====================================================

INTERVIEW QUESTION

====================================================

Given a graph where

Nodes

↓

Async Tasks

Edges

↓

Dependencies

Execute every task such that

✔ Dependencies execute first

✔ Detect cycles

✔ Run independent tasks in parallel

✔ Respect a concurrency limit

====================================================

WHY TOPOLOGICAL SORT?

Suppose

A

↓

B

↓

C

C

cannot execute before

B

B

cannot execute before

A

Topological Sort gives

a valid execution order

for a DAG

(Directed Acyclic Graph).

====================================================
*/


// --------------------------------------------------
// Simulated async work
// --------------------------------------------------

function delay(ms) {

  return new Promise(resolve =>

    setTimeout(resolve, ms)

  );

}


// --------------------------------------------------
// TOPOLOGICAL SORT
// (DFS + Cycle Detection)
// --------------------------------------------------

function resolveDependenciesWithCycleDetection(graph) {

  /*
  All task ids.
  */

  const nodes = Object.keys(graph);

  /*
  Already processed.

  Never visit again.
  */

  const visited = new Set();

  /*
  Current DFS path.

  Visiting the same node again

  means

  Cycle.
  */

  const visiting = new Set();

  /*
  DFS finishes children first.

  Produces

  Reverse Topological Order.
  */

  const topoOrder = [];

  function dfs(node) {

    /*
    Defensive check.

    Missing dependency.
    */

    if (!graph[node]) {

      throw new Error(

        `Unknown task: ${node}`

      );

    }

    /*
    Visiting again

    inside current recursion

    means

    Cycle.

    Example

    A

    ↓

    B

    ↓

    C

    ↓

    A
    */

    if (visiting.has(node)) {

      throw new Error(

        `Cycle detected at ${node}`

      );

    }

    /*
    Already processed.

    Skip.
    */

    if (visited.has(node)) {

      return;

    }

    visited.add(node);

    visiting.add(node);

    /*
    Process dependencies first.
    */

    const dependencies =

      graph[node].dependency ?? [];

    for (const dep of dependencies) {

      dfs(dep);

    }

    /*
    Leaving recursion.

    Remove from current path.
    */

    visiting.delete(node);

    /*
    WHY push here?

    DFS pushes AFTER

    dependencies finish.

    Produces

    Reverse Topological Order.
    */

    topoOrder.push(node);

  }

  for (const node of nodes) {

    if (!visited.has(node)) {

      dfs(node);

    }

  }

  /*
  WHY reverse?

  DFS produced

  Reverse Topological Order.

  Reverse it

  to obtain

  Dependency

      ↓

  Dependent

  execution order.

  Example

  DFS

  D

  B

  A

  Reverse

  A

  B

  D
  */

  return topoOrder.reverse();

}


// --------------------------------------------------
// TASK EXECUTOR
// --------------------------------------------------

function executeTasksInParallel(

  order,

  graph,

  limit = 2

) {

  /*
  Running workers.
  */

  let activeWorkers = 0;

  /*
  Finished tasks.
  */

  const completed = new Set();

  /*
  Tasks waiting to execute.

  WHY Set?

  O(1)

  add

  delete

  lookup.
  */

  const pending = new Set(order);

  return new Promise(resolve => {

    /*
    --------------------------------------
    Can this task execute?
    --------------------------------------

    Every dependency

    must already

    be completed.
    */

    function canRun(taskId) {

      return (

        graph[taskId].dependency ?? []

      ).every(dep =>

        completed.has(dep)

      );

    }

    /*
    --------------------------------------
    Scheduler
    --------------------------------------

    Whenever

    a worker finishes,

    search for

    newly eligible tasks.
    */

    function executeNext() {

      /*
      Base Case.

      Nothing waiting.

      Nothing running.

      Done.
      */

      if (

        pending.size === 0 &&

        activeWorkers === 0

      ) {

        resolve();

        return;

      }

      /*
      WHY copy Set?

      We remove tasks

      while iterating.
      */

      for (const taskId of [...pending]) {

        /*
        Workers full.

        Stop scheduling.
        */

        if (

          activeWorkers >= limit

        ) {

          return;

        }

        /*
        Dependencies

        not finished yet.
        */

        if (!canRun(taskId)) {

          continue;

        }

        pending.delete(taskId);

        activeWorkers++;

        graph[taskId]

          .task()

          .then(() => {

            console.log(

              `✅ ${taskId} completed`

            );

            completed.add(taskId);

          })

          .catch(error => {

            console.error(

              `❌ ${taskId} failed`,

              error

            );

          })

          .finally(() => {

            /*
            WHY finally?

            Worker becomes free

            regardless of

            success

            or

            failure.
            */

            activeWorkers--;

            executeNext();

          });

      }

    }

    executeNext();

  });

}


// --------------------------------------------------
// EXAMPLE
// --------------------------------------------------

const asyncGraph = {

  A: {

    dependency: [],

    task: () => delay(1000)

  },

  B: {

    dependency: ["A"],

    task: () => delay(800)

  },

  C: {

    dependency: ["A"],

    task: () => delay(500)

  },

  D: {

    dependency: [

      "B",

      "C"

    ],

    task: () => delay(700)

  }

};


try {

  const order =

    resolveDependenciesWithCycleDetection(

      asyncGraph

    );

  console.log(

    "Execution Order:",

    order

  );

  executeTasksInParallel(

    order,

    asyncGraph,

    2

  ).then(() => {

    console.log(

      "🎉 All tasks completed"

    );

  });

} catch (err) {

  console.error(err.message);

}


/*

Possible Output

Execution Order

[ 'A', 'C', 'B', 'D' ]

OR

[ 'A', 'B', 'C', 'D' ]

(Both are valid)

✅ A completed

✅ C completed

✅ B completed

✅ D completed

🎉 All tasks completed

*/


/* --------------------------------------------------
   28. SMART PAGINATION WITH ELLIPSIS
--------------------------------------------------

Problem:
Return the page numbers to display in a pagination component.

Rules:
✔ Always show first page
✔ Always show last page
✔ Show current page
✔ Show one page before current
✔ Show one page after current
✔ Insert "..." whenever pages are skipped

Example

current = 5
total = 10

Output

[1, "...", 4, 5, 6, "...", 10]

Time Complexity : O(k log k)
k = number of candidate pages (constant here, at most 5)

Space Complexity : O(k)
*/

function getPaginationPages(current, total) {

  /*
    WHY validate inputs?

    Avoid invalid page numbers such as

    current = 0
    current = 15 (when total = 10)
    total <= 0

    Returning an empty array is safer than
    producing incorrect pagination.
  */
  if (total <= 0 || current < 1 || current > total) {
    return [];
  }

  /*
    WHY Set?

    Different rules may generate duplicate pages.

    Example

    current = 1

    We add

    1
    current
    current - 1
    current + 1

    Without Set

    [1,1,0,2,10]

    With Set

    {1,2,10}

    Automatically removes duplicates.
  */
  const pages = new Set();

  /*
    Always show first & last page.
  */
  pages.add(1);
  pages.add(total);

  /*
    Show current page and its neighbours.

    Example

    current = 5

    Add

    4
    5
    6
  */
  pages.add(current - 1);
  pages.add(current);
  pages.add(current + 1);

  /*
    Convert Set → Array

    Remove invalid page numbers

    Example

    current = 1

    Set

    {1,0,2,10}

    Filter

    {1,2,10}

    WHY sort?

    Set preserves insertion order,
    NOT numeric order.

    Sorting ensures pages always appear
    from left to right.

    Example

    [10,1,5]

    becomes

    [1,5,10]
  */
  const validPages = [...pages]
    .filter(page => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result = [];

  /*
    Build final pagination.

    Whenever two consecutive pages have
    a gap greater than one,

    insert an ellipsis.

    Example

    Pages

    [1,5,6,10]

    Between

    1 and 5

    Missing pages

    2,3,4

    so add "..."

    Result

    [1,"...",5,6,"...",10]
  */
  for (let i = 0; i < validPages.length; i++) {
    const currentPage = validPages[i];
    const previousPage = validPages[i - 1];

    /*
      WHY gap > 1 ?

      Gap = 1

      5 → 6

      Nothing is hidden.

      Gap > 1

      5 → 8

      Hidden pages exist (6,7)

      Show ellipsis.
    */
    if (i > 0 && currentPage - previousPage > 1) {
      result.push("...");
    }

    result.push(currentPage);
  }

  return result;
}

    /* --------------------------------------------------
      TEST CASES
    -------------------------------------------------- */

    console.log(getPaginationPages(1, 10));
    // [1, 2, "...", 10]

    console.log(getPaginationPages(5, 10));
    // [1, "...", 4, 5, 6, "...", 10]

    console.log(getPaginationPages(9, 10));
    // [1, "...", 8, 9, 10]

    console.log(getPaginationPages(10, 10));
    // [1, "...", 9, 10]

    console.log(getPaginationPages(3, 5));
    // [1, 2, 3, 4, 5]

    console.log(getPaginationPages(0, 5));
    // []


/* --------------------------------------------------
   29. PRIORITY BASED DATA FETCHING
--------------------------------------------------

Problem

Multiple API endpoints return the same data.

Rules

✔ Start ALL requests immediately (parallel)

✔ Priority is based on array index
   index 0 = highest priority

✔ A response is valid only if:
   - fetch succeeds
   - HTTP status is successful (response.ok)

✔ Return the highest-priority successful response
   as soon as it can be determined.

✔ Do NOT wait for lower-priority requests
   once the answer is known.

✔ Reject only if ALL requests fail.

--------------------------------------------------

Time Complexity : O(n²) worst case

Why?

Each completed request scans the results array
from the beginning.

For interview purposes this is perfectly acceptable.

Space Complexity : O(n)

Stores one result per request.
-------------------------------------------------- */

function getPreferredResponse(endpoints) {

  /*
    WHY validate input?

    Avoid invalid usage.

    Example

    getPreferredResponse()

    getPreferredResponse([])

    should fail immediately.
  */
  if (!Array.isArray(endpoints) || endpoints.length === 0) {
    return Promise.reject(
      new Error("Endpoints should be a non-empty array")
    );
  }

  return new Promise((resolve, reject) => {

    /*
      Stores completion state for every request.

      undefined

      →

      Request still running

      { success:true }

      →

      Request succeeded

      { success:false }

      →

      Request failed
    */
    const requestResults = new Array(endpoints.length);

    /*
      Number of requests that have finished
      (success OR failure).
    */
    let settledCount = 0;

    /*
      WHY resolved flag?

      Multiple requests may finish
      almost simultaneously.

      We should resolve/reject ONLY once.
    */
    let resolved = false;

    /*
      IMPORTANT

      Start ALL requests immediately.

      WHY?

      Requirement says requests must run
      in parallel.

      Never wait for one request before
      starting another.
    */
    endpoints.forEach((endpoint, index) => {

      fetch(endpoint)

        /*
          WHY check response.ok ?

          fetch() only rejects for:

          ✔ network failure
          ✔ DNS failure
          ✔ connection timeout

          HTTP errors like

          404
          500
          403

          STILL resolve normally.

          Therefore we must convert
          HTTP failures into rejected promises.
        */
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return response.json();
        })

        .then((data) => {
          requestResults[index] = {
            success: true,
            data,
          };
        })

        .catch((error) => {
          requestResults[index] = {
            success: false,
            error,
          };
        })

        .finally(() => {
          settledCount++;
          checkResolution();
        });
    });

    /*
      Determines whether we already know
      the highest-priority successful response.
    */
    function checkResolution() {

      /*
        Promise already settled.

        Ignore later completions.
      */
      if (resolved) return;

      /*
        Scan from HIGHEST priority
        to LOWEST priority.

        WHY every time?

        Lower-priority requests may finish earlier,
        but they cannot be returned until every
        higher-priority request has completed.
      */
      for (let i = 0; i < requestResults.length; i++) {

        const current = requestResults[i];

        /*
          WHY undefined means WAIT?

          Example

          Priority

          0 1 2

          Results

          undefined
          success
          success

          We still don't know whether
          request 0 will succeed.

          Since 0 has higher priority,

          we must wait.
        */
        if (current === undefined) {
          return;
        }

        /*
          First successful request encountered
          while scanning priorities.

          This is guaranteed to be the
          highest-priority successful response.
        */
        if (current.success) {
          resolved = true;
          resolve(current.data);
          return;
        }
      }

      /*
        Every request finished.

        None succeeded.

        Reject.
      */
      if (settledCount === endpoints.length) {
        resolved = true;
        reject(new Error("All API requests failed"));
      }
    }
  });
}

    /* --------------------------------------------------
      WHY NOT Promise.race() ?

    Promise.race()

    Returns whichever finishes first.

    That ignores priority.

    --------------------------------------------------

    WHY NOT Promise.any() ?

    Promise.any()

    Returns the first successful request.

    Again, it ignores priority.

    --------------------------------------------------

    This solution waits ONLY when necessary
    to determine the highest-priority success.
    -------------------------------------------------- */


   /* --------------------------------------------------
       30. PIPE
    --------------------------------------------------

      Problem

      Create a pipe() function that accepts multiple
      functions and returns a new function.

      The returned function passes its input through
      every function from LEFT → RIGHT.

      Example

      pipe(f1, f2, f3)(x)

      ↓

      f3(f2(f1(x)))

      Time Complexity : O(n)

      n = number of functions

      Space Complexity : O(1)

      (excluding function call stack)
      -------------------------------------------------- */

  // pipe executes functions LEFT → RIGHT
  function pipe(...functions) {

    /*
      WHY return another function?

      pipe() builds the pipeline first.

      Later we provide the actual value.

      Example

      const transform = pipe(f1, f2, f3);

      transform(10);
    */
    return function (value) {

      /*
        WHY reduce()?

        reduce() carries forward
        the accumulated value.

        Previous output

        ↓

        Next function input

        Exactly what a pipeline needs.
      */
      return functions.reduce(

        (currentValue, currentFunction) => {

          /*
            Execute current function.

            Output becomes input
            for the next function.
          */
          return currentFunction(currentValue);

        },

        /*
          Initial value passed to
          the FIRST function.
        */
        value
      );
    };
  }

/* --------------------------------------------------
   EXAMPLE
-------------------------------------------------- */

  const person = {
    salary: 10000
  };

  const getSalary = (person) => person.salary;

  const addBonus = (salary) => salary + 1000;

  const deductTax = (salary) => salary - salary * 0.30;

  const calculateNetSalary = pipe(
    getSalary,
    addBonus,
    deductTax
  );

  console.log(calculateNetSalary(person));

  // 7700

/* --------------------------------------------------
   Edge Case

   pipe()(10)

   No functions supplied.

   reduce() simply returns the initial value.

   Output

   10

-------------------------------------------------- */

/* --------------------------------------------------
   PIPE vs COMPOSE

   pipe()

   LEFT → RIGHT

   pipe(f1, f2, f3)(x)

   f3(f2(f1(x)))



   compose()

   RIGHT → LEFT

   compose(f1, f2, f3)(x)

   f1(f2(f3(x)))

-------------------------------------------------- */


/* --------------------------------------------------
   31. SUM OF ALL THE RESOLVED PROMISES

      An array of promises will be given that will either resolve (with number) or reject, If all the promises reject -> reject, else resolve with the sum of all resolved promises.
  -------------------------------------------------- 
*/

async function sumResolvedPromises(promises) {
  // Wait for every promise to either fulfill or reject
  const results = await Promise.allSettled(promises);

  let sum = 0;
  let hasResolved = false;

  for (const result of results) {

    // Only consider fulfilled promises
    if (result.status === "fulfilled") {
      sum += result.value;
      hasResolved = true;
    }
  }

  // If every promise rejected
  if (!hasResolved) {
    throw new Error("All promises rejected");
  }

  return sum;
}

const p1 = [
  Promise.resolve(10),
  Promise.reject("error"),
  Promise.resolve(20),
  Promise.reject("fail"),
  Promise.resolve(5),
];
const result = sumResolvedPromises(p1).then(console.log).catch(console.error); // 35
console.log('result', result)


/* --------------------------------------------------
   32. PIPING 1
      Given an object which can have a function as a value at a nested level, create a function that will accept arguments as input and pass it through all the functions in the input object and return the computed value.
  -------------------------------------------------- 
*/

function pipe(obj) {

  // Return a function that accepts any number of arguments
  return function (...args) {

    // Recursive DFS
    function dfs(current) {

      // If it's a function, execute it
      if (typeof current === "function") {
        return current(...args);
      }

      // Primitive values
      if (current === null || typeof current !== "object") {
        return current;
      }

      // Create new object/array
      const result = Array.isArray(current) ? [] : {};

      // Traverse children
      for (const key in current) {
        result[key] = dfs(current[key]);
      }

      return result;
    }

    return dfs(obj);
  };
}


const obj = {
  a : {
    b : (a,b,c) => a+b+c,
    c : (a,b,c) => a+b-c,
  },
  d : (a,b,c) => a-b-c
}

const output = pipe(obj)(1,1,1);

// OUTPUT
// {
//   a: {
//     b: 3,
//     c: 1
//   },
//   d: -1
// }


/* --------------------------------------------------
   33. PROCESS ASYNC CALLBACL QUEUE - PART 2
     Implement a async callback queue, that takes an processor function, on-complete function and concurrency and run those number of concurrent tasks at any given time through the processor function and invoke on-complete callback.
  -------------------------------------------------- 
*/

function Queue(processorFn, onCompleteFn, concurrency) {

    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;

    this.processorFn = processorFn;
    this.onCompleteFn = onCompleteFn;

    this.drainListener = null;
    this.errorListener = null;
}

Queue.prototype.processNext = function () {

    while (
        this.running < this.concurrency &&
        this.queue.length > 0
    ) {

        const task = this.queue.shift();

        this.running++;

        this.processorFn(task, (data, error) => {

            this.running--;

            this.onCompleteFn(data, error, task);

            if (error && this.errorListener) {
                this.errorListener(error, task);
            }

            this.processNext();

            if (
                this.running === 0 &&
                this.queue.length === 0 &&
                this.drainListener
            ) {
                this.drainListener();
            }
        });
    }
};

Queue.prototype.push = function (tasks) {

    if (!Array.isArray(tasks)) {
        tasks = [tasks];
    }

    this.queue.push(...tasks);

    this.processNext();
};

Queue.prototype.unshift = function (tasks) {

    if (!Array.isArray(tasks)) {
        tasks = [tasks];
    }

    this.queue.unshift(...tasks);

    this.processNext();
};

Queue.prototype.drain = function (callback) {
    this.drainListener = callback;
};

Queue.prototype.error = function (callback) {
    this.errorListener = callback;
};


/* INPUT */
// Update this to become promisified
const processorFn = (task, callback) => {
    setTimeout(() => {
      console.log('Processing task ' + task.name);
      callback(`${task.name} done`);
	// Use in follow up for error scenario implementation
	/* 
	const errorRnd = Math.random() < 0.1;
	if(errorRnd) {
		callback(null, `${task.name} error`);
      }
      */

    }, 500);
}

const onCompleteFn = (data, error, task) => {
    console.log('Task has completed processing: ', task.name, error, Date.now());
}

const myQueue = new Queue(processorFn, onCompleteFn, 2);

// add some items to the queue
myQueue.push({name: 'foo'});

// add some items to the queue (batch-wise)
myQueue.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}]);

// Add items after a certain timeout
setTimeout(() => {
  myQueue.push([{name: 'x'}, {name: 'y'}, {name: 'z'}, {name: 'w'} ]);
}, 600);

// assign a listener when the queue does not have any pending items
myQueue.drain(function() {
    console.log('all items have been processed');
});

// assign an error listener
myQueue.error(function(err, task) {
    console.error('task experienced an error', err, task);
});

// FOLLOW UP: add some items to the front of the queue
// myQueue.unshift({name: 'bar'});

// OUTPUT
// "Processing task foo"
// "Task has completed processing: ", "foo", undefined, 1784370243236
// "Processing task baz"
// "Task has completed processing: ", "baz", undefined, 1784370243236
// "Processing task bay"
// "Task has completed processing: ", "bay", undefined, 1784370243753
// "Processing task bax"
// "Task has completed processing: ", "bax", undefined, 1784370243753
// "Processing task x"
// "Task has completed processing: ", "x", undefined, 1784370244269
// "Processing task y"
// "Task has completed processing: ", "y", undefined, 1784370244269
// "Processing task z"
// "Task has completed processing: ", "z", undefined, 1784370244771
// "Processing task w"
// "Task has completed processing: ", "w", undefined, 1784370244771
// "all items have been processed"



/* --------------------------------------------------
   34. PUBLISHER SUBSCRIBER - PART 1
     Create a simple Observable class that implements the observer pattern. The class should:

      Allow subscribing to data changes via a subscribe method
      Notify all subscribers when data changes via a notify method
      Allow unsubscribing from updates
      Maintain a list of subscriber callbacks
  -------------------------------------------------- 
*/

// Observable implements the Publisher-Subscriber (Observer) pattern
class Observable {
  constructor() {
    // Stores all subscriber callbacks
    this.subscribers = [];
  }

  // Register a new subscriber
  subscribe(callback) {
    // Save the callback
    this.subscribers.push(callback);

    // Return a subscription object
    // so caller can unsubscribe later
    return {
      unsubscribe: () => {
        // Remove only this callback
        this.subscribers = this.subscribers.filter(
          subscriber => subscriber !== callback
        );
      }
    };
  }

  // Notify every subscriber with new data
  notify(data) {
    this.subscribers.forEach(callback => callback(data));
  }
}

// ------------------------------
// Example
// ------------------------------

const observable = new Observable();

// Subscriber 1
const subscription1 = observable.subscribe((data) => {
  console.log("Subscriber 1:", data);
});

// Subscriber 2
const subscription2 = observable.subscribe((data) => {
  console.log("Subscriber 2:", data);
});

// Notify all subscribers
observable.notify("Hello!");

/*
Output:
Subscriber 1: Hello!
Subscriber 2: Hello!
*/

// Remove first subscriber
subscription1.unsubscribe();

// Notify again
observable.notify("Hello again!");

/*
Output:
Subscriber 2: Hello again!
*/

// Remove second subscriber
subscription2.unsubscribe();

// No subscribers left
observable.notify("Nobody receives this");

/*
Output:
(nothing)
*/


/* --------------------------------------------------
   35. PUBLISHER SUBSCRIBER - PART 2

     Implement the pub-sub pattern in JavaScript that has following methods: subscribe, subscribeOnce, and subscribeOnceAsync

    subscribe(name, callback): Will take the name of the event and assign a callback to it. This callback will be invoked when the event is published. It returns a remove() method to unsubscribe the event.
    subscribeOnce(name, callback): Will take the name of the event and assign a callback to it. This event will be published only once.
    subscribeOnceAsync(name): Will take the name of the event and returns a promise that is settled or fullfilled when the event is published.
    publish(name, data): Publish a single event and pass the data to the callback of each events. If the event is subscribed only once, it should not invoke twice.
    publishAll(name): Publishes all events and passes the data to the callback of each events. If the event is subscribed only once, it should not invoke twice.
  -------------------------------------------------- 
*/

class PubSub {
  constructor() {
    // Stores listeners for every event
    // {
    //   eventName: [{ callback, once }]
    // }
    this.events = {};
  }

  // --------------------------------------------------
  // Subscribe to an event
  // --------------------------------------------------
  subscribe(name, callback) {

    if (!this.events[name]) {
      this.events[name] = [];
    }

    this.events[name].push({
      callback,
      once: false
    });

    // Return remove() API
    return {
      remove: () => {
        this.events[name] = this.events[name].filter(
          listener => listener.callback !== callback
        );
      }
    };
  }

  // --------------------------------------------------
  // Subscribe only once
  // --------------------------------------------------
  subscribeOnce(name, callback) {

    if (!this.events[name]) {
      this.events[name] = [];
    }

    this.events[name].push({
      callback,
      once: true
    });
  }

  // --------------------------------------------------
  // Promise resolves on first publish
  // --------------------------------------------------
  subscribeOnceAsync(name) {

    return new Promise(resolve => {

      this.subscribeOnce(name, resolve);

    });
  }

  // --------------------------------------------------
  // Publish a single event
  // --------------------------------------------------
  publish(name, data) {

    if (!this.events[name]) return;

    this.events[name] = this.events[name].filter(listener => {

      listener.callback(data);

      // Keep only non-once listeners
      return !listener.once;
    });
  }

  // --------------------------------------------------
  // Publish all registered events
  // --------------------------------------------------
  publishAll(data) {

    for (const eventName in this.events) {

      this.publish(eventName, data);

    }
  }
}

const events = new PubSub();

const newUserNewsSubscription = events.subscribe("new-user", function (payload) {
  console.log(`Sending Q1 News to: ${payload}`);
});

events.publish("new-user", "Jhon");

//output: "Sending Q1 News to: Jhon"

const newUserNewsSubscription2 = events.subscribe("new-user", function (payload) {
  console.log(`Sending Q2 News to: ${payload}`);
});

events.publish("new-user", "Doe");

//output: "Sending Q1 News to: Doe"
//output: "Sending Q2 News to: Doe"

newUserNewsSubscription.remove(); // Q1 news is removed

events.publish("new-user", "Foo");
//output: "Sending Q2 News to: Foo"

events.publishAll("FooBar");
//output: "Sending Q2 News to: FooBar"

events.subscribeOnce("new-user", function (payload) {
  console.log(`I am invoked once ${payload}`);
});

events.publish("new-user", "Foo Once");
//output: "Sending Q2 News to: Foo Once" - normal event
//output: "I am invoked once Foo Once" - once event

events.publish("new-user", "Foo Twice");
//output: "Sending Q2 News to: Foo Twice" - normal event
// once event should not invoke for second time


events.subscribeOnceAsync("new-user").then(function (payload) {
  console.log(`I am invoked once ${payload}`);
});

events.publish("new-user", "Foo Once Async");
//output: "Sending Q2 News to: Foo Once Async"
//output: "I am invoked once Foo Once Async"



/* --------------------------------------------------
   35. CREATE COMPOSE ASYNC FUNCTION WITH CHAINING SUPPORT
  -------------------------------------------------- 
*/

function composeAsync(...functions) {

  // Return a function that accepts the arguments
  // for the right-most function
  return function (...args) {

    // Execute the last function first
    let promise = Promise.resolve(
      functions[functions.length - 1](...args)
    );

    // Chain remaining functions from right → left
    for (let i = functions.length - 2; i >= 0; i--) {

      promise = promise.then(result => {
        return functions[i](result);
      });

    }

    return promise;
  };
}

function a(x, y) {
  return new Promise(resolve => setTimeout(() => resolve(x * y), 100));
}

function b(z) {
  return new Promise((resolve, reject) => setTimeout(() => resolve(z + 5), 100));
}

function c(r) {
  return new Promise(resolve => setTimeout(() => resolve(r / 10), 100));
}

// create this function
composeAsync(c, b, a)(5, 3).then(result => { console.log(result); }).catch(console.error);



/* --------------------------------------------------
   36. IMPLEMENT MAP DATA STRUCTURE WITH EVENT LISTENER

        Storage for key-value pairs. Override value for same key.
        Event listeners that trigger when values change.
        Support for both change:key and key event formats on listener.
  -------------------------------------------------- 
*/

class StoreData {
  constructor() {
    // Stores key-value pairs
    this.store = new Map();

    // Stores event listeners
    // {
    //   "change:name": [fn1, fn2],
    //   "age": [fn3]
    // }
    this.listeners = new Map();
  }

  // -----------------------------
  // Add / Update a value
  // -----------------------------
  add(key, value) {
    const oldValue = this.store.get(key);

    // Save latest value
    this.store.set(key, value);

    // Trigger listeners only if value actually changed
    if (oldValue !== value) {
      this.emit(`change:${key}`, oldValue, value, key);
      this.emit(key, oldValue, value, key);
    }
  }

  // -----------------------------
  // Check whether key exists
  // -----------------------------
  has(key) {
    return this.store.has(key);
  }

  // -----------------------------
  // Register an event listener
  // -----------------------------
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName).push(callback);
  }

  // -----------------------------
  // Notify all listeners
  // -----------------------------
  emit(eventName, oldValue, newValue, key) {
    if (!this.listeners.has(eventName)) return;

    for (const callback of this.listeners.get(eventName)) {
      callback(oldValue, newValue, key);
    }
  }
}


const store = new StoreData();

store.add("name", "joe");
store.add("age", 30);

console.log(store.has("age"));     // true
console.log(store.has("animal"));  // false

store.add("name", "emma");

store.on("change:name", (oldVal, newVal, key) => {
  console.log(`old ${key}: ${oldVal}, new ${key}: ${newVal}`); // "old name: emma, new name: john"
});

store.add("name", "john");

store.on("age", (oldVal, newVal, key) => {
  console.log(`old ${key}: ${oldVal}, new ${key}: ${newVal}`); // "old age: 30, new age: 50"
});

store.add("age", 50);

store.on("change:age", (oldVal, newVal) => {
  if (oldVal > newVal) {
    console.log("older now");
  }
});

store.add("age", 28); // "old age: 50, new age: 28"
store.add("age", 45); // "old age: 28, new age: 45"



/* --------------------------------------------------
   37. CURRYING (1 TO 5)

    Currying is the process of transforming a function that
    takes multiple arguments into a sequence of functions,
    each taking one (or more) arguments.

    Normal

    sum(1,2,3)

    Curried

    sum(1)(2)(3)

    Benefits

    • Partial application
    • Function reuse
    • Better composition
    • Delayed execution
  -------------------------------------------------- 
*/

// ---------------------------------------------------------
// CURRYING - PART 1 (Closure based accumulator & NOT True Currying)
// ---------------------------------------------------------

/*
----------------------------------------------------------
PART 1

This is NOT true currying.

It is a closure that keeps remembering the previous value.

sum(5) -> 5
sum(3) -> 8
sum(4) -> 12

The returned function has access to "total"
even after curry() has finished executing.
----------------------------------------------------------
*/

function curry() {

  // Private variable.
  // Only the returned function can access or modify it.
  let total = 0;

  // Returning a function creates a closure.
  // The closure remembers "total".
  return function (num) {

    // Add current value
    total += num;

    // Return latest accumulated value
    return total;
  };
}

const sum = curry();

console.log(sum(5)); // 5
console.log(sum(3)); // 8
console.log(sum(4)); // 12
console.log(sum(0)); // 12


// ---------------------------------------------------------
// CURRYING - PART 2 (Infinite Currying using valueOf)
// ---------------------------------------------------------

/*
----------------------------------------------------------
PART 2

Infinite Currying

curry(1)(2)(3)

Each call returns the SAME function,
allowing unlimited chaining.

The chain ends only when JavaScript converts
the function into a primitive.

Number(...)
Unary +
Comparison
Arithmetic

During conversion JavaScript first calls valueOf().
----------------------------------------------------------
*/

function curry(initial = 0) {

  // Closure variable storing running total
  let total = initial;

  function curried(num) {

    // Update total
    total += num;

    // Return same function
    // so chaining can continue forever.
    return curried;
  }

  // Called automatically during numeric conversion.
  curried.valueOf = function () {
    return total;
  };

  // Called during string conversion.
  curried.toString = function () {
    return String(total);
  };

  return curried;
}

console.log(+curry(1)(2)(3));     // 6
console.log(Number(curry(5)(5))); // 10



// ---------------------------------------------------------
// CURRYING - PART 3 (Infinite Currying with Empty Call)
// ---------------------------------------------------------

/*
----------------------------------------------------------
PART 3

Chain ends with an empty call.

curry(1)(2)(3)()

Instead of waiting for valueOf(),
we explicitly stop the recursion
when no argument is passed.
----------------------------------------------------------
*/

function curry(total = 0) {

  // Every recursive call creates a NEW closure
  // containing the updated total.
  return function curried(num) {

    // Empty call means stop recursion.
    if (num === undefined) {
      return total;
    }

    // Return a NEW curried function
    // with updated total.
    //
    // Example:
    //
    // curry(1)
    // -> curry(3)
    // -> curry(6)
    //
    return curry(total + num);
  };
}

console.log(curry(1)(2)(3)()); // 6


// ---------------------------------------------------------
// CURRYING - PART 4 (GENERIC CURRY)
// ---------------------------------------------------------

/*
----------------------------------------------------------
PART 4

Generic Curry

Turns ANY function into a curried version.

Example

sum(a,b,c,d)

becomes

sum(1)(2)(3)(4)

The function executes only after
all required arguments have been collected.

How do we know?

fn.length

returns the number of declared parameters.
----------------------------------------------------------
*/

function curry(fn) {

  function curried(...args) {

    // args contains every argument collected so far.

    // If enough arguments have been collected,
    // execute the original function.
    if (args.length >= fn.length) {
      return fn(...args);
    }

    // Otherwise return another function
    // to collect remaining arguments.
    return function (...nextArgs) {

      // Merge old and new arguments.

      // Example

      // args = [1]
      // nextArgs = [2]

      // becomes

      // [1,2]

      return curried(...args, ...nextArgs);
    };
  }

  return curried;
}

function sum(a, b, c, d) {
  return a + b + c + d;
}

const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3)(4));



// ---------------------------------------------------------
// CURRYING - PART 5 (Generic Curry with Multiple Arguments)
// ---------------------------------------------------------

/*
----------------------------------------------------------
PART 5

Supports every possible combination.

curried(1,2,3,4)

curried(1)(2,3)(4)

curried(1)(2)(3)(4)

Each invocation collects more arguments.

Eventually the total number of collected
arguments becomes equal to fn.length.

At that point the original function executes.
----------------------------------------------------------
*/

function curry(fn) {

  function curried(...args) {

    // Have we collected enough arguments?
    if (args.length >= fn.length) {

      // Execute original function.

      // Extra arguments are ignored because
      // JavaScript ignores arguments beyond
      // declared parameters.

      return fn(...args);
    }

    // Need more arguments.

    return (...nextArgs) => {

      // Merge previously collected arguments
      // with newly received arguments.

      // Example

      // args = [1,2]
      // nextArgs = [3]

      // becomes

      // [1,2,3]

      return curried(...args, ...nextArgs);
    };
  }

  return curried;
}