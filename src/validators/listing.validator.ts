import { z } from 'zod';

export const listingSchema = z.object({
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  price: z.number().int().min(1).max(999999999),
  condition: z.enum(['Brand New', 'Nigerian Used', 'Foreign Used (Tokunbo)']),
  location: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  mileage: z.number().int().min(0).max(999999),
  bodyType: z.enum(['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van', 'wagon', 'convertible']),
  color: z.string().min(1).max(50),
  transmission: z.enum(['automatic', 'manual']),
  fuel: z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
  drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd']),
  engineCapacity: z.number().positive().optional(),
  numberOfDoors: z.number().int().min(2).max(6).optional(),
  numberOfSeats: z.number().int().min(2).max(9).optional(),
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/).optional(),
  plateNumber: z.string().min(1).max(20).optional(),
  numberOfPreviousOwners: z.number().int().nonnegative().default(0),
  accidentHistory: z.enum(['none', 'minor', 'major', 'unknown']),
  serviceHistoryAvailable: z.boolean(),
  hasSpareKey: z.boolean().default(true),
  documentationStatus: z.enum(['registered_valid_papers', 'registered_papers_pending', 'unregistered']),
  warrantyRemaining: z.boolean(),
  features: z.array(z.string()).default([]),
  status: z.enum(['available', 'reserved', 'sold']).default('available'),
});

export type ListingInput = z.infer<typeof listingSchema>;

export const incrementSchema = z.object({
  field: z.enum(['viewCount', 'whatsappClickCount']),
});

export type IncrementInput = z.infer<typeof incrementSchema>;
