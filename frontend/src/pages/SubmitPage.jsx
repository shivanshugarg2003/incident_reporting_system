import IncidentForm from '../components/IncidentForm'

/**
 * Page for submitting a new incident report.
 *
 * @returns {import('react').JSX.Element} Submit incident page
 */
function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800">Report an Incident</h1>
      <p className="mt-2 text-slate-600">
        Fill in the details below to submit a new incident ticket
      </p>
      <div className="mt-8">
        <IncidentForm />
      </div>
    </div>
  )
}

export default SubmitPage
