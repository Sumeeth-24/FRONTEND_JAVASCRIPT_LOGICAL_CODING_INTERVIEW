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
      while (activeCount < limit && nextTaskIndex < tasks.length) {
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


// --------------------------------------------------------------
// 21. MAP LIMIT 
// -------------------------------------------------------------

//mapLimit is just a value-to-task adapter on top of a concurrency-controlled executor.

async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let nextTaskIndex = 0;
  let activeCount = 0;

  return new Promise((resolve) => {
    function runNext() {
      // ✅ All done
      if (nextTaskIndex === tasks.length && activeCount === 0) {
        resolve(results);
        return;
      }

      while (activeCount < limit && nextTaskIndex < tasks.length) {
        const currentIndex = nextTaskIndex;
        const task = tasks[currentIndex];

        nextTaskIndex++;
        activeCount++;

        task()
          .then((value) => {
            results[currentIndex] = { status: "fulfilled", value };
          })
          .catch((err) => {
            results[currentIndex] = { status: "rejected", error: err };
          })
          .finally(() => {
            activeCount--;
            runNext(); // 🔁 start next waiting task
          });
      }
    }

    runNext();
  });
}



function mapLimit(inputs, limit, mapper, done) {
  /**
   * STEP 1️⃣
   * Convert each input value into a function
   * WHY?
   * runWithConcurrency expects: () => Promise
   */
  const tasks = inputs.map((item) => {
    return () => mapper(item);
  });

  /**
   * STEP 2️⃣
   * Delegate concurrency handling to runWithConcurrency
   */
  runWithConcurrency(tasks, limit)
    .then((results) => {
      // STEP 3️⃣ success callback
      done(null, results);
    })
    .catch((err) => {
      // STEP 4️⃣ error callback
      done(err);
    });
}



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
 /* 22. Given a 2D array of [name, marks]:
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
   // 23. GENERATE SUM
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
   // 24. STORE CLASS
   /**
    Design a Store class that supports:

      1️⃣ subscribe(key, onUpdate, onCleanup)
          Subscribe to changes for a specific key.
          onUpdate(value) → called whenever the value for that key changes.
          onCleanup() → called when the subscription is removed.
          Must return a cleanup function that unsubscribes only that subscriber.

      2️⃣ save(key, value)
         Save a value for a key.
         Notify all subscribers of that key immediately.

      3️⃣ remove(key)
          Remove the key from the store.
         Clean up all subscriptions for that key.
    */
// -------------------------------------------------------------

class Store {
  constructor() {
    /**
     * 🗄 Internal cache
     * key → value
     */
    this.data = new Map();

    /**
     * 👂 Subscribers map
     * key → Set of subscriber objects
     *
     * Each subscriber:
     * {
     *   onUpdate: function,
     *   onCleanup: function
     * }
     */
    this.subscribers = new Map();
  }

