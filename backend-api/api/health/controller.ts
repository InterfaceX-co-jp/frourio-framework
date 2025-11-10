import { defineController } from './$relay';
import { ApiResponse } from '$/app/http/ApiResponse';

export default defineController(() => ({
  get: () => ApiResponse.success('OK'),
}));
