import { create } from "apisauce";
import API_URL from "../utils/getApiUrl";

const api = create({
  baseURL: `${API_URL}/stats`,
});

export default api;
