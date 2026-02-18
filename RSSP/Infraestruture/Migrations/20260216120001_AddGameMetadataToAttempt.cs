using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Infraestruture.Migrations
{
    public partial class AddGameMetadataToAttempt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GameDifficulty",
                table: "Attempts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GameKey",
                table: "Attempts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GameDifficulty",
                table: "Attempts");

            migrationBuilder.DropColumn(
                name: "GameKey",
                table: "Attempts");
        }
    }
}

