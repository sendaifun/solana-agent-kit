import { z, ZodTypeAny, ZodObject, ZodRawShape, ZodType } from "zod";

// --- INTERFACES (No changes needed here, but included for completeness) ---

/**
 * The JSON schema structure for a single parameter.
 * Note: The 'type' can now be an array to support nullable types e.g., ["string", "null"]
 */
interface JSONSchemaProperty {
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | ("string" | "number" | "boolean" | "object" | "array" | "null")[];
  description?: string;
  enum?: (string | number | null)[];
  properties?: { [key: string]: JSONSchemaProperty };
  required?: string[];
  items?: JSONSchemaProperty;
  additionalProperties?: boolean; // CHANGE: This is now mandatory for the Agents API
}

/**
 * The structure for the 'parameters' object in an OpenAI tool.
 */
interface OpenAIToolParameters {
  type: "object";
  properties: {
    [key: string]: JSONSchemaProperty;
  };
  required: string[]; // CHANGE: This is now mandatory for the Agents API
  additionalProperties: boolean;
}

/**
 * The complete structure for an OpenAI tool definition.
 */
export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: OpenAIToolParameters;
  };
}

// --- IMPLEMENTATION ---

/**
 * Recursively maps a Zod type to its corresponding JSON schema property.
 */
function mapZodTypeToJsonSchema(zodType: ZodTypeAny): JSONSchemaProperty {
  // --- Part 1: Handle nullability ---
  // Check if the type is nullable BEFORE unwrapping other types
  const isNullable = zodType instanceof z.ZodNullable;
  let coreType = isNullable ? zodType._def.innerType : zodType;

  // --- Part 2: Unwrap optional, default, and effect types ---
  while (
    coreType instanceof z.ZodOptional ||
    coreType instanceof z.ZodDefault ||
    coreType instanceof z.ZodEffects
  ) {
    coreType =
      coreType instanceof z.ZodEffects
        ? coreType._def.schema
        : coreType._def.innerType;
  }

  // --- Part 3: Map the core Zod type to a JSON Schema type ---
  const typeName = coreType._def.typeName;
  let jsonSchema: JSONSchemaProperty = { type: "string" }; // Default

  switch (typeName) {
    case "ZodNullable":
      // Nullable types are treated as the core type, but can be null
      jsonSchema.type = mapZodTypeToJsonSchema(coreType._def.innerType).type;
      if (!jsonSchema.enum) {
        jsonSchema.enum = [""];
      } else {
        jsonSchema.enum.push("");
      }
      break;
    case "ZodString":
      jsonSchema.type = "string";
      break;
    case "ZodNumber":
    case "ZodBigInt":
      jsonSchema.type = "number";
      break;
    case "ZodBoolean":
      jsonSchema.type = "boolean";
      break;
    case "ZodEnum":
    case "ZodNativeEnum":
      jsonSchema.type = "string";
      if (!(coreType._def.values instanceof Array)) {
        jsonSchema.enum = Object.values(coreType._def.values).map((v: any) =>
          v.toString(),
        );
        break;
      }
      jsonSchema.enum = coreType._def.values;
      break;
    case "ZodLiteral":
      jsonSchema.type = typeof coreType._def.value as "string" | "number";
      jsonSchema.enum = [coreType._def.value];
      break;
    case "ZodArray":
      jsonSchema.type = "array";
      jsonSchema.items = mapZodTypeToJsonSchema(coreType._def.type);
      break;
    case "ZodObject":
      jsonSchema.type = "object";
      const shape = (coreType as ZodObject<any>).shape;
      jsonSchema.properties = {};
      for (const key in shape) {
        jsonSchema.properties[key] = mapZodTypeToJsonSchema(shape[key]);
      }
      // CHANGE: Per the Agents API docs, 'required' must list ALL properties.
      jsonSchema.required = Object.keys(shape);
      break;
    default:
      throw new Error(`Unsupported Zod type: ${typeName}`);
  }

  // --- Part 4: Add description and finalize nullability ---
  if (coreType.description) {
    jsonSchema.description = coreType.description;
  }

  if (isNullable) {
    // For enums, add 'null' to the list of possible values
    if (jsonSchema.enum) {
      if (!jsonSchema.enum.includes(null)) {
        jsonSchema.enum.push(null);
      }
    }
    // For other types, represent as a union type, e.g., ["string", "null"]
    else if (typeof jsonSchema.type === "string") {
      jsonSchema.type = [jsonSchema.type, "null"];
    }
  }

  jsonSchema.additionalProperties = false; // Ensure no additional properties are allowed
  return jsonSchema;
}

/**
 * Converts a Zod schema to an OpenAI-compatible tool definition from scratch.
 */
export function zodToOpenAITool<T extends ZodRawShape>(
  schema: ZodType<T>,
  name: string,
  description: string,
): OpenAITool {
  if (!(schema instanceof ZodObject)) {
    throw new Error("The provided schema must be a ZodObject.");
  }

  const shape = schema.shape;
  const properties: { [key: string]: JSONSchemaProperty } = {};

  for (const key in shape) {
    properties[key] = mapZodTypeToJsonSchema(shape[key]);
  }

  // CHANGE: The 'required' array must contain ALL keys in the properties object.
  const required = Object.keys(properties);

  const parameters: OpenAIToolParameters = {
    type: "object",
    properties,
    required, // This will now correctly list all properties.
    additionalProperties: false,
  };

  return {
    type: "function",
    function: {
      name,
      description,
      parameters,
    },
  };
}
