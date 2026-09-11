using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _1_Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTptInheritance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create the Users base table for Table-Per-Type (TPT) inheritance
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "NVARCHAR(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            // 2. Safely copy ALL existing customer data into Users, preserving primary key Ids
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Users] ON;
                INSERT INTO [Users] ([Id], [FullName], [Email], [Phone], [PasswordHash], [CreatedAt])
                SELECT [Id], [FullName], [Email], ISNULL([Phone], ''), [PasswordHash], GETUTCDATE()
                FROM [Customers];
                SET IDENTITY_INSERT [Users] OFF;
            ");

            // 3. Create the Admins subtype table
            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    AppointedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Admins_Users_Id",
                        column: x => x.Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // 4. Populate Admins subtype table for any existing accounts with Role = 'admin'
            migrationBuilder.Sql(@"
                INSERT INTO [Admins] ([Id], [AppointedAt])
                SELECT [Id], GETUTCDATE()
                FROM [Customers]
                WHERE LOWER([Role]) = 'admin';
            ");

            // 5. Update EmailVerification and RefreshToken foreign keys to point to Users(Id)
            migrationBuilder.DropForeignKey(
                name: "FK_EmailVerification_Customers_CustomerId",
                table: "EmailVerification");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshToken_Customers_CustomerId",
                table: "RefreshToken");

            migrationBuilder.AddForeignKey(
                name: "FK_EmailVerification_Users_CustomerId",
                table: "EmailVerification",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshToken_Users_CustomerId",
                table: "RefreshToken",
                column: "CustomerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            // 6. Safely transform Customers table to drop IDENTITY and redundant columns
            migrationBuilder.Sql(@"
                -- Drop FKs referencing Customers
                ALTER TABLE [Orders] DROP CONSTRAINT [FK_Orders_Customers_CustomerId];
                ALTER TABLE [Carts] DROP CONSTRAINT [FK_Carts_Customers_CustomerId];
                ALTER TABLE [CustomerAddresses] DROP CONSTRAINT [FK_CustomerAddresses_Customers_CustomerId];
                ALTER TABLE [Reviews] DROP CONSTRAINT [FK_Reviews_Customers_CustomerId];
                ALTER TABLE [Wishlists] DROP CONSTRAINT [FK_Wishlists_Customers_CustomerId];
                ALTER TABLE [CouponUsages] DROP CONSTRAINT [FK_CouponUsages_Customers_CustomerId];

                -- Create new Customers table without IDENTITY for TPT mapping
                CREATE TABLE [Customers_New] (
                    [Id] INT NOT NULL,
                    CONSTRAINT [PK_Customers_New] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Customers_Users_Id] FOREIGN KEY ([Id]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
                );

                -- Copy all customer IDs into Customers_New
                INSERT INTO [Customers_New] ([Id])
                SELECT [Id] FROM [Customers];

                -- Drop old Customers table
                DROP TABLE [Customers];

                -- Rename Customers_New to Customers and PK_Customers_New to PK_Customers
                EXEC sp_rename 'Customers_New', 'Customers';
                EXEC sp_rename 'PK_Customers_New', 'PK_Customers', 'OBJECT';

                -- Re-add FKs to Customers
                ALTER TABLE [Orders] ADD CONSTRAINT [FK_Orders_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;

                ALTER TABLE [Carts] ADD CONSTRAINT [FK_Carts_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;

                ALTER TABLE [CustomerAddresses] ADD CONSTRAINT [FK_CustomerAddresses_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;

                ALTER TABLE [Reviews] ADD CONSTRAINT [FK_Reviews_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;

                ALTER TABLE [Wishlists] ADD CONSTRAINT [FK_Wishlists_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;

                ALTER TABLE [CouponUsages] ADD CONSTRAINT [FK_CouponUsages_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmailVerification_Users_CustomerId",
                table: "EmailVerification");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshToken_Users_CustomerId",
                table: "RefreshToken");

            migrationBuilder.Sql(@"
                ALTER TABLE [Orders] DROP CONSTRAINT [FK_Orders_Customers_CustomerId];
                ALTER TABLE [Carts] DROP CONSTRAINT [FK_Carts_Customers_CustomerId];
                ALTER TABLE [CustomerAddresses] DROP CONSTRAINT [FK_CustomerAddresses_Customers_CustomerId];
                ALTER TABLE [Reviews] DROP CONSTRAINT [FK_Reviews_Customers_CustomerId];
                ALTER TABLE [Wishlists] DROP CONSTRAINT [FK_Wishlists_Customers_CustomerId];
                ALTER TABLE [CouponUsages] DROP CONSTRAINT [FK_CouponUsages_Customers_CustomerId];

                CREATE TABLE [Customers_Old] (
                    [Id] INT IDENTITY(1,1) NOT NULL,
                    [FullName] NVARCHAR(100) NOT NULL,
                    [Email] NVARCHAR(MAX) NOT NULL,
                    [Phone] NVARCHAR(MAX) NOT NULL,
                    [PasswordHash] NVARCHAR(500) NOT NULL,
                    [Role] NVARCHAR(MAX) NOT NULL,
                    CONSTRAINT [PK_Customers_Old] PRIMARY KEY ([Id])
                );

                SET IDENTITY_INSERT [Customers_Old] ON;
                INSERT INTO [Customers_Old] ([Id], [FullName], [Email], [Phone], [PasswordHash], [Role])
                SELECT u.[Id], u.[FullName], u.[Email], u.[Phone], u.[PasswordHash],
                       CASE WHEN a.[Id] IS NOT NULL THEN 'admin' ELSE 'customer' END
                FROM [Users] u
                LEFT JOIN [Admins] a ON u.[Id] = a.[Id];
                SET IDENTITY_INSERT [Customers_Old] OFF;

                DROP TABLE [Customers];
                EXEC sp_rename 'Customers_Old', 'Customers';
                EXEC sp_rename 'PK_Customers_Old', 'PK_Customers', 'OBJECT';

                ALTER TABLE [Orders] ADD CONSTRAINT [FK_Orders_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
                ALTER TABLE [Carts] ADD CONSTRAINT [FK_Carts_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
                ALTER TABLE [CustomerAddresses] ADD CONSTRAINT [FK_CustomerAddresses_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
                ALTER TABLE [Reviews] ADD CONSTRAINT [FK_Reviews_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
                ALTER TABLE [Wishlists] ADD CONSTRAINT [FK_Wishlists_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
                ALTER TABLE [CouponUsages] ADD CONSTRAINT [FK_CouponUsages_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;

                ALTER TABLE [EmailVerification] ADD CONSTRAINT [FK_EmailVerification_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
                ALTER TABLE [RefreshToken] ADD CONSTRAINT [FK_RefreshToken_Customers_CustomerId]
                    FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE;
            ");

            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
