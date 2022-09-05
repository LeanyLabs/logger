import { createLogger } from "../src";

describe("logger", () => {
  it("should log with correlation id", async () => {
    const logger = createLogger({
      isProduction: true,
      loggingLevel: "debug",
      serviceName: "test",
      getCorrelationId: () => {
        return "test-correlation-id";
      },
    });

    logger.info("log message");
  });
});
