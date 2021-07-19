import { createLogger as create, format, transports } from "winston";
import { consoleFormat } from "winston-console-format";

interface defaultLoggerParams {
  LOGGING_LEVEL?: string;
  SERVICE_NAME?: string;
}

interface createLoggerParams {
  isProduction: boolean;
  loggingLevel?: string;
  serviceNeme?: string;
}

const NODE_ENV = process.env.NODE_ENV;
const LOGGING_LEVEL = process.env.LOGGING_LEVEL;
const SERVICE_NAME = process.env.SERVICE_NAME;

let isProd = NODE_ENV?.includes("prod");

function createProdLogger({ LOGGING_LEVEL }: defaultLoggerParams) {
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
    level: LOGGING_LEVEL,
    format: format.combine(format.ms(), format.timestamp(), logFormat),
    transports: [
      new transports.Console({
        format: format.combine(format.ms(), format.timestamp(), logFormat),
      }),
    ],
  });
}

function createDevLogger({ LOGGING_LEVEL, SERVICE_NAME }: defaultLoggerParams) {
  return create({
    level: LOGGING_LEVEL,
    format: format.combine(
      format.timestamp(),
      format.ms(),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: SERVICE_NAME },
    transports: [
      new transports.Console({
        format: format.combine(
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

export function createLogger({
  isProduction,
  loggingLevel,
  serviceNeme,
}: createLoggerParams) {
  return isProduction
    ? createProdLogger({ LOGGING_LEVEL: loggingLevel })
    : createDevLogger({
        SERVICE_NAME: serviceNeme,
        LOGGING_LEVEL: loggingLevel,
      });
}

export const logger = isProd
  ? createProdLogger({ LOGGING_LEVEL })
  : createDevLogger({ SERVICE_NAME, LOGGING_LEVEL });
export default logger;
