let token: string | undefined;

export function setToken(value: string): void {
  token = value;
}

export function getToken(): string | undefined {
  return token;
}
