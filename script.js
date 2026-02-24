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
      finalFlattenArray = [...finalFlattenArray, ...result];
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
// 3. FLATTEN DEEPLY NESTED OBJECT
// --------------------------------------------------------------

// Function to deeply flatten an object (handles nested objects + arrays)
// obj     → input object to flatten
// prefix  → keeps track of the key path (used for recursion)
// result  → accumulator object that stores final flattened output
const flattenObject = (obj, prefix = "", result = {}) => {
  // Loop through all enumerable keys in the object
  // `for...in` iterates over own + inherited properties
  for (const key in obj) {
    // hasOwnProperty check ensures:
    // - We only process properties that belong directly to the object
    // - We skip properties coming from prototype chain
    // Example:
    //   obj.__proto__.toString → ignored
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Construct the new flattened key
      // If prefix exists → combine prefix + current key
      // Else → use current key as root
      // Example:
      //   address + street → address_street
      const newKey = prefix ? `${prefix}_${key}` : key;

      // Check if the current value is an array
      if (Array.isArray(obj[key])) {
        // Iterate over each item in the array
        obj[key].forEach((item, index) => {
          // Recursively flatten each array element
          // Index is appended to preserve array position
          // Example:
          //   phones_0_type
          flattenObject(item, `${newKey}_${index}`, result);
        });
      }
      // Check if the value is a non-null object
      // (typeof null === "object" → must be excluded)
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        // Recursively flatten nested object
        flattenObject(obj[key], newKey, result);
      }
      // Base case: primitive value (string, number, boolean, null)
      else {
        // Store the primitive value using the flattened key
        result[newKey] = obj[key];
      }
    }
  }

  // Return the accumulated flattened result
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
// 4. ADD SUM OF DEEPLY NESTED OBJECT
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
  let sum = 0; // Holds total sum

  // Loop through all keys in the object
  for (const key in obj) {
    // Ensure property belongs directly to the object
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // If value is a number, add it to sum
      if (typeof value === "number") {
        sum += value;
      }

      // If value is a non-null object, recurse
      else if (typeof value === "object" && value !== null) {
        sum += sumDeepObject(value);
      }

      // Ignore strings, null, booleans, etc.
    }
  }

  return sum; // Return accumulated sum
};

console.log(sumDeepObject(data)); // 3

// --------------------------------------------------------------
// 5. IMPLEMENT DEEP FILTER
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

  // ✅ Result object
  // This will store the filtered output
  const result = {};

  // 🔁 Iterate over all enumerable keys in the object
  for (const key in collection) {
    // ⚠️ SAFETY CHECK #3
    // Ensures we only access object's own properties
    // Prevents prototype pollution issues
    if (!Object.prototype.hasOwnProperty.call(collection, key)) {
      continue;
    }

    // 📦 Extract current value
    const value = collection[key];

    // 🔍 CASE 1: If value is a nested object
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // 🔁 Recursively filter the nested object
      const filteredChild = deepFilter(value, callback);

      // ✅ Keep the object ONLY if it has valid keys left
      // This avoids returning empty objects
      // b: {
      //   c: -2,
      //   d: 3
      // }
      // 1️⃣ deepFilter(b)
      // 2️⃣ filteredChild = { d: 3 }
      // 3️⃣ Object.keys(filteredChild) → ["d"]
      // 4️⃣ length is 1 → ✅ keep b

      //   b: {
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

  // ✅ Return final filtered object
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
// 6. IMPLEMENT DEEP EQUAL
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

  // Step 4: Get object keys and compare their lengths
  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);

  if (keys1.length !== keys2.length) {
    return false; // If the number of keys differ, they are not equal
  }

  // Step 5: Compare objects property by property
  for (let key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(value2, key)) {
      return false; // If `value2` does not have the same key, return false
    }

    if (!deepEqual(value1[key], value2[key])) {
      return false; // Recursively compare values
    }
  }

  return true; // If all checks pass, the objects are deeply equal
}


// --------------------------------------------------------------
// 7. IMPLEMENT DEEP MAP
// --------------------------------------------------------------

export default function deepMap(value, fn) {
  return mapHelper(value, fn, value); // Calls recursive helper function with the original value passed as `this`
}

