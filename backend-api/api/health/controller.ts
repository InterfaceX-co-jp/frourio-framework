import { defineController } from './$relay';
import { ApiResponse } from '$/@frouvel/kaname/http/ApiResponse';

export default defineController(() => ({
  get: () => ApiResponse.success('OK'),
}));
