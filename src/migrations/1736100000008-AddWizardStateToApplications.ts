/*
  # Add Wizard State Management to Applications Table

  1. Changes
    - Add `current_step` column to track wizard progress (1-4)
    - Add `step_data` JSONB column to store partial step data during wizard completion
    - Add `last_saved_at` timestamp to track autosave operations

  2. Purpose
    - Enable multi-step wizard flow with incremental saves
    - Support draft recovery after browser crashes or network interruptions
    - Track user progress through the application process

  3. Notes
    - current_step defaults to 1 (Personal Information step)
    - step_data allows partial validation and progressive data capture
    - last_saved_at helps with autosave status indicators and conflict detection
*/

import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddWizardStateToApplications1736100000008
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "applications",
      new TableColumn({
        name: "current_step",
        type: "integer",
        default: 1,
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "applications",
      new TableColumn({
        name: "step_data",
        type: "jsonb",
        isNullable: true,
        default: null,
      })
    );

    await queryRunner.addColumn(
      "applications",
      new TableColumn({
        name: "last_saved_at",
        type: "timestamptz",
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("applications", "last_saved_at");
    await queryRunner.dropColumn("applications", "step_data");
    await queryRunner.dropColumn("applications", "current_step");
  }
}
