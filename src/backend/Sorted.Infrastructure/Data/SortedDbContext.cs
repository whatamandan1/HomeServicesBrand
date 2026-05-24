using Microsoft.EntityFrameworkCore;
using Sorted.Core.Entities;

namespace Sorted.Infrastructure.Data;

public class SortedDbContext(DbContextOptions<SortedDbContext> options) : DbContext(options)
{
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<UserAccount> Users => Set<UserAccount>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerProperty> CustomerProperties => Set<CustomerProperty>();
    public DbSet<PropertyMedia> PropertyMedia => Set<PropertyMedia>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<CustomerSubscription> CustomerSubscriptions => Set<CustomerSubscription>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<ProviderTerritory> ProviderTerritories => Set<ProviderTerritory>();
    public DbSet<ProviderBlockedDate> ProviderBlockedDates => Set<ProviderBlockedDate>();
    public DbSet<JobVisit> JobVisits => Set<JobVisit>();
    public DbSet<DispatchOffer> DispatchOffers => Set<DispatchOffer>();
    public DbSet<PaymentRecord> Payments => Set<PaymentRecord>();
    public DbSet<ProviderEarning> ProviderEarnings => Set<ProviderEarning>();
    public DbSet<WorkflowEvent> WorkflowEvents => Set<WorkflowEvent>();
    public DbSet<CommunicationThread> CommunicationThreads => Set<CommunicationThread>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<AIActionLog> AIActionLogs => Set<AIActionLog>();
    public DbSet<Escalation> Escalations => Set<Escalation>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<PortfolioEnquiry> PortfolioEnquiries => Set<PortfolioEnquiry>();
    public DbSet<PortfolioEnquiryProperty> PortfolioEnquiryProperties => Set<PortfolioEnquiryProperty>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAccount>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Brand>()
            .HasIndex(b => b.Code)
            .IsUnique();

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.UserId)
            .IsUnique();

        modelBuilder.Entity<Provider>()
            .HasIndex(p => p.UserId)
            .IsUnique();

        modelBuilder.Entity<Customer>()
            .HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId);
        modelBuilder.Entity<Customer>()
            .HasOne(c => c.Brand).WithMany().HasForeignKey(c => c.BrandId);
        modelBuilder.Entity<Provider>()
            .HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId);
        modelBuilder.Entity<ProviderBlockedDate>()
            .HasOne(b => b.Provider).WithMany(p => p.BlockedDates).HasForeignKey(b => b.ProviderId);
        modelBuilder.Entity<ProviderBlockedDate>()
            .HasIndex(b => new { b.ProviderId, b.BlockedDate })
            .IsUnique();
        modelBuilder.Entity<PasswordResetToken>()
            .HasIndex(t => t.TokenHash)
            .IsUnique();
        modelBuilder.Entity<PasswordResetToken>()
            .HasOne(t => t.User).WithMany().HasForeignKey(t => t.UserId);
        modelBuilder.Entity<JobVisit>()
            .HasOne(v => v.Subscription).WithMany().HasForeignKey(v => v.CustomerSubscriptionId);
        modelBuilder.Entity<JobVisit>()
            .HasOne(v => v.Property).WithMany().HasForeignKey(v => v.CustomerPropertyId);
        modelBuilder.Entity<CustomerSubscription>()
            .HasOne(s => s.PreferredProvider).WithMany().HasForeignKey(s => s.PreferredProviderId);
        modelBuilder.Entity<PropertyMedia>()
            .HasOne(m => m.Property).WithMany(p => p.Media).HasForeignKey(m => m.CustomerPropertyId);
        modelBuilder.Entity<ProviderEarning>()
            .HasOne(e => e.Provider).WithMany().HasForeignKey(e => e.ProviderId);
        modelBuilder.Entity<ProviderEarning>()
            .HasOne(e => e.JobVisit).WithMany().HasForeignKey(e => e.JobVisitId);
        modelBuilder.Entity<ProviderEarning>()
            .HasIndex(e => e.JobVisitId)
            .IsUnique();
        modelBuilder.Entity<PortfolioEnquiryProperty>()
            .HasOne(p => p.Enquiry).WithMany(e => e.Properties).HasForeignKey(p => p.PortfolioEnquiryId);
        modelBuilder.Entity<PortfolioEnquiry>()
            .HasOne(e => e.Brand).WithMany().HasForeignKey(e => e.BrandId);
        modelBuilder.Entity<PortfolioEnquiry>()
            .HasIndex(e => e.Email);

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(Core.Common.AuditableEntity).IsAssignableFrom(entity.ClrType))
            {
                modelBuilder.Entity(entity.ClrType)
                    .Property<bool>("IsDeleted")
                    .HasDefaultValue(false);
            }
        }

        base.OnModelCreating(modelBuilder);
    }
}
