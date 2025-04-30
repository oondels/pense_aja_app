import { ip } from "../config/ip.js"
import axios from "axios"

export const authApi = axios.create({
  baseURL: `${ip}:2399`,
  withCredentials: true
})

export const api = axios.create({
  baseURL: `${ip}:2512`,
  withCredentials: true
})