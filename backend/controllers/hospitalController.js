import Hospital from '../models/hospitalModel.js'

// Get all hospitals
export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('admins', 'name email')
      .populate('doctors', 'name email')
    res.json(hospitals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get one hospital
export const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('admins', 'name email')
      .populate('doctors', 'name email')
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
    const hospital = new Hospital(req.body)
    const newHospital = await hospital.save()
    res.status(201).json(newHospital)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Update hospital
export const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' })
    }

    Object.assign(hospital, req.body)
    const updatedHospital = await hospital.save()
    res.json(updatedHospital)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete hospital
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' })
    }
    await hospital.remove()
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

    if (!hospital.doctors.includes(doctorId)) {
      hospital.doctors.push(doctorId)
      await hospital.save()
    }

    res.json(hospital)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}