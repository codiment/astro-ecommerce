import { hashPassword } from "src/utils/bcrypt";
import { PrismaClient } from "generated/prisma";


const prisma = new PrismaClient();

async function main() {
    await prisma.product.upsert({
        where: { title: "Product 1" },
        update: {
            price: 999.99,
            stock: 10,
            image: 'image.jpg',
            description: 'Testing'
        },
        create: {
            title: "Product 1",
            price: 999.99,
            stock: 10,
            image: 'image.jpg',
            description: 'Testing'
        },
    });

    const hashed = await hashPassword('password');

    await prisma.user.upsert({
        where: { email: 'john.doe@email.com' },
        update: {},
        create: {
            email: 'john.doe@email.com',
            name: 'John',
            password: hashed
        }
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