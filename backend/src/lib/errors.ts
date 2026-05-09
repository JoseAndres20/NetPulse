// Error de dominio con código HTTP incluido
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static notFound(resource: string, id: string): AppError {
    return new AppError(`${resource} '${id}' not found`, 404)
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400)
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500)
  }
}

// Tipado del error para el response JSON
export interface ErrorResponse {
  error: string
  statusCode: number
}
