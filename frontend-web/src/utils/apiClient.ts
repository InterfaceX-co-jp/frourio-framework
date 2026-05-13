import aspida from '@aspida/axios'
import axios from 'axios'
import api from '../../../backend-api/api/$api'
import { adminAuthStateInSessionStorage, userAuthStateInSessionStorage } from './sessionStorage'
import { API_ORIGIN, API_BASE_PATH } from '@/env'

const defaultWithoutAuthAxiosInstance = axios.create({
  baseURL: `${API_ORIGIN}${API_BASE_PATH}`,
})
const adminAxiosInstance = axios.create({
  baseURL: `${API_ORIGIN}${API_BASE_PATH}`,
})
const userAxiosInstance = axios.create({
  baseURL: `${API_ORIGIN}${API_BASE_PATH}`,
})

adminAxiosInstance.interceptors.request.use(async (config) => {
  const token = adminAuthStateInSessionStorage.get().token

  config.headers.Authorization = `Bearer ${token}`

  return config
})

userAxiosInstance.interceptors.request.use(async (config) => {
  const token = userAuthStateInSessionStorage.get().token

  config.headers.Authorization = `Bearer ${token}`

  return config
})

export const defaultWithoutAuthApiClient = api(aspida(defaultWithoutAuthAxiosInstance))
export const adminApiClient = api(aspida(adminAxiosInstance))
export const userApiClient = api(aspida(userAxiosInstance))
