import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Please check that and try again.',
      issues: error.issues.map((issue) => issue.message),
    });
    return;
  }
  const message = error instanceof Error ? error.message : 'request failed';
  if (!/api[_-]?key|secret|bearer/i.test(message)) {
    console.error(message);
  } else {
    console.error('Request failed');
  }
  if (res.headersSent) return;
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