// Function to check if a given value is a "plain object"
// A "plain object" is an object that is either created using `{}` or `new Object()`, 
// but NOT instances of classes, arrays, or special objects like `RegExp`
// isPlainObject({}) // ✅ true
// isPlainObject(new Object()) // ✅ true
// isPlainObject([]) // ❌ false
// isPlainObject(new Date()) // ❌ false
// isPlainObject(null) // ❌ false

function isPlainObject(value) {
  if (value === null || value === undefined) {
    return false; // Null and undefined are not objects
  }

  const prototype = Object.getPrototypeOf(value); // Get the prototype of the object

  // The object is "plain" if its prototype is either `null` (Object.create(null)) 
  // or `Object.prototype` (default JS objects)
  return prototype === null || prototype === Object.prototype;
}

// Recursive function to apply transformation
function mapHelper(element, fn, original) {
  // Step 1: Check if the element is an array
  if (Array.isArray(element)) {
    const mappedArray = []; // Create a new array to store transformed elements

    for (let i = 0; i < element.length; i++) {
      mappedArray.push(mapHelper(element[i], fn, original)); // Recursively process each element
    }

    return mappedArray; // Return the new transformed array
  }

  // Step 2: Check if the element is a plain object (not an array or special object)
  if (isPlainObject(element)) {
    const mappedObject = {}; // Create a new object to store transformed properties

    for (const key in element) {
      if (Object.prototype.hasOwnProperty.call(element, key)) {
        mappedObject[key] = mapHelper(element[key], fn, original); // Recursively process object values
      }
    }

    return mappedObject; // Return the transformed object
  }

  // Step 3: If the element is not an object or array, apply the transformation function
  return fn.call(original, element);
}

// ------ QUESTION AND OUTPUT -------

// const double = (x) => x * 2;

// deepMap(2, double); // 4
// deepMap([1, 2, 3], double); // [4, 5, 6]
// deepMap({ a: 1, b: 2, c: 3 }, double); // { a: 2, b: 4, c: 6 }
// deepMap(
//   {
//     foo: 1,
//     bar: [2, 3, 4],
//     qux: { a: 5, b: 6 },
//   },
//   double,
// ); // => { foo: 2, bar: [4, 6, 8], qux: { a: 10, b: 12 } }




// --------------------------------------------------------------
// 8. IMPLEMENT DEEP MERGE
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

    // Iterate over each key in valB.
    for (const key in valB) {
      // Check if valA also has this key (to perform a deep merge).
      if (Object.prototype.hasOwnProperty.call(valA, key)) {
        // Recursively merge the values of the current key.
        newObj[key] = deepMerge(valA[key], valB[key]);
      } else {
        // If valA doesn't have the key, just copy it from valB.
        newObj[key] = valB[key];
      }
    }
    return newObj; // Return the merged object.
  }

  // Step 3: If neither arrays nor objects match, return valB.
  // This means valB overwrites valA when they are different types.
  return valB;
}

// Function to check if a given value is a "plain object"
// A "plain object" is an object that is either created using `{}` or `new Object()`,
// but NOT instances of classes, arrays, or special objects like `RegExp`
function isPlainObject(value) {
  if (value === null || value === undefined) {
    return false; // Null and undefined are not objects
  }

  const prototype = Object.getPrototypeOf(value); // Get the prototype of the object

  // The object is "plain" if its prototype is either `null` (Object.create(null))
  // or `Object.prototype` (default JS objects)
  return prototype === null || prototype === Object.prototype;
}



// --------------------------------------------------------------
// 9. IMPLEMENT DEEP OMIT
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
  // Base case: If obj is not an object or array, return it as is.
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // If obj is an array, recursively process each element.
  if (Array.isArray(obj)) {
    return obj.map(item => deepOmit(item, keys));
  }

  // Create a new object to store filtered properties.
  const newObj = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Skip keys that need to be omitted.
      if (keys.includes(key)) {
        continue;
      }
      
      // Recursively process nested objects and arrays.
      newObj[key] = deepOmit(obj[key], keys);
    }
  }

  return newObj;
}



// --------------------------------------------------------------
// 10. CHAIN CALCULATOR
// --------------------------------------------------------------

class Calculator {

  // 🏗️ Constructor initializes the calculator
  constructor(initialValue = 0) {
    // `this.value` holds the current calculation result
    // Stored on the instance so it persists across chained calls
    this.value = initialValue;
  }

