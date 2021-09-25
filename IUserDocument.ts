import { Document } from 'mongoose';
import MemberDataInterface from './MemberData.js'

export interface IMemberDocument extends Document, MemberDataInterface {
  hash: string;
  salt: string;
}
