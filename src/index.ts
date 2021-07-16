import { createLogger as create, format, transports } from "winston";
import { consoleFormat } from "winston-console-format";

interface defaultLoggerParams {
  LOGGING_LEVEL?: string;
  SERVICE_NAME?: string;
}

interface createLoggerParams {
  production: boolean;
  loggingLevel?: string;
  serviceNeme?: string;
}

const NODE_ENV = process.env.NODE_ENV;
const LOGGING_LEVEL = process.env.LOGGING_LEVEL;
const SERVICE_NAME = process.env.SERVICE_NAME;

let isProd = NODE_ENV?.includes("prod");

function createProdLogger({ LOGGING_LEVEL }: defaultLoggerParams) {
  return create({
    level: LOGGING_LEVEL,
    format: format.combine(
      format.timestamp(),
      format.ms(),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [new transports.Console()],
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
  production,
  loggingLevel,
  serviceNeme,
}: createLoggerParams) {
  return production
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