  // ➕ Adds a number to the current value
  add(amount) {
    // Update internal state
    // We mutate the instance instead of creating a new object
    this.value += amount;

    // 🔁 Return `this` so that another method
    // can be called on the same instance
    return this;
  }

  // ➖ Subtracts a number from the current value
  subtract(amount) {
    // Modify the stored value
    this.value -= amount;

    // 🔁 Returning `this` enables chaining like:
    // calculator.subtract(2).multiply(3)
    return this;
  }

  // ✖ Multiplies the current value
  multiply(factor) {
    // Apply multiplication on the internal value
    this.value *= factor;

    // 🔁 Returning the instance maintains the chain
    return this;
  }

  // 📤 Retrieves the final calculated value
  getResult() {
    // Separate "computation" from "retrieval"
    // Improves readability and API design
    return this.value;
  }
}

const calc = new Calculator(10);

const answer = calc
  .add(5)
  .subtract(3)
  .multiply(2)
  .getResult();

console.log(answer); // 👉 24




// --------------------------------------------------------------
// 11. POLYFILL FOR MEMOIZE AN ASYNC FUNCTION
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
  // fetch only rejects on network error, not HTTP error
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

function memoizeUserData(fn, ttl = 300000) {
  // 🧠 Cache Map
  // key → { value: Promise, expiry: number }
  const cache = new Map();

  // 🛑 AbortController Map
  // (kept for learning / future use cases like search)
  const controllers = new Map();

  return async function (...args) {

    // 🔑 Normalize arguments into a stable cache key
    function serialize(arg) {
      // Symbols/functions converted to string for safety
      if (typeof arg === "symbol" || typeof arg === "function") {
        return arg.toString();
      }

      // Objects sorted by key to ensure stable order
      if (typeof arg === "object" && arg !== null) {
        return JSON.stringify(
          Object.fromEntries(Object.entries(arg).sort())
        );
      }

      // Primitives
      return String(arg);
    }

    // Final cache key
    const key = JSON.stringify(args.map(serialize));

    const now = Date.now();
    const cached = cache.get(key);

    // ✅ CACHE HIT
    // Return SAME in-flight Promise if TTL is valid
    if (cached && now < cached.expiry) {
      console.log(`✅ CACHE HIT → key: ${key}`);
      return cached.value;
    }

    console.log(`📡 FETCHING → New request for key: ${key}`);

    // 🆕 Create AbortController
    const controller = new AbortController();
    controllers.set(key, controller);

    // 🚀 Call original async function
    const promise = fn(...args, controller.signal)
      .catch(err => {
        // ❌ Remove failed/aborted requests from cache
        cache.delete(key);

        // WHY handle AbortError?
        // Aborted fetch rejects promise → must not crash app
        if (err.name === "AbortError") {
          console.log(`⚠️ Request aborted for key: ${key}`);
          return;
        }

        throw err;
      })
      .finally(() => {
        // 🧹 Cleanup controller after completion
        controllers.delete(key);
      });

    // 💾 Cache the Promise immediately
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
// 12. RETRY PROMISES N NUMBER OF TIMES
// --------------------------------------------------------------

/* CREATE A DELAY function */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* retry function => for a particular delay and for n num of times */
const retryWithDelay = async(operation, retries = 3, delay = 100, finalErr = 'Retry Failed') => {
   try {
     const result = await operation();
     return result;
   } catch (error) {
     if(retries <= 0){
         return Promise.reject(finalErr);
     }
     console.log(`Retrying ... Attempts left: ${retries}`);

     await wait(delay);

     retryWithDelay(operation, retries - 1, delay, finalErr);
   }
}

/* Fetch User Data */
const fetchUserData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(Math.random() > 0.9){
        resolve({
          userId: 1, name: 'Smith Jone'
        })
      } else {
        reject('Network Error');
      }
    }, 1000)
  })
}

/* Combine all Function and Test */
const testRetryLogic = async () => {
  try {
    const userData = await retryWithDelay(fetchUserData, 5, 2000);
    console.log('User data retreived successfully', userData);
  } catch (error) {
    console.log('Failed to retreive user Data', error);
  }
}

testRetryLogic();



// --------------------------------------------------------------
// 13. DEEP CLONE AN OBJECT
// --------------------------------------------------------------

