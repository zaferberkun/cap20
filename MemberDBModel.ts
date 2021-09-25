import crypto from 'crypto';
import mongoose_namespace from 'mongoose';
import { Model } from 'mongoose';

import MemberSignupDataInterface from './MemberData.js'

import { Member } from './Member.js'

// Use deconstruction to extract Schema and model from the Mongoose
const { Schema, model } = mongoose_namespace;

// Define the methods interface for a User (will access this)
// Methods apply per document so they are split from statics
export interface IMemberDoc extends MemberSignupDataInterface {
}

// Define the statics interface for the User Model
// Statics apply to the model as a whole, so they are split out.
export interface IMemberModel extends Model<IMemberDoc> {
}

export const userSchema = new Schema<IMemberDoc, IMemberModel>({
  info: { type: String },
  email: { type: String, unique: true, required: true },
});


const MemberModel = model<IMemberDoc, IMemberModel>('cap20_users', userSchema);

export default MemberModel;
