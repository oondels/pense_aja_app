import ip from "../config/ip.js"
import { attachInterceptors} from "./interceptors/interceptors.js"

export const authApi = axios.create({
  baseURL: `${ip}:2399`,
  withCredentials: true
})

export const api = axios.create({
  baseURL: `${ip}:2512`,
  withCredentials: true
})

attachInterceptors(api, authApi);