interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>
  | null;

/**
 * Generic type for data returns
 */
export type GenericType =
  | string
  | number
  | Date
  | boolean
  | JSONObject
  | JSONArray
  | null;
