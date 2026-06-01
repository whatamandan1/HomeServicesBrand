using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    public partial class AddCommunicationTracking : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AbandonEmail1SentAtUtc",
                table: "SignupLeads",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AbandonEmail2SentAtUtc",
                table: "SignupLeads",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AbandonEmail3SentAtUtc",
                table: "SignupLeads",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AbandonSmsSentAtUtc",
                table: "SignupLeads",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckoutAbandonEmailSentAtUtc",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VisitScheduleEmailSentAtUtc",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AnnualNudgeSentAtUtc",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WinbackEmailSentAtUtc",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentFailedNotifiedAtUtc",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletionNotifiedAtUtc",
                table: "JobVisits",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewAskSentAtUtc",
                table: "JobVisits",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UnclaimedOpsAlertSentAtUtc",
                table: "JobVisits",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DispatchNotifiedAtUtc",
                table: "JobVisits",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProviderReminderSentAtUtc",
                table: "JobVisits",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AckSentAtUtc",
                table: "Escalations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedEmailSentAtUtc",
                table: "Escalations",
                type: "TEXT",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "AbandonEmail1SentAtUtc", table: "SignupLeads");
            migrationBuilder.DropColumn(name: "AbandonEmail2SentAtUtc", table: "SignupLeads");
            migrationBuilder.DropColumn(name: "AbandonEmail3SentAtUtc", table: "SignupLeads");
            migrationBuilder.DropColumn(name: "AbandonSmsSentAtUtc", table: "SignupLeads");
            migrationBuilder.DropColumn(name: "CheckoutAbandonEmailSentAtUtc", table: "CustomerSubscriptions");
            migrationBuilder.DropColumn(name: "VisitScheduleEmailSentAtUtc", table: "CustomerSubscriptions");
            migrationBuilder.DropColumn(name: "AnnualNudgeSentAtUtc", table: "CustomerSubscriptions");
            migrationBuilder.DropColumn(name: "WinbackEmailSentAtUtc", table: "CustomerSubscriptions");
            migrationBuilder.DropColumn(name: "PaymentFailedNotifiedAtUtc", table: "CustomerSubscriptions");
            migrationBuilder.DropColumn(name: "CompletionNotifiedAtUtc", table: "JobVisits");
            migrationBuilder.DropColumn(name: "ReviewAskSentAtUtc", table: "JobVisits");
            migrationBuilder.DropColumn(name: "UnclaimedOpsAlertSentAtUtc", table: "JobVisits");
            migrationBuilder.DropColumn(name: "DispatchNotifiedAtUtc", table: "JobVisits");
            migrationBuilder.DropColumn(name: "ProviderReminderSentAtUtc", table: "JobVisits");
            migrationBuilder.DropColumn(name: "AckSentAtUtc", table: "Escalations");
            migrationBuilder.DropColumn(name: "ResolvedEmailSentAtUtc", table: "Escalations");
        }
    }
}
