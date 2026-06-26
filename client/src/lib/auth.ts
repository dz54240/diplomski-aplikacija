export { AuthProvider, useAuth, isAuthed as isLoggedIn } from './auth/context';

export interface MockUser {
  name: string;
  first: string;
  last: string;
  email: string;
}
