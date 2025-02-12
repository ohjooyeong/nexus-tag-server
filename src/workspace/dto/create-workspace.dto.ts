import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(4, {
    message: 'Workspace name must be at least 4 characters long.',
  })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
