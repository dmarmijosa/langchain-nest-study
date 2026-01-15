import { HttpStatus, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { from, map } from 'rxjs';

type SseFormatter<T> = (chunk: T) => object | null;

@Injectable()
export class SseService {
  /**
   * Streams an AsyncIterable as Server-Sent Events (SSE).
   * Handles headers, serialization, errors, and client disconnects.
   */
  pipe<T>(
    res: Response,
    stream: AsyncIterable<T>,
    format: SseFormatter<T>,
  ): void {
    this.configureHeaders(res);

    const subscription = from(stream)
      .pipe(
        map((chunk) => {
          const payload = format(chunk);
          if (payload === null || payload === undefined) return null;
          return `data: ${JSON.stringify(payload)}\n\n`;
        }),
      )
      .subscribe({
        next: (message) => {
          if (message) res.write(message);
        },
        error: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Streaming error';
          res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
          if (!res.writableEnded) res.end();
        },
        complete: () => {
          if (!res.writableEnded) res.end();
        },
      });

    res.on('close', () => {
      subscription.unsubscribe();
      if (!res.writableEnded) res.end();
    });
  }

  /**
   * Sends standard SSE headers and flushes them immediately.
   */
  private configureHeaders(res: Response): void {
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }
}
