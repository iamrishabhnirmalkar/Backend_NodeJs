import { Request } from "express";
import { THttpError } from "../@types/types";
import responseMessage from "../constants/responseMessage";

export default (
  err: Error | unknown,
  req: Request,
  errorStatusCode: number = 500
): THttpError => {
  const errorObj: THttpError = {
    success: false,
    statusCode: errorStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl,
    },
    message:
      err instanceof Error
        ? err.message || responseMessage.SOMETHING_WENT_WRONG
        : responseMessage.SOMETHING_WENT_WRONG,
    data: null,
    trace: err instanceof Error ? { error: err.stack } : null,
  };

  //log
  console.info(`CONTROLLER_ERROR`, {
    meta: errorObj,
  });

  //Production Env check
  //   if (config.ENV === EApplicationEnvironment.PRODUCTION) {
  //     delete errorObj.request.ip;
  //     delete errorObj.trace;
  //   }

  return errorObj;
};
