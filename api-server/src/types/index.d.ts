export interface SignupField {
  email: string;
  password: string;
  checkPassword: string;
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

export interface AddIDPayload {
  droneId: array;
}

export interface droneId {
  [key: string]: any;
  name: string;
}
