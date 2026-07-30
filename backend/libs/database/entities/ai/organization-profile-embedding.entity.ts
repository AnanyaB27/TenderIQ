import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organization_profile_embeddings')
export class OrganizationProfileEmbeddingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
