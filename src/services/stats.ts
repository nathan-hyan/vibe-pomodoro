import { create } from "apisauce";
import API_URL from "../utils/getApiUrl";
import type { Stats } from "../types/stats";

const api = create({
  baseURL: `${API_URL}/stats`,
});

export const statsApi = {
  getStats: () => api.get<Stats>(""),
  updateStats: (updates: Partial<Stats>) => api.patch<Stats>("", updates),
};

export default api;
