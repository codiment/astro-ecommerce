import { PrismaClient, Role } from "../generated/prisma";
import { hashPassword } from "../src/utils/bcrypt";


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
        where: { email: 'john.sigma@gmail.com' },
        update: {},
        create: {
            email: 'john.sigma@gmail.com',
            name: 'John Sigma',
            password: hashed,
            role: Role.ADMIN,
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