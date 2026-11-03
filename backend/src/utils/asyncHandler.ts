import type { Request, Response, NextFunction, RequestHandler } from "express";

// Express 5 already forwards rejected promises to next(); kept for parity with fullStack-1
const asyncHandler =
  (
    requestHandler: (req: Request, res: Response, next: NextFunction) => unknown
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };

export default asyncHandler;
