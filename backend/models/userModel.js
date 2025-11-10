// User model for DocEase authentication system
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '..', 'data', 'users.json')

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

const sanitize = (user) => {
  if (!user) return null
  const copy = { ...user }
  delete copy.password
  delete copy.tempPassword
  return copy
}

export const findOne = async (filter = {}) => {
  const users = readData()
  return users.find(u => Object.keys(filter).every(k => u[k] === filter[k])) || null
}

export const findOneWithPassword = async (filter = {}) => {
  const users = readData()
  return users.find(u => Object.keys(filter).every(k => u[k] === filter[k])) || null
}

export const findById = async (id) => {
  const users = readData()
  return users.find(u => u._id === id) || null
}

export const create = async (payload) => {
  const users = readData()
  const now = new Date().toISOString()
  const user = {
    _id: payload._id || generateId(),
    name: payload.name,
    email: payload.email,
    role: payload.role,
    hospitalId: payload.hospitalId || undefined,
    firstLogin: payload.firstLogin || false,
    tempPassword: payload.tempPassword || undefined,
    createdAt: now,
    updatedAt: now
  }
  // Hash password if provided
  if (payload.password) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(payload.password, salt)
  }
  users.push(user)
  writeData(users)
  return sanitize(user)
}

export const countDocuments = async (filter = {}) => {
  const users = readData()
  return users.filter(u => Object.keys(filter).every(k => u[k] === filter[k])).length
}

export const find = async (filter = {}) => {
  const users = readData()
  if (!filter || Object.keys(filter).length === 0) return users.map(u => sanitize(u))
  return users.filter(u => Object.keys(filter).every(k => {
    const v = filter[k]
    if (v && typeof v === 'object' && v.$gte) {
      return new Date(u[k]) >= new Date(v.$gte)
    }
    return u[k] === v
  })).map(u => sanitize(u))
}

export const updateById = async (id, update = {}) => {
  const users = readData()
  const idx = users.findIndex(u => u._id === id)
  if (idx === -1) return null
  const user = users[idx]
  if (update.password) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(update.password, salt)
    delete update.password
  }
  Object.assign(user, update, { updatedAt: new Date().toISOString() })
  users[idx] = user
  writeData(users)
  return sanitize(user)
}

export const deleteById = async (id) => {
  let users = readData()
  const exists = users.some(u => u._id === id)
  users = users.filter(u => u._id !== id)
  writeData(users)
  return exists
}

export default {
  findOne,
  findOneWithPassword,
  findById,
  create,
  countDocuments,
  find,
  updateById,
  deleteById
}
