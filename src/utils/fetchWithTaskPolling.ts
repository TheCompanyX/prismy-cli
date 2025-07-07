import fetch from "node-fetch";

interface TaskResponse {
  taskId: string;
}

interface CompletedTaskResponse {
  status: "completed" | "pending" | "partial-result";
  result?: {
    statusCode: number;
    data: unknown;
  };
}

const isTaskResponse = (res: unknown): res is TaskResponse =>
  typeof res === "object" && res !== null && "taskId" in res;

/**
 * Fetch-like wrapper that handles background tasks.
 * @param baseUrl - The base URL of the API.
 * @param endpoint - The endpoint to fetch.
 * @param init - Fetch-like request options.
 * @param partialAnswer - A function to handle partial results.
 * @returns A promise resolving to a fetch-like response.
 */
async function fetchWithTaskPolling(
  baseUrl: string,
  endpoint: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
  partialAnswer?: (a: Response) => void
): Promise<Response> {
  try {
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: init?.method || "GET",
      headers: init?.headers,
      body: init?.body,
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();

    if (isTaskResponse(data)) {
      const result = await pollBackgroundTask(
        data.taskId,
        baseUrl,
        init?.headers || {},
        partialAnswer
      );
      return result;
    }

    return createFetchResponse(data, response.status, response.statusText);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}

/**
 * Polls the background task until completion.
 * @param taskId - The task ID.
 * @returns A promise resolving to the task result.
 */
async function pollBackgroundTask(
  taskId: string,
  baseUrl: string,
  headers: Record<string, string>,
  partialAnswer?: (a: Response) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const interval = 1000; // Poll every 2s
    const maxRetries = 60; // Timeout after 60s
    let attempts = 0;
    let partialAnswerExecuted = false;

    const checkTask = async () => {
      try {
        const response = await fetch(`${baseUrl}/background-task-cli/${taskId}`, {
          headers,
        });

        if (!response.ok) {
          throw response;
        }

        const data = (await response.json()) as CompletedTaskResponse;

        if (data.status === "completed") {
          if (data.result?.statusCode === 200) {
            const successResponse = createFetchResponse(
              data.result.data,
              data.result.statusCode,
              "ok"
            );
            resolve(successResponse);
          } else {
            const errorResponse = createFetchResponse(
              data.result,
              data.result?.statusCode || 500,
              data.result?.data as string
            );
            reject(errorResponse);
          }
          return;
        }

        if (data.status === "partial-result" && partialAnswer && !partialAnswerExecuted) {
          const partialResponse = createFetchResponse(
            data.result?.data,
            data.result?.statusCode || 500,
            "ok"
          );
          partialAnswer(partialResponse);
          partialAnswerExecuted = true;
        }

        attempts++;
        if (attempts >= maxRetries) {
          reject(createFetchResponse(null, 408, "Task polling timed out"));
          return;
        }

        setTimeout(checkTask, interval);
      } catch (error) {
        if (error instanceof Response) {
          reject(error);
        } else {
          reject(
            createFetchResponse(null, 500, error instanceof Error ? error.message : "Unknown error")
          );
        }
      }
    };

    checkTask();
  });
}

/**
 * Creates a fetch-like Response object.
 * @param data - Response body data.
 * @param status - HTTP status code.
 * @param statusText - HTTP status text.
 * @returns A Response-like object.
 */
function createFetchResponse(data: unknown, status: number, statusText: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" },
  });
}

export default fetchWithTaskPolling;
