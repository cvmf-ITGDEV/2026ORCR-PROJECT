import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUsersTable1736100000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "auth_id",
            type: "uuid",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "first_name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "last_name",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "role",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "last_login_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_users_auth_id",
        columnNames: ["auth_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "IDX_users_auth_id");
    await queryRunner.dropTable("users");
  }
}
