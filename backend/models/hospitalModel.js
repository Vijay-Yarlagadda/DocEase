import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '..', 'data', 'hospitals.json')

const readData = () => {
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    return []
  }
}

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8')
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const find = async (filter = {}) => {
  const hospitals = readData()
  if (!filter || Object.keys(filter).length === 0) return hospitals
  return hospitals.filter(h => Object.keys(filter).every(k => h[k] === filter[k]))
}

export const findById = async (id) => {
  const hospitals = readData()
  return hospitals.find(h => h._id === id) || null
}

export const create = async (payload) => {
  const hospitals = readData()
  const now = new Date().toISOString()
  const hospital = {
    _id: generateId(),
    name: payload.name,
    address: payload.address || {},
    contact: payload.contact || {},
    specialties: payload.specialties || [],
    facilities: payload.facilities || [],
    admins: payload.admins || [],
    doctors: payload.doctors || [],
    createdAt: now,
    updatedAt: now
  }
  hospitals.push(hospital)
  writeData(hospitals)
  return hospital
}

export const updateById = async (id, update = {}) => {
  const hospitals = readData()
  const idx = hospitals.findIndex(h => h._id === id)
  if (idx === -1) return null
  const hospital = hospitals[idx]
  Object.assign(hospital, update, { updatedAt: new Date().toISOString() })
  hospitals[idx] = hospital
  writeData(hospitals)
  return hospital
}

export const deleteById = async (id) => {
  let hospitals = readData()
  const exists = hospitals.some(h => h._id === id)
  hospitals = hospitals.filter(h => h._id !== id)
  writeData(hospitals)
  return exists
}

export default {
  find,
  findById,
  create,
  updateById,
  deleteById
}