export type AccessToken = {
  accessToken: string;
  expiresIn: number;
};

export function createTokenCache(now: () => number = Date.now) {
  let token = '';
  let expiresAt = 0;
  let pending: Promise<string> | null = null;

  return {
    async get(factory: () => Promise<AccessToken>): Promise<string> {
      if (token && now() < expiresAt) return token;
      if (!pending) {
        pending = factory()
          .then((result) => {
            token = result.accessToken;
            const skewSeconds = Math.min(60, Math.max(0, result.expiresIn - 1));
            expiresAt = now() + Math.max(1, result.expiresIn - skewSeconds) * 1000;
            return token;
          })
          .finally(() => {
            pending = null;
          });
      }
      return pending;
    },
  };
}
