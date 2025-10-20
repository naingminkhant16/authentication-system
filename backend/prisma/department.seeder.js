import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.department.createMany({
        data: [
            {name: 'HR'},
            {name: 'Finance'},
            {name: 'Accounting'},
            {name: 'IT'},
            {name: 'Sales'},
            {name: 'Marketing'}
        ]
    });
    
    console.log('Department Data seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });