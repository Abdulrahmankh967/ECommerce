using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _1_Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSelectorToRefreshTokenTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Selector",
                table: "RefreshToken",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Selector",
                table: "RefreshToken");
        }
    }
}
