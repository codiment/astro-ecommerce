import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
    await prisma.product.create({
        data: {
            title: "Product 1",
            price: 999.99,
            stock: 10,
            image: 'image.jpg',
            description: 'Testing'
        },
    })
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })