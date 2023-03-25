import {Profile} from './profile';

export class TotUser {
  idUser: string;
  image: string;
  email: string;
  internalId: string;
  name: string;
  profession: string;
  professionType: string;
  profiles: Array<Profile>;
  type: string;
  updateAt: number;
  createdAt: number;

  constructor() {

  }
}
