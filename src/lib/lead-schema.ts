import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(30),
  email: z.string().trim().email("Please enter a valid email").max(150),
  address: z.string().trim().min(3, "Please enter the service address").max(200),
  city: z.string().trim().min(2, "Please select or enter a city").max(80),
  service: z.string().trim().min(2, "Please select a service").max(100),
  urgency: z.enum(["emergency", "non-emergency"]),
  message: z.string().trim().min(10, "Please share a few details").max(2000),
  preferredContact: z.enum(["phone", "email", "text"]),
  website: z.string().max(0).optional(),
});
export type LeadInput = z.infer<typeof leadSchema>;
