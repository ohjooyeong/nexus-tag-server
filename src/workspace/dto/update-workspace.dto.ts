import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
  @IsOptional()
  @IsString()
  @MinLength(4, {
    message: 'Workspace name must be at least 4 characters long.',
  })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
