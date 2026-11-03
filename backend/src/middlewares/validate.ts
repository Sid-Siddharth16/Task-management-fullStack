import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

// validate req.body against a zod schema and replace it with the parsed data
// usage: router.post("/", validate(createUserSchema), controller) — schemas go in src/validators/
export const validate =
  (schema: z.ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(
        new ApiError(400, errors[0]?.message ?? "Validation failed", errors)
      );
    }

    req.body = result.data;
    next();
  };
