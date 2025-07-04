import inquirer from "inquirer";
import config from "../utils/config.js";
import { Logger } from "../utils/logger.js";

export class AuthService {
  static async getApiKey(): Promise<string> {
    let apiKey = config.get("apiKey") as string;

    if (!apiKey) {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "apiKey",
          message: "Enter your Prismy API key:",
          validate: (input: string) => input.trim().length > 0 || "API key is required",
        },
      ]);

      apiKey = answer.apiKey.trim();
      config.set("apiKey", apiKey);
      Logger.success("API key saved");
    }

    return apiKey;
  }

  static setApiKey(apiKey: string): void {
    config.set("apiKey", apiKey);
    Logger.success("API key updated successfully");
  }

  static showApiKey(): void {
    const key = config.get("apiKey") as string;
    if (key) {
      Logger.info(`Stored API Key: ${key}`);
    } else {
      Logger.error("No API key stored");
      Logger.info("Usage: prismy auth <your-api-key>");
    }
  }

  static resetApiKey(): void {
    config.delete("apiKey");
    Logger.success("API key has been reset");
  }
}
