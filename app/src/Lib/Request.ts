import { config } from "../Config";
import { getToken } from "./Auth";

type SuccessResponse<Data = any> = {
  status: "success";
  data: Data;
};

type ErrorResponse = {
  status: "error";
  code: number;
  message: string;
  details: Record<string, unknown>;
};

type ApiResponse<Data> = SuccessResponse<Data> | ErrorResponse;

export const api = {
  /**
   * Perform a post request against given resource.
   *
   * @param endpoint - API endpoint to call.
   * @param data     - Data to submit.
   *
   * @returns Response
   */
  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return api.send(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },

  /**
   * Perform a get request against given resource.
   *
   * @param endpoint - API endpoint to call.
   *
   * @returns Response
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return api.send(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  /**
   * Perform a put request against given resource.
   *
   * @param endpoint - API endpoint to call.
   * @param data     - Data to submit.
   *
   * @returns Response
   */
  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return api.send(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },

  /**
   * Perform a delete request against given resource.
   *
   * @param endpoint - API endpoint to call.
   *
   * @returns Response
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return api.send(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  /**
   * Perform a SWR resource request.
   *
   * @param endpoint - API endpoint to call.
   *
   * @returns Data
   */
  async swr(endpoint: string): Promise<any> {
    const res = await api.get(endpoint);
    switch (res.status) {
      case "error": {
        throw new Error(res.message);
      }
      case "success": {
        return res.data;
      }
    }
  },

  /**
   * Send http/s request to the api.
   *
   * @param endpoint - Endpoint to call.
   * @param init     - RequestInit
   *
   * @returns Response
   */
  async send<T = any>(endpoint: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = getToken();
      if (token) {
        init = {
          ...init,
          headers: {
            ...(init.headers || {}),
            authorization: `Bearer ${token}`
          }
        };
      }
      return await fetcher(`${config.api.uri}${endpoint}`, init);
    } catch (err) {
      return {
        status: "error",
        code: 500,
        message: err.message,
        details: {}
      };
    }
  }
};

/**
 * Fetch wrapper that automatically handles the request and returns resulting JSON.
 *
 * @param input - RequestInfo.
 * @param init  - RequestInit.
 *
 * @returns Response
 */
export async function fetcher(input: RequestInfo, init?: RequestInit): Promise<any> {
  return fetch(input, init).then((r) => r.json());
}
