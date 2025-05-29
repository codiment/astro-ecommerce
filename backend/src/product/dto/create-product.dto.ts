import { Product } from "generated/prisma";

export type CreateProductDto = Omit<Product, "id" | "createdAt" | "updatedAt">;