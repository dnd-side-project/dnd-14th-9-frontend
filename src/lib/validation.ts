import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";

export const createFormResolver = <T extends ZodSchema>(schema: T) => zodResolver(schema);
