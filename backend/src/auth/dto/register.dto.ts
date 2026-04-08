import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Gender, ActivityLevel, Persona, Goal } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsNumber()
  @IsNotEmpty()
  height: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @IsNotEmpty()
  targetWeight: number;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @IsEnum(Goal)
  goal: Goal;

  @IsEnum(Persona)
  @IsOptional()
  selectedPersona?: Persona;
}
