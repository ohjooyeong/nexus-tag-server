import {
  LabelType,
  Bbox,
  Mask,
  Polygon,
} from '../../entities/annotation.entity';

export class CreateAnnotationDto {
  id?: string;
  clientId: string;
  type: LabelType;
  bbox?: Bbox;
  mask?: Mask;
  polygon?: Polygon;
  zIndex: number;
  classLabelId: string;
  isDeleted?: boolean;
}
