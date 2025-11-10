import Hospital from '../models/hospitalModel.js'

// Get all hospitals
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
    res.json(hospitals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get one hospital
export const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' })
    }
    res.json(hospital)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create hospital
export const createHospital = async (req, res) => {
  try {
    const newHospital = await Hospital.create(req.body)
    res.status(201).json(newHospital)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Update hospital
export const updateHospital = async (req, res) => {
  try {
    const updatedHospital = await Hospital.updateById(req.params.id, req.body)
    if (!updatedHospital) return res.status(404).json({ message: 'Hospital not found' })
    res.json(updatedHospital)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete hospital
export const deleteHospital = async (req, res) => {
  try {
    const deleted = await Hospital.deleteById(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Hospital not found' })
    res.json({ message: 'Hospital deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Add doctor to hospital
export const addDoctorToHospital = async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.params
    const hospital = await Hospital.findById(hospitalId)
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' })
    }

    hospital.doctors = hospital.doctors || []
    if (!hospital.doctors.includes(doctorId)) {
      hospital.doctors.push(doctorId)
      await Hospital.updateById(hospitalId, { doctors: hospital.doctors })
    }

    const updated = await Hospital.findById(hospitalId)
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}