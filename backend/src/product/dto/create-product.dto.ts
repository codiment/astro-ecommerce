import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    IsInt,
    IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        example: 'Amazing T-shirt',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'The description of the product',
        example: 'High quality t-shirt',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The price of the product',
        example: 99.99,
        type: Number,
        format: 'float',
    })
    @IsNumber()
    @IsPositive()
    @Type(() => Number) // Ensure transformation from string if needed
    price: number;

    @ApiProperty({
        description: 'The stock of the product',
        example: 10,
        type: 'integer',
    })
    @IsInt()
    @Min(0)
    @Type(() => Number) // Ensure transformation from string if needed
    stock: number;

    @ApiProperty({
        description: 'The image of the product',
        example: 'image.jpg',
        required: false,
    })
    @IsString()
    @IsOptional()
    image?: string;
}