export interface SignupField {
  email: string;
  password: string;
  checkPassword: string;
  droneId: string;
}

export interface LoginField {
  email: string;
  password: string;
}

export interface TokenPayload {
  uuid: string;
}

export interface CookiePayload {
  access_token: string;
  refresh_token: string;
}

export interface EditIDPayload {
  droneId: string;
}
