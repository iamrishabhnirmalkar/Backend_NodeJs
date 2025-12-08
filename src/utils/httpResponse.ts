import { THttpResponse } from '../@types/types';
import { Request, Response } from 'express';
import config from '../config/config';

export default (
  req: Request,
  res: Response,
  responseStatusCode: number,
  responseMessage: string,
  data: unknown = null,
): void => {
  const response: THttpResponse = {
    success: true,
    statusCode: responseStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl,
    },
    message: responseMessage,
    data: data,
  };

  //log
  console.info(`CONTROLLER_RESPONSE`, {
    meta: response,
  });

  //Production Env check
  //   if (config.ENV === EApplicationEnvironment.PRODUCTION) {
  //     delete response.request.ip;
  //   }

  res.status(responseStatusCode).json(response);
};
