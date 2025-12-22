export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Identifica errores controlados vs bugs inesperados

    // Captura el stack trace para saber dónde ocurrió (útil en desarrollo)
    Error.captureStackTrace(this, this.constructor);
  }
}