function deepClone(obj, seen = new WeakMap()) {
  /**
   * 🧠 BASE CASE
   * --------------------------------------------------
   * If the value is:
   *  - null
   *  - OR not an object (number, string, boolean, undefined, symbol, function)
   *  - NOTE: typeOf Array and NULL is OBJECT But typeof UNDEFINED is UNDEFINED because we need to
   *          only allow objects and arrays
   *
   * Then return it directly.
   *
   * WHY?
   * - Primitive values are immutable
   * - They do not need deep cloning
   * - Prevents unnecessary recursion
   */
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  /**
   * 🔁 CIRCULAR REFERENCE CHECK
   * --------------------------------------------------
   * A circular dependency happens when an object contains a reference to itself, either directly or  indirectly
   * const person = {name: "Alice"};
   * person.self = person;  // Circular Reference
   * 
   * If we have already cloned this object before,
   * return the stored clone.
   *
   * WHY?
   * - Prevents infinite recursion
   * - Handles circular references:
   *
   *   const a = {};
   *   a.self = a;
   *
   * - WeakMap stores:
   *   originalObject → clonedObject
   */
  if (seen.has(obj)) {
    return seen.get(obj);
  }

  /**
   * 🏗️ CREATE CLONE CONTAINER
   * --------------------------------------------------
   * If obj is an array → create []
   * If obj is an object → create a new object
   *
   * Object.create(Object.getPrototypeOf(obj))
   *
   * WHY Object.create?
   * - Preserves the prototype chain
   * - Ensures class instances remain instances
   *
   * Example:
   * class User {}
   * deepClone(new User()) instanceof User → ✅ true
   */
  const clone = Array.isArray(obj)
    ? []
    : Object.create(Object.getPrototypeOf(obj));

  /**
   * 🧷 STORE IN WEAKMAP (VERY IMPORTANT)
   * --------------------------------------------------
   * Store the reference BEFORE cloning properties.
   *
   * WHY?
   * - Circular references may appear in nested objects
   * - If a nested object refers back to this object,
   *   we can immediately return this clone
   *
   * WHY WeakMap?
   * - Keys are objects only
   * - Garbage-collected automatically
   * - Prevents memory leaks
   */
  seen.set(obj, clone);

  /**
   * 🔄 ITERATE OVER OBJECT PROPERTIES
   * --------------------------------------------------
   * Using `for...in` to iterate enumerable properties
   */
  for (const key in obj) {
    /**
     * 🔐 HAS OWN PROPERTY CHECK
     * --------------------------------------------------
     * Ensures we only copy object's own properties
     * and NOT inherited ones.
     *
     * WHY Object.prototype.hasOwnProperty.call?
     * - Safer than obj.hasOwnProperty
     * - Works even if:
     *   Object.create(null)
     */
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      /**
       * 📅 HANDLE DATE OBJECTS
       * --------------------------------------------------
       * Date is an object, but cloning it normally
       * would copy the reference.
       *
       * new Date(value) creates a new instance
       * with the same timestamp.
       */
      if (value instanceof Date) {
        clone[key] = new Date(value);
      }

      /**
       * 🔍 HANDLE REGEXP OBJECTS
       * --------------------------------------------------
       * RegExp has internal state:
       * - pattern (source)
       * - flags (g, i, m, etc.)
       *
       * We must recreate it explicitly.
       */
      else if (value instanceof RegExp) {
        clone[key] = new RegExp(value.source, value.flags);
      }

      /**
       * 🧬 HANDLE NESTED OBJECTS / ARRAYS
       * --------------------------------------------------
       * If value is an object, recursively deep clone it.
       *
       * We pass the SAME WeakMap to keep track
       * of already cloned objects.
       */
      else if (typeof value === "object") {
        clone[key] = deepClone(value, seen);
      }

      /**
       * 🧾 HANDLE PRIMITIVE VALUES
       * --------------------------------------------------
       * Includes:
       * - number
       * - string
       * - boolean
       * - undefined
       * - function
       * - symbol
       *
       * Functions are copied by reference
       * (this is intentional in JS).
       */
      else {
        clone[key] = value;
      }
    }
  }

  /**
   * ✅ RETURN FINAL CLONE
   * --------------------------------------------------
   * At this point:
   * - All properties are deeply cloned
   * - Circular references are preserved
   * - Prototypes are maintained
   */
  return clone;
}



// --------------------------------------------------------------
// 14. CANCELLABLE PROMISE
// --------------------------------------------------------------

