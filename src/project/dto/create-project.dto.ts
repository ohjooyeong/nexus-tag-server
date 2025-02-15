import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CONTENT_TYPE } from 'src/entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CONTENT_TYPE)
  @IsOptional()
  content_type?: CONTENT_TYPE;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
