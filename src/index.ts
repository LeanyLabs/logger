import { createLogger as create, format, transports } from "winston";
import { consoleFormat } from "winston-console-format";

export interface ICreateLoggerParams extends ILoggerParams {
  isProduction: boolean;
}

export interface ILoggerParams {
  level?: string;
  labels?: Record<string, any>;
  getCorrelationId?: () => string;
  noCorrelationIdValue?: string;
}

const correlationFormat = format(function correlationFormatTransform(
  info,
  opts
) {
  const { getCorrelationId, noCorrelationIdValue } = opts || {};
  if (!getCorrelationId && typeof noCorrelationIdValue === "undefined") {
    return info;
  }

  let correlationId = getCorrelationId
    ? getCorrelationId()
    : noCorrelationIdValue;

  return {
    ...info,
    correlationId,
  };
});

function createProdLogger({
  level,
  labels,
  getCorrelationId,
  noCorrelationIdValue,
}: ILoggerParams) {
  function errorReplacer(key: any, value: { message: any; stack: any }) {
    if (value instanceof Error) {
      return { message: value.message, stack: value.stack };
    }
    return value;
  }

  const logFormat = format.printf((info) => {
    return `${JSON.stringify(info, errorReplacer)}`;
  });

  return create({
    level,
    defaultMeta: labels,
    format: format.combine(
      format.ms(),
      format.timestamp(),
      correlationFormat({ getCorrelationId, noCorrelationIdValue }),
      logFormat
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.ms(),
          format.timestamp(),
          correlationFormat({ getCorrelationId, noCorrelationIdValue }),
          logFormat
        ),
      }),
    ],
  });
}

function createDevLogger({
  level,
  labels,
  getCorrelationId,
  noCorrelationIdValue,
}: ILoggerParams) {
  return create({
    level,
    defaultMeta: labels,
    format: format.combine(
      format.timestamp(),
      format.ms(),
      format.errors({ stack: true }),
      correlationFormat({ getCorrelationId, noCorrelationIdValue }),
      format.splat(),
      format.json()
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          correlationFormat({ getCorrelationId, noCorrelationIdValue }),
          format.colorize({ all: true }),
          format.padLevels(),
          consoleFormat({
            showMeta: true,
            metaStrip: ["timestamp", "service"],
            inspectOptions: {
              depth: 3,
              colors: true,
              maxArrayLength: 10,
              breakLength: 120,
              compact: Infinity,
            },
          })
        ),
      }),
    ],
  });
}

export function createLogger(params: ICreateLoggerParams) {
  return params.isProduction
    ? createProdLogger(params)
    : createDevLogger(params);
}

export function createDefaultLogger() {
  const NODE_ENV = process.env.NODE_ENV;
  const LOGGING_LEVEL = process.env.LOGGING_LEVEL;
  const SERVICE_NAME = process.env.SERVICE_NAME;

  let isProd = NODE_ENV?.includes("prod");

  const options: ILoggerParams = {
    level: LOGGING_LEVEL,
    labels: {
      serviceName: SERVICE_NAME,
    },
  };

  const defaultLogger = isProd
    ? createProdLogger(options)
    : createDevLogger(options);

  return defaultLogger;
}

const defaultLogger = createDefaultLogger();
export default defaultLogger;
