/**
 * Test the value to see if it's a JSON string
 * @param  {string} value String to test
 * @return {Boolean}
 */
export default function isJson(value) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}
