import mongoose, { Schema, Document } from 'mongoose';

export interface ICliente extends Document {
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  createdAt: Date;
}

const ClienteSchema = new Schema<ICliente>({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String },
  direccion: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICliente>('Cliente', ClienteSchema);
