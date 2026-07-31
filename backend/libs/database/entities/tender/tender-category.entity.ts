import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('tender_categories')
@Unique('UQ_tender_category_name', ['name'])
@Unique('UQ_tender_category_code', ['code'])
@Index('IDX_tender_category_active', ['isActive'])
@Index('IDX_tender_category_display_order', ['displayOrder'])
@Index('IDX_tender_category_parent', ['parentCategoryId'])
export class TenderCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
  })
  code!: string;

  @Column({
    type: 'varchar',
    length: 180,
    unique: true,
  })
  slug!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'parent_category_id',
  })
  parentCategoryId!: string | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'display_order',
  })
  displayOrder!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  icon!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  color!: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @ManyToOne(
    () => TenderCategoryEntity,
    (category) => category.childCategories,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({
    name: 'parent_category_id',
  })
  parentCategory!: TenderCategoryEntity | null;

  @OneToMany(
    () => TenderCategoryEntity,
    (category) => category.parentCategory,
  )
  childCategories!: TenderCategoryEntity[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt!: Date;
}