/**
 * ❌ Custom Error Class for Cancellation
 * --------------------------------------------------
 * We create a custom error so that:
 * - Cancellation can be distinguished from real failures
 * - Consumers can specifically catch cancellation errors
 */
class CanceledPromiseError extends Error {
  constructor() {
    /**
     * Call the parent Error constructor
     * Sets the error message
     */
    super("Promise has been canceled");

    /**
     * Set a custom name for easier identification
     * Useful in catch blocks:
     *
     * if (err.name === "CanceledPromiseError") { ... }
     */
    this.name = "CanceledPromiseError";
  }
}

/**
 * 🧩 Add a `cancelable` utility
 * --------------------------------------------------
 * This is NOT true Promise cancellation.
 * Instead, we wrap a promise and control
 * whether its result is allowed to resolve.
 *
 * Usage:
 * const p = Promise.cancelable(fetchData());
 * p.cancel();
 */
Promise.cancelable = (promise) => {
  /**
   * 🚩 Cancellation Flag
   * --------------------------------------------------
   * Tracks whether cancel() has been called.
   *
   * WHY boolean flag?
   * - Promises cannot be stopped once started
   * - We can only decide whether to use the result
   */
  let isCanceled = false;

  /**
   * 🎁 Wrapped Promise
   * --------------------------------------------------
   * We create a new promise that:
   * - Listens to the original promise
   * - Decides whether to resolve or reject
   */
  const wrappedPromise = new Promise((resolve, reject) => {
    /**
     * Attach handlers to the original promise
     */
    promise.then(
      /**
       * ✅ Original promise resolved
       */
      (value) => {
        /**
         * If cancel() was called before resolution,
         * reject instead of resolving.
         */
        if (isCanceled) {
          reject(new CanceledPromiseError());
        } else {
          /**
           * Otherwise, resolve normally
           */
          resolve(value);
        }
      },

      /**
       * ❌ Original promise rejected
       */
      (error) => {
        /**
         * Forward the original error as-is
         * (Cancellation does NOT affect real failures)
         */
        reject(error);
      }
    );
  });

  /**
   * 🛑 cancel() method
   * --------------------------------------------------
   * Adds a custom cancel function
   * to the wrapped promise.
   *
   * Calling this does NOT stop the async work,
   * it only changes how the result is handled.
   */
  wrappedPromise.cancel = () => {
    /**
     * Flip the cancellation flag
     */
    isCanceled = true;
  };

  /**
   * 🎯 Return the wrapped promise
   * --------------------------------------------------
   * The consumer gets:
   * - a normal promise
   * - plus a cancel() method
   */
  return wrappedPromise;
};

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

const p1 = Promise.cancelable(delayResolve("SUCCESS", 1000));

p1.then((result) => {
  console.log("Resolved:", result);
}).catch((err) => {
  console.error("Error:", err);
});

const p2 = Promise.cancelable(delayResolve("SHOULD NOT RESOLVE", 1000));

setTimeout(() => {
  p2.cancel();
}, 300);

p2.then((result) => {
  console.log("Resolved:", result);
}).catch((err) => {
  console.error("Caught:", err.name, err.message);
});




// --------------------------------------------------------------
// 15. EVENT EMITTER
// --------------------------------------------------------------

/**
 * 📢 EventEmitter Implementation
 * --------------------------------------------------
 * Allows:
 * - Subscribing to named events
 * - Emitting events with arguments
 * - Unsubscribing using a handle
 */
class EventEmitter {
  constructor() {
    /**
     * 🗂️ Store for all event subscriptions
     * --------------------------------------------------
     * Structure:
     * Map {
     *   eventName => Map {
     *     subscriptionId => callback
     *   }
     * }
     *
     * WHY Map?
     * - Preserves insertion order
     * - O(1) add / delete / lookup
     * - Keys can be anything (string, symbol, etc.)
     */
    this._eventSubscriptions = new Map();
  }

