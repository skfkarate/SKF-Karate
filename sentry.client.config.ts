import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions — free tier friendly
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.1,
  environment: process.env.NODE_ENV
});
