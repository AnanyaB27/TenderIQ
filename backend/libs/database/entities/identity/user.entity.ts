import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { UserOauthIdentityEntity } from './user-oauth-identity.entity';


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt!: Date | null;

 // @OneToMany(() => OrganizationMemberEntity, (member) => member.user)
  //organizationMembers!: OrganizationMemberEntity[];

  @OneToMany(() => UserOauthIdentityEntity, (oauthIdentity) => oauthIdentity.user)
  oauthIdentities!: UserOauthIdentityEntity[];

  //@OneToMany(() => NotificationPreferenceEntity, (preference) => preference.user)
  //notificationPreferences!: NotificationPreferenceEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}