  /**
   * ➕ Subscribe to an event
   * --------------------------------------------------
   * @param {string} eventName - name of the event
   * @param {Function} callback - function to execute
   *
   * @returns {Object} { remove() } - unsubscribe handler
   */
  subscribe(eventName, callback) {
    /**
     * 🛡️ Type Safety
     * --------------------------------------------------
     * Ensures only functions can be registered
     * Prevents runtime crashes during emit()
     */
    if (typeof callback !== "function") {
      throw new TypeError("Callback should be a function");
    }

    /**
     * 📦 Initialize event bucket if it doesn't exist
     * --------------------------------------------------
     * Each event has its own Map of subscriptions
     */
    if (!this._eventSubscriptions.has(eventName)) {
      this._eventSubscriptions.set(eventName, new Map());
    }

    /**
     * 🆔 Unique Subscription Identifier
     * --------------------------------------------------
     * Symbol guarantees uniqueness
     * No risk of collision
     *
     * Why not index or number?
     * - Safer
     * - Cannot be accidentally overwritten
     */
    const subscriptionId = Symbol();

    /**
     * Get all subscriptions for this event
     */
    const subscriptions = this._eventSubscriptions.get(eventName);

    /**
     * Store the callback using the unique id
     */
    subscriptions.set(subscriptionId, callback);

    /**
     * 🧹 Return an unsubscribe handle
     * --------------------------------------------------
     * Allows the consumer to remove this listener
     * without exposing internal data structures
     */
    return {
      remove: () => {
        /**
         * Prevent double removal
         */
        if (!subscriptions.has(subscriptionId)) {
          throw new Error("Subscription has already removed");
        }

        /**
         * Remove the callback from the event
         */
        subscriptions.delete(subscriptionId);
      },
    };
  }

  /**
   * 🚀 Emit an event
   * --------------------------------------------------
   * @param {string} eventName - event to trigger
   * @param {...any} args - arguments passed to listeners
   */
  emit(eventName, ...args) {
    /**
     * Fetch subscriptions for this event
     */
    const subscriptions = this._eventSubscriptions.get(eventName);

    /**
     * Guard clause:
     * - No listeners registered
     */
    if (!subscriptions) {
      throw new Error("No event found");
    }

    /**
     * 🔄 Execute all callbacks
     * --------------------------------------------------
     * Each subscriber receives the same arguments
     */
    subscriptions.forEach((callback) => {
      callback(...args);
    });
  }
}

const emitter = new EventEmitter();

const sub = emitter.subscribe("click", () => {
  console.log("Clicked!");
});

emitter.emit("click");  // "Clicked!"

sub.remove();
sub.remove(); // Uncaught Error: Subscription has already removed"



// --------------------------------------------------------------
// 16. CONVERT FLAT DATA TO TREE STRUCTURE
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
  /**
   * WHY Map?
   * - O(1) access by id
   * - Cleaner than plain object for interview discussion
   */
  const idToNodeMap = new Map();

  /**
   * This will store all root-level nodes
   * (nodes whose parentId === null)
   */
  const tree = [];

  /**
   * STEP 1: Create a map of id → node
   * WHY?
   * - Ensures every node exists before linking children
   * - Avoids nested loops (O(n²))
   */
  for (const item of flatData) {
    idToNodeMap.set(item.id, {
      ...item,
      children: [] // initialize children array
    });
  }

  /**
   * STEP 2: Build parent-child relationships
   */
  for (const item of flatData) {
    const node = idToNodeMap.get(item.id);

    if (item.parentId === null) {
      /**
       * Root node
       * WHY push to tree?
       * - These are entry points for the sidebar
       */
      tree.push(node);
    } else {
      /**
       * Child node
       * Find its parent and push into parent's children
       */
      const parentNode = idToNodeMap.get(item.parentId);

      // Defensive check (good interview practice)
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  }

  return tree;
}

const treeData = convertToTree(flatData);
console.log(treeData);



// --------------------------------------------------------------
// 17. BREADCRUMB TRAIL CONSTRUCTION
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
  /**
   * STEP 1: Create a map for O(1) lookup
   * id → node
   *
   * WHY?
   * - Breadcrumb traversal needs fast parent lookup
   * - Avoids O(n²)
   */
  const idMap = new Map();

  for (const item of data) {
    // Only store nodes with a valid id
    if (item.id !== null) {
      idMap.set(item.id, item);
    }
  }

  /**
   * STEP 2: Find the leaf node
   * Leaf is defined as id === null
   */
  const leafNode = data.find(item => item.id === null);

  /**
   * Defensive check (interview-safe)
   */
  if (!leafNode) return "";

  /**
   * STEP 3: Walk from leaf → root
   */
  const path = [];
  let current = leafNode;

  while (current) {
    /**
     * WHY unshift?
     * - We traverse bottom → top
     * - Breadcrumb displays top → bottom
     */
    path.unshift(current.title);

    if (current.parentId === null) break;

    current = idMap.get(current.parentId);
  }

  /**
   * STEP 4: Join with separator
   */
   console.log(path) // [ 'Audio', 'Headphones', 'Wired', 'True wireless', 'Bluetooth' ]
  return path.join(" >> ");
}

