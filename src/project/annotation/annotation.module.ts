import { Module } from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { AnnotationController } from './annotation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Annotation } from 'src/entities/annotation.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Annotation, WorkspaceMember])],
  controllers: [AnnotationController],
  providers: [AnnotationService],
  exports: [AnnotationService],
})
export class AnnotationModule {}
