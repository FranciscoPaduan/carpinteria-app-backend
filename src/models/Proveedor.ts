import mongoose, { Schema, Document } from 'mongoose';

export interface IProveedor extends Document {
  nombre: string;
  contacto?: string;
  telefono: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  createdAt: Date;
}

const ProveedorSchema = new Schema<IProveedor>({
  nombre: { type: String, required: true },
  contacto: { type: String },
  telefono: { type: String, required: true },
  email: { type: String },
  direccion: { type: String },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProveedor>('Proveedor', ProveedorSchema);