const breadResult = buildBreadcrumbTrail(breadCrum);
console.log(breadResult); // Audio >> Headphones >> Wired >> True wireless >> Bluetooth


// --------------------------------------------------------------
// 18. CONCURRENCY CONTROL (Worker Pool Pattern)
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
*/

async function runWithConcurrency(tasks, limit) {
  // 🧺 Stores final results in input order
  const results = new Array(tasks.length);

  // 👉 Index of next task to execute
  let nextTaskIndex = 0;

  // 🧑‍🏭 Number of tasks currently running
  let activeCount = 0;

  return new Promise((resolve, reject) => {
    function runNext() {
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
      while (activeCount < limit && nextTaskIndex < tasks.length) {
        const currentIndex = nextTaskIndex;
        const task = tasks[currentIndex];

        nextTaskIndex++;
        activeCount++;

        // ▶️ Execute task
        task()
          .then((result) => {
            // 🎯 Preserve order
            results[currentIndex] = result;
          })
          .catch(reject) // ❌ Fail fast
          .finally(() => {
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
  return () =>
    new Promise((resolve) => {
      console.log(`🚀 START ${name}`);
      setTimeout(() => {
        console.log(`✅ END ${name}`);
        resolve(name);
      }, delay);
    });
}

const tasks = [
  createTask("Task 1", 3000),
  createTask("Task 2", 1000),
  createTask("Task 3", 2000),
  createTask("Task 4", 500),
];

runWithConcurrency(tasks, 2).then((results) => {
  console.log("🎯 FINAL RESULTS:", results);
});

// 🚀 START Task 1
// 🚀 START Task 2
// ✅ END Task 2
// 🚀 START Task 3
// ✅ END Task 1
// 🚀 START Task 4
// ✅ END Task 3
// ✅ END Task 4
// 🎯 FINAL RESULTS: [ 'Task 1', 'Task 2', 'Task 3', 'Task 4' ]


// --------------------------------------------------------------
// 19. TASK RUNNER 
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
    this.concurrency = concurrency;       // Max parallel tasks
    this.runningTasks = 0;                // Currently running tasks
    this.queue = [];                      // Queue to hold pending tasks

    // Optional: backpressure control
    this.maxQueueSize = options.maxQueueSize ?? Infinity;

    // Used by onIdle() to resolve when everything finishes
    this.idleResolvers = [];
  }

  // Push a task into the runner
  async push(task) {
    // Optional safety check: Reject if queue exceeds limit
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error("Queue overflow");
    }

    // If capacity available, run immediately
    if (this.runningTasks < this.concurrency) {
      this.execute(task);
    } else {
      // Else wait in queue
      this.queue.push(task);
    }
  }

  // Core execution logic
  async execute(task) {
    this.runningTasks++;

    try {
      await task(); // Execute async work
    } catch (err) {
      // Error should not stop queue processing
      console.error("Task failed:", err);
    } finally {
      this.runningTasks--; // task finish

      // Start next task if possible
      this.processQueue();

      // Resolve onIdle() promises if fully idle
      if (this.runningTasks === 0 && this.queue.length === 0) {
        this.resolveIdle();
      }
    }
  }

  processQueue() {
    if (
      this.queue.length > 0 &&
      this.runningTasks < this.concurrency
    ) {
      const nextTask = this.queue.shift();
      this.execute(nextTask);
    }
  }

  // Allows consumer to await until all tasks finish
  onIdle() {
    if (this.runningTasks === 0 && this.queue.length === 0) {
      return Promise.resolve();
    }

    // Push the resolve function to be called later when idle
    return new Promise(resolve => {
      this.idleResolvers.push(resolve);
    });
  }

// Internal: Resolves all 'onIdle()' waiters when system is idle
  resolveIdle() {
    while (this.idleResolvers.length > 0) {
      const resolve = this.idleResolvers.shift();
      resolve(); // Notify the caller that runner is now idle
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
// 20. KLARNA MASKIFY 
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

