import { createClient } from 'redis';

// Use the REDIS_HOST environment variable, defaulting to 127.0.0.1 if not set.
const redisHost = process.env.REDIS_HOST || '127.0.0.1';

const redisClient = createClient({
    socket: {
      host: redisHost,
      port: 6379
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;