import { ip } from "../config/ip.js"
import axios from "axios"

export const authApi = axios.create({
  baseURL: ip,
  withCredentials: true
})

export const api = axios.create({
  baseURL: ip,
  withCredentials: true
})