import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;   // ✅ thêm "!"

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;   // ✅ thêm "!"
}
