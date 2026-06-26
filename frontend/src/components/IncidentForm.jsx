import { useState } from 'react'
import axios from 'axios'

const EMPTY_FORM_DATA = {
  reporterName: '',
  sourceType: '',
  incidentDate: '',
  description: '',
  attachmentFilename: '',
}

const EMPTY_ERRORS = {
  reporterName: '',
  sourceType: '',
  incidentDate: '',
  description: '',
  attachmentFilename: '',
}

const FILE_UPLOAD_CONFIG = {
  Email: {
    label: 'Attach Email File',
    accept: '.eml,.msg,.pdf',
    helperText: 'Accepted formats: .eml .msg .pdf',
  },
  Portal: {
    label: 'Attach Portal Screenshot',
    accept: '.png,.jpg,.jpeg,.webp',
    helperText: 'Accepted formats: .png .jpg .jpeg .webp',
  },
  'PDF Upload': {
    label: 'Attach PDF Document',
    accept: '.pdf',
    helperText: 'Accepted formats: .pdf',
  },
}

/**
 * Incident report submission form with field validation and API integration.
 *
 * @returns {import('react').JSX.Element} Incident submission form
 */
function IncidentForm() {
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState(EMPTY_FORM_DATA)
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [fileInputKey, setFileInputKey] = useState(0)

  const validateReporterName = (value) => {
    if (!value.trim()) return 'Reporter name is required'
    if (value.trim().length < 2) return 'Must be at least 2 characters'
    return ''
  }

  const validateSourceType = (value) => {
    if (!value) return 'Please select a source type'
    return ''
  }

  const validateIncidentDate = (value) => {
    if (!value) return 'Incident date is required'
    if (value > today) return 'Date cannot be in the future'
    return ''
  }

  const validateDescription = (value) => {
    if (!value.trim()) return 'Description is required'
    if (value.trim().length < 10) return 'Description must be at least 10 characters'
    return ''
  }

  const handleBlur = (field) => {
    const validators = {
      reporterName: () => validateReporterName(formData.reporterName),
      sourceType: () => validateSourceType(formData.sourceType),
      incidentDate: () => validateIncidentDate(formData.incidentDate),
      description: () => validateDescription(formData.description),
    }

    if (validators[field]) {
      setErrors((prev) => ({ ...prev, [field]: validators[field]() }))
    }
  }

  const handleChange = (field, value) => {
    if (field === 'description') {
      setCharCount(value.length)
    }

    if (field === 'sourceType') {
      setFormData((prev) => ({
        ...prev,
        sourceType: value,
        attachmentFilename: '',
      }))
      setFileInputKey((prev) => prev + 1)
      return
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const filename = e.target.files[0]?.name ?? ''
    setFormData((prev) => ({ ...prev, attachmentFilename: filename }))
  }

  const validateAll = () => {
    const newErrors = {
      reporterName: validateReporterName(formData.reporterName),
      sourceType: validateSourceType(formData.sourceType),
      incidentDate: validateIncidentDate(formData.incidentDate),
      description: validateDescription(formData.description),
      attachmentFilename: '',
    }

    setErrors(newErrors)

    return !Object.values(newErrors).some((message) => message !== '')
  }

  const isSubmitDisabled =
    isSubmitting ||
    !formData.reporterName ||
    !formData.sourceType ||
    !formData.incidentDate ||
    !formData.description ||
    Object.values(errors).some((message) => message !== '')

  const fileConfig = formData.sourceType
    ? FILE_UPLOAD_CONFIG[formData.sourceType]
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus(null)
    setSubmitError('')

    if (!validateAll()) return

    setIsSubmitting(true)

    try {
      await axios.post('/tickets', {
        reporter_name: formData.reporterName,
        source_type: formData.sourceType,
        incident_date: formData.incidentDate,
        description: formData.description,
        attachment_filename: formData.attachmentFilename || null,
      })

      setSubmitStatus('success')
      setFormData(EMPTY_FORM_DATA)
      setErrors(EMPTY_ERRORS)
      setCharCount(0)
      setFileInputKey((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitStatus('error')
      setSubmitError(
        error.response?.data?.error ||
          'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitStatus === 'success' && (
        <div
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800"
          role="status"
        >
          Ticket submitted successfully!
        </div>
      )}

      {submitStatus === 'error' && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="reporterName"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Reporter Name
        </label>
        <input
          id="reporterName"
          type="text"
          required
          minLength={2}
          maxLength={100}
          value={formData.reporterName}
          onChange={(e) => handleChange('reporterName', e.target.value)}
          onBlur={() => handleBlur('reporterName')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.reporterName && (
          <p className="mt-1 text-sm text-red-600">{errors.reporterName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="sourceType"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Source Type
        </label>
        <select
          id="sourceType"
          required
          value={formData.sourceType}
          onChange={(e) => handleChange('sourceType', e.target.value)}
          onBlur={() => handleBlur('sourceType')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            -- Select source type --
          </option>
          <option value="Email">Email</option>
          <option value="Portal">Portal</option>
          <option value="PDF Upload">PDF Upload</option>
        </select>
        {errors.sourceType && (
          <p className="mt-1 text-sm text-red-600">{errors.sourceType}</p>
        )}
      </div>

      {formData.sourceType && fileConfig && (
        <div>
          <label
            htmlFor="attachment"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {fileConfig.label}
          </label>
          <input
            key={fileInputKey}
            id="attachment"
            type="file"
            accept={fileConfig.accept}
            onChange={handleFileChange}
            className="w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-slate-500">{fileConfig.helperText}</p>
          {formData.attachmentFilename && (
            <p className="mt-1 text-sm text-slate-600">
              Selected: {formData.attachmentFilename}
            </p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="incidentDate"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Incident Date
        </label>
        <input
          id="incidentDate"
          type="date"
          required
          max={today}
          value={formData.incidentDate}
          onChange={(e) => handleChange('incidentDate', e.target.value)}
          onBlur={() => handleBlur('incidentDate')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.incidentDate && (
          <p className="mt-1 text-sm text-red-600">{errors.incidentDate}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-sm text-slate-500">
          {charCount} / 2000
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting && (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden="true"
          />
        )}
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}

export default IncidentForm
