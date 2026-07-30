import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('match_scores')
export class MatchScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
