const SpecialistMatchRequest = require('../models/SpecialistMatchRequest');
const ProviderApplication = require('../models/ProviderApplication');

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

async function saveSpecialistMatchRequest(body) {
  const submitterName = (body.submitterName || body.name || '').trim();
  const submitterEmail = (body.submitterEmail || body.email || '').trim();
  const doctorName = (body.doctorName || '').trim();
  const specialty = (body.specialty || '').trim();
  const location = (body.location || '').trim();
  const details = (body.details || body.description || '').trim();

  if (!doctorName) throw new Error('Doctor name is required');
  if (!specialty) throw new Error('Specialty is required');
  if (!location) throw new Error('Location is required');
  if (submitterEmail && !isValidEmail(submitterEmail)) {
    throw new Error('Please provide a valid email address');
  }

  const record = await SpecialistMatchRequest.create({
    submitterName,
    submitterEmail,
    doctorName,
    specialty,
    location,
    details,
  });

  return {
    success: true,
    message: 'Thank you! We have received your specialist suggestion.',
    requestId: String(record._id),
  };
}

async function saveProviderApplication(body) {
  const name = (body.name || '').trim();
  const specialty = (body.specialty || '').trim();
  const description = (body.description || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();

  if (!name) throw new Error('Name is required');
  if (!specialty) throw new Error('Specialty is required');
  if (!description) throw new Error('Description is required');
  if (email && !isValidEmail(email)) {
    throw new Error('Please provide a valid email address');
  }

  const record = await ProviderApplication.create({
    name,
    specialty,
    description,
    email,
    phone,
  });

  return {
    success: true,
    message: 'Thank you for your interest in joining OvaCare. We will be in touch soon.',
    requestId: String(record._id),
  };
}

module.exports = {
  saveSpecialistMatchRequest,
  saveProviderApplication,
};
