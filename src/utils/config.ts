import Conf from "conf";

const config = new Conf({
  projectName: "prismy-cli",
  schema: {
    apiKey: {
      type: "string",
      description: "API key for Prismy service",
    },
  },
});

export default config;
