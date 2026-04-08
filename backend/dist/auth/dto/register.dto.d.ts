import { Gender, ActivityLevel, Persona, Goal } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    age: number;
    gender: Gender;
    height: number;
    weight: number;
    targetWeight: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    selectedPersona?: Persona;
}
