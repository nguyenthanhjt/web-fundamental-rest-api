export function validateEnvironment(config: Record<string, unknown>) {
  const secret = config.JWT_SECRET;
  if (typeof secret !== 'string' || Buffer.byteLength(secret.trim(), 'utf8') < 32) {
    throw new Error('JWT_SECRET phải được cấu hình với ít nhất 32 byte');
  }
  const port = Number(config.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PORT phải là số nguyên từ 0 đến 65535');
  }
  return { ...config, PORT: port };
}
