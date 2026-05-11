import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  employee_code!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password?: string;

  @Column('simple-array', { default: '' })
  roles!: string[];
}
