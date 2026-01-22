import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Vercel-Admin-atlas-purple-island:pDAQxcCsVE8VIUB7@atlas-purple-island.bbdxhnz.mongodb.net/?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
};