  /**
   * 🔔 Subscribe to updates for a key
   */
  subscribe(key, onUpdate, onCleanup) {
    // ✅ Ensure subscriber list exists for the key
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const subscriber = { onUpdate, onCleanup };
    this.subscribers.get(key).add(subscriber);

    /**
     * ⚡ Immediately notify if value already exists
     * (important edge case — avoids stale UI)
     */
    if (this.data.has(key)) {
      onUpdate(this.data.get(key));
    }

    /**
     * 🧹 Return cleanup function
     * Removes ONLY this subscriber
     */
    return () => {
      const subs = this.subscribers.get(key);
      if (!subs) return;

      subs.delete(subscriber);

      // Call cleanup if provided
      if (onCleanup) {
        onCleanup();
      }

      // 🧠 Memory optimization:
      // Remove key if no subscribers left
      if (subs.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  /**
   * 💾 Save value & notify subscribers
   */
  save(key, value) {
    this.data.set(key, value);

    const subs = this.subscribers.get(key);
    if (!subs) return;

    // Notify all subscribers
    subs.forEach(({ onUpdate }) => {
      try {
        onUpdate(value);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    });
  }

  /**
   * ❌ Remove key and cleanup all subscribers
   */
  remove(key) {
    this.data.delete(key);

    const subs = this.subscribers.get(key);
    if (!subs) return;

    // Call cleanup for each subscriber
    subs.forEach(({ onCleanup }) => {
      if (onCleanup) {
        onCleanup();
      }
    });

    // Remove all subscribers for the key
    this.subscribers.delete(key);
  }
}


/* TEST CASE */
const store = new Store();

const unsubscribe = store.subscribe(
  "user",
  (value) => {
    console.log("🔄 User updated:", value);
  },
  () => {
    console.log("🧹 User subscription cleaned");
  }
);

store.save("user", { name: "Sumeeth", age: 25 });
// 🔄 User updated: { name: "Sumeeth", age: 25 }

unsubscribe();
// 🧹 User subscription cleaned

store.save("user", { name: "Updated" });
// ❌ No update (unsubscribed)


// --------------------------------------------------------------
   // 24. STORE CLASS
   /**
    🚕 Uber Driver – Chainable Class with Priority Execution

  🔥 Problem Statement (Clean Restate)
    Design a chainable JavaScript class UberDriver with methods like:
      pick(name, location)
      drive(minutes)
      drop()
      rest(minutes)
      coffeeBreak(minutes) ← must always execute first
      status()
    */

    // SINCE EXECUTION ORDER MATTERS AND ASYNC IS INVOLVED WE'LL USE PROMISES
// -------------------------------------------------------------

class UberDriver {
  constructor() {
    this.queue = [];  // 🚕 normal tasks
    this.priorityQueue = []; // 🚨 coffeeBreak tasks

    this.currentPassenger = null;
    this.location = null;
    
    // 🕒 Start execution after chaining completes
    Promise.resolve().then(() => this.run());
  }

  async run() {
    // 1️⃣ Run priority tasks first
    for (const task of this.priorityQueue) {
      await task();
    }
    
    // 2️⃣ Then run normal tasks
    for (const task of this.queue) {
      await task();
    }
  }

  delay(seconds) {
    return new Promise(res => setTimeout(res, seconds * 1000));
  }

  /* ---------------- Actions OR Chainable APIs ---------------- */

  pick(name, location) {
    this.queue.push(async () => {
      if (this.currentPassenger) {
        console.log(`❌ Already driving ${this.currentPassenger}`);
        return;
      }

      this.currentPassenger = name;
      this.location = location;
      console.log(`🚕 Picked up ${name} at location ${location}`);
    });
    return this;
  }

  drive(minutes) {
    this.queue.push(async () => {
      if (!this.currentPassenger) {
        console.log(`⚠️ No passenger to drive`);
        return;
      }

      console.log(`🚗 Driving ${this.currentPassenger} for ${minutes} minutes`);
      await this.delay(minutes);
    });
    return this;
  }

  status() {
    this.queue.push(async () => {
      if (this.currentPassenger) {
        console.log(`📊 On trip with ${this.currentPassenger}`);
      } else {
        console.log(`📊 Driver is idle`);
      }
    });
    return this;
  }

  drop() {
    this.queue.push(async () => {
      if (!this.currentPassenger) {
        console.log(`⚠️ No passenger to drop`);
        return;
      }

      console.log(`📍 Dropped ${this.currentPassenger}`);
      this.currentPassenger = null;
      this.location = null;
    });
    return this;
  }

  rest(minutes) {
    this.queue.push(async () => {
      console.log(`😴 Resting for ${minutes} minutes`);
      await this.delay(minutes);
    });
    return this;
  }

  /* ---------------- Priority Method ---------------- */

  coffeeBreak(minutes) {
    this.priorityQueue.push(async () => {
      console.log(`☕ Coffee break for ${minutes} minutes`);
      await this.delay(minutes);
    });
    return this;
  }
}


new UberDriver()
  .pick("Alice", 1)
  .status()
  .drive(2)
  .drop()
  .status()
  .pick("Bob", 2)
  .coffeeBreak(1)   // 👈 Executes FIRST
  .drive(1)
  .drop();

// OUTPUT

// ☕ Coffee break for 1 minutes
// 🚕 Picked up Alice at location 1
// 📊 On trip with Alice
// 🚗 Driving Alice for 2 minutes
// 📍 Dropped Alice
// 📊 Driver is idle
// 🚕 Picked up Bob at location 2
// 🚗 Driving Bob for 1 minutes
// 📍 Dropped Bob



// --------------------------------------------------------------
   // 25. CUSTOM JSON.STRINGIFY()
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
   // 26. Topological Sort with Cycle Detection (DFS)
   /**
     * - Detects circular dependencies
     * - Returns correct execution order
  */
// -------------------------------------------------------------

// 🕒 Simulated delay utility
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveDependenciesWithCycleDetection(graph) {
  const nodes = Object.keys(graph);
  const visited = new Set();
  const recStack = new Set();
  const topoOrder = [];

  function dfs(node) {
    // 🚨 Cycle detected
    if (recStack.has(node)) {
      throw new Error(`Cycle detected at node: ${node}`);
    }

    // Already processed
    if (visited.has(node)) return;

    visited.add(node);
    recStack.add(node);

    // Visit dependencies first
    for (const dep of graph[node].dependency || []) {
      dfs(dep);
    }

    recStack.delete(node);
    topoOrder.push(node); // Post-order
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  // 🔑 IMPORTANT FIX: reverse post-order for correct topo order
  return topoOrder.reverse();
}

/**
 * 🚀 Execute tasks with:
 * - Dependency enforcement
 * - Concurrency limit
 */
function executeTasksInParallel(order, graph, limit = 2) {
  let activeTasks = 0;
  const completed = new Set();
  const pending = new Set(order);

  return new Promise((resolve) => {

  /**
   * ✅ canRun(taskId)
   * ------------------------------------------------
   * Checks whether a task is eligible to run
   *
   * A task can run ONLY IF:
   * - It has no dependencies OR
   * - All its dependencies are already completed
   */
  function canRun(taskId) {
    return (
      // Get dependencies array (fallback to empty if undefined)
      (graph[taskId].dependency || [])
        // every() ensures ALL dependencies are completed
        .every((dep) => completed.has(dep))
    );
  }

  /**
   * 🚀 executeNext()
   * ------------------------------------------------
   * Core scheduler function:
   * - Picks runnable tasks
   * - Respects concurrency limit
   * - Triggers next execution when a task finishes
   */
  function executeNext() {

    /**
     * 🛑 BASE CASE (Termination Condition)
     *
     * When:
     * - No pending tasks left AND
     * - No active (running) tasks
     *
     * ➜ Entire workflow is complete
     */
    if (pending.size === 0 && activeTasks === 0) {
      resolve(); // Resolve outer Promise
      return;
    }

    /**
     * 🔁 Iterate over pending tasks
     *
     * IMPORTANT:
     * - We spread into a new array to avoid mutating
     *   the Set while iterating
     */
    for (const taskId of [...pending]) {

      /**
       * ⛔ Concurrency Guard
       *
       * If we already reached the max allowed parallel tasks,
       * stop scheduling more for now.
       */
      if (activeTasks >= limit) return;

      /**
       * ⏳ Dependency Guard
       *
       * Skip this task if its dependencies are NOT completed yet.
       */
      if (!canRun(taskId)) continue;

      /**
       * 🧹 Move task from pending → running
       */
      pending.delete(taskId); // Remove from pending queue
      activeTasks++;          // Increment active count

      /**
       * ▶️ Execute the async task
       */
      graph[taskId]
        .task()
        .then(() => {
          // ✅ Task resolved successfully
          console.log(`✅ ${taskId} completed`);
          completed.add(taskId); // Mark as completed
        })
        .catch((err) => {
          // ❌ Task failed
          console.error(`❌ ${taskId} failed`, err);
        })
        .finally(() => {
          /**
           * 🔁 Cleanup + Reschedule
           *
           * - Decrease active task count
           * - Try to schedule next eligible tasks
           */
          activeTasks--;
          executeNext(); // Re-run scheduler
        });
    }
  }

  /**
   * 🚦 Kick off execution
   */
  executeNext();
  });
}

/* --------------------------------------------------
   🧪 Example Usage
-------------------------------------------------- */

const asyncGraph = {
  A: {
    dependency: [],
    task: () => delay(1000),
  },
  B: {
    dependency: ["A"],
    task: () => delay(800),
  },
  C: {
    dependency: ["A"],
    task: () => delay(500),
  },
  D: {
    dependency: ["B", "C"],
    task: () => delay(700),
  },
};

try {
  const order = resolveDependenciesWithCycleDetection(asyncGraph);
  console.log("🔀 Execution Order:", order);

  executeTasksInParallel(order, asyncGraph, 2).then(() => {
    console.log("🎉 All tasks completed");
  });
} catch (e) {
  console.error("🚨 ERROR:", e.message);
}

// OUTPUT

// 🔀 Execution Order: [ 'D', 'C', 'B', 'A' ]
// ✅ A completed
// ✅ C completed
// ✅ B completed
// ✅ D completed
// 🎉 All tasks completed



/* --------------------------------------------------
   27. SMART PAGINATION COMPONENTS WITH ELIPSIS
  -------------------------------------------------- 
*/

function getPaginationPages(current, total) {
  const pages = new Set();

  // Always include first & last
  pages.add(1);
  pages.add(total);

  // Include current and neighbors
  pages.add(current);
  pages.add(current - 1);
  pages.add(current + 1);

  // Remove invalid pages
  const validPages = [...pages]
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result = [];

  for (let i = 0; i < validPages.length; i++) {
    const curr = validPages[i];
    const prev = validPages[i - 1];

    // If gap > 1 → insert ellipsis
    if (i > 0 && curr - prev > 1) {
      result.push("...");
    }

    result.push(curr);
  }

  return result;
}

console.log(getPaginationPages(1, 10));
// [1, 2, "...", 10]

console.log(getPaginationPages(5, 10));
// [1, "...", 4, 5, 6, "...", 10]

console.log(getPaginationPages(9, 10));
// [1, "...", 8, 9, 10]


/* --------------------------------------------------
   28. PRIORITY BASED DATA FETCHING
      Rules
       1. All network requests must be initiated in parallel (not sequentially)
       2. Endpoint priority is determined by position in the array(index 0 = highest priority)
       3. A response is considered valid only if the request resolves successfully 
       4. As soon as the highest-priority successful response can be determined,
          it should be returned without unecessary waiting.
       5. If all request fail(network error or non-success HTTP status),
          the function must reject with an appropriate error.  
  -------------------------------------------------- 
*/

function getPreferredResponse(endpoints) {
  if (!Array.isArray(endpoints) || endpoints.length === 0) {
    return Promise.reject(
      new Error("Endpoints should be a valid non-empty array")
    );
  }

  return new Promise((resolve, reject) => {
    const results = new Array(endpoints.length);
    let settledCount = 0;
    let resolved = false;

    endpoints.forEach((endpoint, index) => {
      fetch(endpoint)
        .then((response) => {
          if (!response.ok) throw new Error("API call failed");
          return response.json();
        })
        .then((data) => {
          results[index] = { success: true, data };
        })
        .catch((err) => {
          results[index] = { success: false, err };
        })
        .finally(() => {
          settledCount++;
          checkResolution();
        });
    });

    function checkResolution() {
      if (resolved) return;

      for (let i = 0; i < results.length; i++) {
        const current = results[i];

        // Higher-priority request still pending
        if (current === undefined) return;

        if (current.success) {
          resolved = true;
          resolve(current.data);
          return;
        }
      }

      if (!resolved && settledCount === endpoints.length) {
        resolved = true;
        reject(new Error("All APIs failed"));
      }
    }
  });
}