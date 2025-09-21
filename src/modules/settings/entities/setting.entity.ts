import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { TypeSettings } from 'src/common/enums/type-settings.enum';
import { Column, Entity } from 'typeorm';

@Entity('settings')
export class Setting extends AbstractEntity {
  @Column({ length: 50, unique: true })
  key: string;

  @Column()
  value: string;

  @Column({ length: 50, type: 'varchar', default: TypeSettings.STRING })
  type: TypeSettings;

  @Column({ default: '' })
  description: string;
}
