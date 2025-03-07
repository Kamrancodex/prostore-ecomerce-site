import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

//schema for insertion of prodcut
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be atleast 3 characters"),
  slug: z.string().min(3, "Slug must be atleast 3 characters"),
  category: z.string().min(3, "Category must be atleast 3 characters"),
  brand: z.string().min(3, "Brand must be atleast 3 characters"),
  description: z.string().min(3, "Description must be atleast 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string().min(1, "Product must have atleast one image")),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

//schema for signing users in

export const signinFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password mush be atleast 6 characters"),
});
