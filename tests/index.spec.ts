import { createLogger } from "../src";

describe("logger", () => {
  it("should log with correlation id", async () => {
    const logger = createLogger({
      isProduction: true,
      level: "debug",
      labels: { serviceName: "test" },
      getCorrelationId: () => {
        return "test-correlation-id";
      },
    });

    logger.info("log message");
  });
});
