import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        example: 'Amazing T-shirt',
    })
    title: string;

    @ApiProperty({
        description: 'The price of the product',
        example: 'High quality t-shirt',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'The price of the product',
        example: 999.99,
        type: Number,
        format: 'float',
    })
    price: number;

    @ApiProperty({
        description: 'The stock of the product',
        example: 10,
        type: 'integer',
    })
    stock: number;

    @ApiProperty({
        description: 'The image of the product',
        example: 'image.jpg',
        required: false,
    })
    image?: string;
}