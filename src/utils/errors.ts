import { isAxiosError } from 'axios';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export class AppError extends Error {
  code: string;
  status?: number;
  userMessage: string;

  constructor(
    message: string,
    options?: { code?: string; status?: number; userMessage?: string },
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options?.code ?? 'unknown_error';
    this.status = options?.status;
    this.userMessage = options?.userMessage ?? message;
  }
}

export function toAppError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const validationErrors =
      typeof error.response?.data === 'object' &&
      error.response?.data &&
      'errors' in error.response.data &&
      typeof (error.response.data as { errors?: unknown }).errors === 'object' &&
      (error.response.data as { errors?: Record<string, unknown> }).errors
        ? (error.response.data as { errors: Record<string, unknown> }).errors
        : undefined;
    const validationMessage = validationErrors
      ? Object.values(validationErrors).reduce<string | undefined>(
          (firstMessage, messages) => {
            if (firstMessage) {
              return firstMessage;
            }

            if (
              Array.isArray(messages) &&
              messages.length > 0 &&
              typeof messages[0] === 'string'
            ) {
              return messages[0];
            }

            return undefined;
          },
          undefined,
        )
      : undefined;
    const responseMessage =
      typeof error.response?.data === 'object' &&
      error.response?.data &&
      'message' in error.response.data
        ? String(error.response.data.message)
        : undefined;

    if (status === 422) {
      console.warn('[API 422 validation]', JSON.stringify(error.response?.data));
    }

    if (status === 401) {
      return new AppError(responseMessage ?? 'Unauthorized', {
        code: 'unauthorized',
        status,
        userMessage:
          responseMessage ?? 'Your session has expired. Please sign in again.',
      });
    }

    return new AppError(
      validationMessage ??
        responseMessage ??
        error.message ??
        DEFAULT_ERROR_MESSAGE,
      {
        code: 'api_error',
        status,
        userMessage:
          status && status >= 500
            ? 'The server is unavailable right now. Please try again in a moment.'
            : (validationMessage ??
              responseMessage ??
              'Unable to complete the request. Check your connection and try again.'),
      },
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      userMessage: error.message || DEFAULT_ERROR_MESSAGE,
    });
  }

  return new AppError(DEFAULT_ERROR_MESSAGE, {
    userMessage: DEFAULT_ERROR_MESSAGE,
  });
}
