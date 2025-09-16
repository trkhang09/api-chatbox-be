import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { TypeSettings } from 'src/common/enums/type-settings.enum';
import { Column, Entity } from 'typeorm';

@Entity('settings')
export class Setting extends AbstractEntity {
  @Column({ length: 255 })
  key: string;
  @Column({ length: 255 })
  value: string;
  @Column({ length: 255, default: TypeSettings.STRING })
  type: TypeSettings;
  @Column({ length: 255, default: '' })
  description: string;
}
