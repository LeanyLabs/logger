## Usage

You have two ways to use the lib:

1.  With default env variables name (which are: LOGGING_LEVEL, SERVICE_NAME and isProd which depends on NODE_ENV either including partial string 'prod' or not), the values of the variables must be defined in your process enviroment

```js
const { logger } = require("@leanylabs/logger");

logger.info("hello world");
```

2.  Pass the needed variables manually into initially imported function 'createLogger' and then by means of in create the logger itself

```js
const { createLogger } = require("@leanylabs/logger");

const logger = createLogger({
  isProduction: false,
  level: "silly",
  labels: {
    serviceName: "test",
  },
});
```
