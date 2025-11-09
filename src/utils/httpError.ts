import { NextFunction, Request } from "express";
import errorObjects from "./errorObjects";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (
  nextFunc: NextFunction,
  err: Error | unknown,
  req: Request,
  errorStatusCode: number = 500
): void => {
  const errorObj = errorObjects(err, req, errorStatusCode);
  return nextFunc(errorObj);
};
