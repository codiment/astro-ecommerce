import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from 'src/utils/bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) { }
 
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(createUserDto.password);

    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword
      }
    })
  }


  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id
      }
    })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {

    let data = { ...updateUserDto };
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    return this.prisma.user.update({
      where: { id },
      data: data
    })
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: {
        id
      }
    })
  }
}
