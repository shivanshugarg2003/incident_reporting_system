import { useState } from 'react'
import axios from 'axios'
import { Calendar } from 'lucide-react'

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

const SOURCE_TYPE_OPTIONS = ['Email', 'Portal', 'PDF Upload']

const inputClassName =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'

const labelClassName = 'mb-1 block text-sm font-normal text-gray-600'

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

    setErrors((prev) => ({ ...prev, [field]: '' }))

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

  const isFormValid =
    validateReporterName(formData.reporterName) === '' &&
    validateSourceType(formData.sourceType) === '' &&
    validateIncidentDate(formData.incidentDate) === '' &&
    validateDescription(formData.description) === ''

  const isSubmitDisabled = isSubmitting || !isFormValid

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
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border border-gray-200 bg-white px-8 py-8">
        {submitStatus === 'success' && (
          <div
            className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800"
            role="status"
          >
            Ticket submitted successfully!
          </div>
        )}

        {submitStatus === 'error' && (
          <div
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Incident Report Form
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            To report an incident please fill out the form below to submit your
            request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reporterName" className={labelClassName}>
              Reporter Name
            </label>
            <input
              id="reporterName"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Shivanshu Garg"
              value={formData.reporterName}
              onChange={(e) => handleChange('reporterName', e.target.value)}
              onBlur={() => handleBlur('reporterName')}
              className={inputClassName}
            />
            {errors.reporterName && (
              <p className="mt-1 text-sm text-red-600">{errors.reporterName}</p>
            )}
          </div>

          <div>
            <span id="sourceType-label" className={labelClassName}>
              Source Type
            </span>
            <div
              className="flex flex-wrap gap-6"
              role="radiogroup"
              aria-labelledby="sourceType-label"
            >
              {SOURCE_TYPE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="sourceType"
                    value={option}
                    checked={formData.sourceType === option}
                    onChange={(e) => handleChange('sourceType', e.target.value)}
                    onBlur={() => handleBlur('sourceType')}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.sourceType && (
              <p className="mt-1 text-sm text-red-600">{errors.sourceType}</p>
            )}
          </div>

          {formData.sourceType && fileConfig && (
            <div>
              <label htmlFor="attachment" className={labelClassName}>
                {fileConfig.label}
              </label>
              <input
                key={fileInputKey}
                id="attachment"
                type="file"
                accept={fileConfig.accept}
                onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                {fileConfig.helperText}
              </p>
              {formData.attachmentFilename && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected: {formData.attachmentFilename}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="incidentDate" className={labelClassName}>
              Incident Date
            </label>
            <div className="relative">
              <input
                id="incidentDate"
                type="date"
                required
                max={today}
                value={formData.incidentDate}
                onChange={(e) => handleChange('incidentDate', e.target.value)}
                onBlur={() => handleBlur('incidentDate')}
                className={`incident-date-input ${inputClassName} relative pr-10`}
              />
              <Calendar
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </div>
            {errors.incidentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.incidentDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="description"
              required
              minLength={10}
              maxLength={2000}
              rows={7}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={inputClassName}
            />
            <p className="mt-1 text-right text-sm text-gray-500">
              {charCount} / 2000
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting && (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default IncidentForm
