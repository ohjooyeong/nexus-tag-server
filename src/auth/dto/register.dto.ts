import { IsDate, IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email. Please try again.' })
  email: string;

  @IsString()
  @Matches(/^[\w\s]{2,40}$/, {
    message:
      'Username must be between 2 and 40 characters and can only contain letters, numbers, and spaces.',
  })
  username: string;

  @IsString()
  @Length(8, 20, {
    message: 'Password must be between 8 and 20 characters long.',
  })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/, {
    message: 'Password must include letters, numbers, and special characters.',
  })
  password: string;

  @IsDate({ message: 'Birthdate must be a valid date.' })
  birthdate: Date;
}
