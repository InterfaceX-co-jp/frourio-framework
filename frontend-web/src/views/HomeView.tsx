import { defaultWithoutAuthApiClient } from '@/utils/apiClient'
import { toast } from 'react-toastify'

export default function HomeView() {
  const handleHealthcheck = () => {
    defaultWithoutAuthApiClient.health
      .$get()
      .then((response) => {
        console.log('Healthcheck response:', response)
        toast.success('Healthcheck successful!')
      })
      .catch((error) => {
        console.error('Healthcheck error:', error)
        toast.error('Healthcheck failed!')
      })
  }

  return (
    <div>
      <button onClick={handleHealthcheck}>Healthcheck</button>
    </div>
  )
}
