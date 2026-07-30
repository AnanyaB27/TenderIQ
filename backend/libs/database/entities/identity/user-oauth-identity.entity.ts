import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_oauth_identities')
export class UserOauthIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
