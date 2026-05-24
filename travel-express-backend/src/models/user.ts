import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the TypeScript Interface
export interface ISavedItinerary {
  destination: string;
  dates: string;
  aiResponse: string;
  savedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  savedItineraries: ISavedItinerary[];
}

// 2. Create the Mongoose Schema
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  savedItineraries: [{
    destination: { type: String, required: true },
    dates: { type: String, required: true },
    aiResponse: { type: String, required: true },
    savedAt: { type: Date, default: Date.now }
  }]
});

// 3. Export the Model
export default mongoose.model<IUser>('User', UserSchema);