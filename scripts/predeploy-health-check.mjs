const explicitHealthUrl = process.env.VITE_HEALTH_CHECK_URL || process.env.HEALTH_CHECK_URL;
const apiUrl = process.env.VITE_API_URL || 'https://api.allop.es/api';
const healthUrl = explicitHealthUrl || `${apiUrl.replace(/\/$/, '')}/health`;
const timeoutMs = Number(process.env.HEALTH_CHECK_TIMEOUT_MS || 8000);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(healthUrl, {
    headers: { Accept: 'application/json,text/plain,*/*' },
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }

  console.log(`Health check OK: ${healthUrl}`);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown health check error';
  console.error(`Health check failed for ${healthUrl}: ${message}`);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}
