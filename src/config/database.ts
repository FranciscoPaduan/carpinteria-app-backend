import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || '';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
};