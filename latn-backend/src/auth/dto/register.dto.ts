import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client'; // ✅ import enum trực tiếp từ Prisma schema

export class RegisterDto {
  @ApiProperty({ example: 'customer1@gmail.com', description: 'Địa chỉ email duy nhất của người dùng' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu (ít nhất 6 ký tự)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false, description: 'Tên hiển thị của người dùng' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: Role,
    example: Role.CUSTOMER,
    required: false,
    description: 'Vai trò của người dùng (ADMIN, STAFF, CUSTOMER)',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CUSTOMER; // ✅ đảm bảo khi không truyền vẫn mặc định CUSTOMER
}
