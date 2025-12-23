import { defaultWithoutAuthApiClient } from '@/utils/apiClient'
import { toast } from 'react-toastify'
import { handleApiResponse, displayValidationErrors } from '@/utils/apiErrorHandler'

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

  // Example: Success response
  const handleSuccessExample = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$get()

      console.log('Success response:', response)
      toast.success(`Success: ${response.message}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Not Found Error (using handleApiResponse)
  const handleNotFoundExample = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$post({
        body: {
          simulateNotFound: true,
          resourceId: '123',
        },
      })

      handleApiResponse(response, {
        onSuccess: (data) => {
          toast.success(`Success: ${data.message}`)
        },
        // Error is automatically handled with toast and console.error
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Validation Error (using displayValidationErrors)
  const handleValidationExample = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$post({
        body: {
          simulateValidation: true,
        },
      })

      handleApiResponse(response, {
        onSuccess: (data) => {
          toast.success(`Success: ${data.message}`)
        },
        onError: (error) => {
          // Try to display validation errors
          const hasValidationErrors = displayValidationErrors(error)

          // If no validation errors, just show the error detail
          if (!hasValidationErrors) {
            toast.error(`${error.title}: ${error.detail}`)
          }
        },
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Unauthorized Error (with custom error handling)
  const handleUnauthorizedExample = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$post({
        body: {
          simulateUnauthorized: true,
        },
      })

      handleApiResponse(response, {
        onSuccess: (data) => {
          toast.success(`Success: ${data.message}`)
        },
        onError: (error) => {
          // Custom handling for unauthorized errors
          if (error.code === 'UNAUTHORIZED') {
            console.log('Auth error reason:', (error as any).reason)
            // In real app, might redirect to login
          }
        },
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Bad Request (simplified with handleApiResponse)
  const handleBadRequestExample = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$put({
        body: {
          // name is missing (required)
        },
      })

      handleApiResponse(response, {
        successMessage: (data) => `Success: ${data.message}`,
        // Error automatically handled with console.error and toast
        // Additional fields like 'field' are logged automatically
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Validator facade with valid data
  const handleValidationSuccess = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$patch({
        body: {
          name: '山田太郎',
          description: 'テストユーザー',
          email: 'yamada@example.com',
          age: 25,
          siteAreaSquareMeter: 100.5,
          minCapacity: 10,
        },
      })

      handleApiResponse(response, {
        successMessage: 'バリデーション成功！データが更新されました',
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Validator facade with validation errors
  const handleValidationErrors = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$patch({
        body: {
          name: '', // Invalid: empty
          email: 'invalid-email', // Invalid: not email format
          age: -5, // Invalid: negative
          minCapacity: 0, // Invalid: must be positive
        } as any,
      })

      handleApiResponse(response, {
        onError: (error) => {
          displayValidationErrors(error, {
            showToast: true,
            toastPrefix: 'バリデーションエラー',
          })
        },
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  // Example: Validator facade with business logic error (age < 18)
  const handleBusinessLogicError = async () => {
    try {
      const response = await defaultWithoutAuthApiClient.example.error.rfc9457.$patch({
        body: {
          name: '未成年ユーザー',
          email: 'minor@example.com',
          age: 16, // Valid format but < 18
          minCapacity: 5,
        },
      })

      handleApiResponse(response, {
        successMessage: '更新成功',
      })
    } catch (error) {
      console.error('Request error:', error)
      toast.error('Request failed!')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleHealthcheck} style={{ marginRight: '10px' }}>
          Healthcheck
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>RFC9457 Examples (Using Error Handler)</h2>
        <p>Open the browser console to see automatic error logging with additional fields</p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleSuccessExample}>✅ Success Response</button>

          <button onClick={handleNotFoundExample}>🔍 404 Not Found Error</button>

          <button onClick={handleValidationExample}>⚠️ Validation Error</button>

          <button onClick={handleUnauthorizedExample}>🔒 Unauthorized Error</button>

          <button onClick={handleBadRequestExample}>❌ Bad Request Error</button>
        </div>
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h2>Validator Facade Examples (Backend PATCH endpoint)</h2>
        <p>Examples using the Laravel-inspired Validator facade with Zod</p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleValidationSuccess}>✅ Valid Data (Success)</button>

          <button onClick={handleValidationErrors}>❌ Invalid Data (Validation Errors)</button>

          <button onClick={handleBusinessLogicError}>🚫 Valid but Age &lt; 18 (Business Logic Error)</button>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <h3>Error Handler Features:</h3>
        <ul>
          <li>
            <code>handleApiResponse()</code> - Automatic error handling with toasts
          </li>
          <li>
            <code>displayValidationErrors()</code> - Parse validation errors
          </li>
          <li>
            <code>Validator</code> - Laravel-inspired validation facade
          </li>
          <li>Automatic console logging with additional fields</li>
          <li>TypeScript type safety throughout</li>
        </ul>
        <p>Check console for detailed error information!</p>
      </div>
    </div>
  )
}
