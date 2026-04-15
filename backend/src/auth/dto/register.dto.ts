import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsNumber, IsOptional, Min, Max, Matches } from 'class-validator';
import { Gender, ActivityLevel, Persona, Goal } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçersiz e-posta adresi' })
  @IsNotEmpty({ message: 'E-posta boş bırakılamaz' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam veya özel karakter içermelidir',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'İsim boş bırakılamaz' })
  firstName: string;

  @IsNumber({}, { message: 'Yaş bir sayı olmalıdır' })
  @IsNotEmpty()
  @Min(1, { message: 'Yaş en az 1 olmalıdır' })
  @Max(120, { message: 'Geçersiz yaş' })
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsNumber()
  @IsNotEmpty()
  @Min(50, { message: 'Boy en az 50 cm olmalıdır' })
  @Max(300, { message: 'Geçersiz boy' })
  height: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(10, { message: 'Kilo en az 10 kg olmalıdır' })
  @Max(500, { message: 'Geçersiz kilo' })
  weight: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(10)
  @Max(500)
  targetWeight: number;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @IsEnum(Goal)
  goal: Goal;

  @IsEnum(Persona)
  @IsOptional()
  selectedPersona?: Persona;
}
