namespace Sorted.Core.Communications;

public static class CommunicationTemplates
{
    public static string PortalLink(string baseUrl) => $"{baseUrl.TrimEnd('/')}/portal";
    public static string SignupLink(string baseUrl) => $"{baseUrl.TrimEnd('/')}/signup";
    public static string ProviderPortalLink(string baseUrl) => $"{baseUrl.TrimEnd('/')}/provider";
    public static string BillingPortalLink(string baseUrl) => PortalLink(baseUrl);

    public static (string Subject, string Body) WelcomeEmail(string firstName, string portalLink) =>
        ("Welcome to GardensSorted",
            $"""
            Hi {firstName},

            Welcome to GardensSorted — we're glad you're here.

            Your account is ready. Complete payment to activate your garden care plan, or sign in to your portal to manage your details.

            {portalLink}

            Questions? Reply to this email or use the chat in your account.

            — The GardensSorted team
            """);

    public static string WelcomeSms(string firstName) =>
        $"Hi {firstName}, welcome to GardensSorted! Your garden subscription account is ready.";

    public static (string Subject, string Body) SubscriptionConfirmedEmail(
        string firstName, string planName, string availability, string portalLink) =>
        ("Your GardensSorted subscription is active",
            $"""
            Hi {firstName},

            Your {planName} subscription is now active.

            We're scheduling your visits based on your availability ({availability}). Your first visit will be within 14 days — we'll confirm the date once a gardener is assigned.

            View upcoming visits: {portalLink}

            — The GardensSorted team
            """);

    public static string SubscriptionConfirmedSms(string planName) =>
        $"GardensSorted: your {planName} subscription is active. We'll confirm your first visit window soon.";

    public static (string Subject, string Body) VisitClaimedEmail(
        string firstName, DateTime visitDate, string postcode, string window, string portalLink) =>
        ("Your GardensSorted visit is confirmed",
            $"""
            Hi {firstName},

            Your garden visit on {visitDate:dddd d MMMM} at {postcode} is confirmed.

            Your gardener will arrive during {window}.

            Need to reschedule? Sign in to your portal: {portalLink}

            — The GardensSorted team
            """);

    public static string VisitClaimedSms(DateTime visitDate, string postcode) =>
        $"GardensSorted: visit confirmed for {visitDate:dd MMM} in {postcode}. Your gardener will arrive in your chosen window.";

    public static (string Subject, string Body) VisitReminderEmail(
        string firstName, DateTime visitDate, string postcode, string window) =>
        ("Reminder: your GardensSorted visit is coming up",
            $"""
            Hi {firstName},

            A quick reminder: your garden visit is scheduled for {visitDate:dddd d MMMM} at {postcode}.

            We'll arrive during {window}. Please ensure we have access to the garden.

            — The GardensSorted team
            """);

    public static string VisitReminderSms(DateTime visitDate, string postcode) =>
        $"GardensSorted reminder: garden visit on {visitDate:dd MMM} in {postcode}. We'll arrive in your chosen window.";

    public static (string Subject, string Body) PasswordResetEmail(string resetUrl) =>
        ("Reset your GardensSorted password",
            $"""
            Hi,

            We received a request to reset your GardensSorted password. Open this link within the next hour:

            {resetUrl}

            If you didn't request this, you can ignore this email.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) PortfolioEnquiryAck(string contactName) =>
        ("We received your multi-property enquiry",
            $"""
            Hi {contactName},

            Thanks for your enquiry. We've received your property details and will review them shortly.

            We'll be in touch with a personalised indicative quote — subject to review before any agreement is confirmed.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) PortfolioEnquiryOps(
        string contactName, string email, string phone, int propertyCount) =>
        ("New multi-property enquiry",
            $"New multi-property enquiry from {contactName} ({email}, {phone}) — {propertyCount} properties. Review in admin → Multi-Property Solutions.");

    public static (string Subject, string Body) VisitScheduledEmail(
        string firstName, string visitList, string portalLink) =>
        ("Your upcoming GardensSorted visits",
            $"""
            Hi {firstName},

            We've scheduled your next visits:

            {visitList}

            We'll confirm each date once a gardener is assigned. View or reschedule in your portal: {portalLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) VisitCompletedEmail(
        string firstName, string postcode, string? nextVisitDate, string portalLink) =>
        ("Your garden visit is complete",
            $"""
            Hi {firstName},

            Your gardener has finished today's visit at {postcode}.

            {(nextVisitDate is not null ? $"Your next visit is scheduled for {nextVisitDate} (subject to confirmation)." : "We'll schedule your next visit soon.")}

            View your visit history: {portalLink}

            — The GardensSorted team
            """);

    public static string VisitCompletedSms(string postcode, DateTime? nextVisitDate) =>
        nextVisitDate is not null
            ? $"GardensSorted: today's visit at {postcode} is complete. Next visit: {nextVisitDate:dd MMM}."
            : $"GardensSorted: today's visit at {postcode} is complete.";

    public static (string Subject, string Body) VisitCancelledEmail(
        string firstName, DateTime visitDate, string postcode, DateTime? newDate, string portalLink) =>
        ("Visit cancelled — " + visitDate.ToString("dddd d MMMM"),
            $"""
            Hi {firstName},

            Your garden visit on {visitDate:dddd d MMMM} at {postcode} has been cancelled.
            {(newDate is not null ? $"\nIt has been rescheduled to {newDate:dddd d MMMM}." : "")}

            Manage visits: {portalLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) VisitRescheduledEmail(
        string firstName, DateTime oldDate, DateTime newDate, string postcode, string window) =>
        ("Visit rescheduled to " + newDate.ToString("dddd d MMMM"),
            $"""
            Hi {firstName},

            Your garden visit has moved from {oldDate:dddd d MMMM} to {newDate:dddd d MMMM} at {postcode}.

            Window: {window}

            — The GardensSorted team
            """);

    public static string VisitRescheduledSms(DateTime newDate, string postcode, string window) =>
        $"GardensSorted: visit moved to {newDate:dd MMM} in {postcode}. Window: {window}.";

    public static (string Subject, string Body) VisitWeatherRescheduledEmail(
        string firstName, DateTime oldDate, DateTime newDate, string window) =>
        ("Visit rescheduled due to weather",
            $"""
            Hi {firstName},

            Due to weather conditions, we've rescheduled your visit from {oldDate:dddd d MMMM} to {newDate:dddd d MMMM}.

            We apologise for any inconvenience. Your gardener will arrive during {window}.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) VisitNoProviderEmail(string firstName, DateTime visitDate) =>
        ("We're assigning your gardener",
            $"""
            Hi {firstName},

            Your visit on {visitDate:dddd d MMMM} is coming up and we're finalising gardener assignment. No action needed — we'll confirm shortly or be in touch if we need to adjust the date.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) PaymentFailedEmail(string firstName, string billingLink) =>
        ("Action needed: payment failed",
            $"""
            Hi {firstName},

            We couldn't process your latest GardensSorted payment. Please update your payment method to keep your subscription active:

            {billingLink}

            If you need help, reply to this email or use support chat in your portal.

            — The GardensSorted team
            """);

    public static string PaymentFailedSms(string billingLink) =>
        $"GardensSorted: payment failed. Update your card to keep your subscription: {billingLink}";

    public static (string Subject, string Body) PaymentRetryEmail(string firstName, string billingLink) =>
        ("We'll retry your payment tomorrow",
            $"""
            Hi {firstName},

            Your payment didn't go through. We'll try again automatically. Update your card now to avoid interruption:

            {billingLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) RenewalEmail(
        string firstName, decimal amount, string planName, DateTime periodEnd, string portalLink) =>
        ("Payment received — thank you",
            $"""
            Hi {firstName},

            We've received your £{amount:F2} payment for {planName}. Your subscription is active through {periodEnd:dddd d MMMM yyyy}.

            View billing history: {portalLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) CancelConfirmEmail(string firstName, DateTime cancelsAt) =>
        ("Subscription cancellation confirmed",
            $"""
            Hi {firstName},

            Your GardensSorted subscription will end on {cancelsAt:dddd d MMMM yyyy}.

            Visits scheduled after that date will be cancelled. If you change your mind before then, contact us via support chat.

            — The GardensSorted team
            """);

    public static string CancelConfirmSms(DateTime cancelsAt) =>
        $"GardensSorted: subscription ends {cancelsAt:dd MMM}. Contact us if you'd like to stay.";

    public static (string Subject, string Body) UpgradeConfirmEmail(string firstName, string newPlanName, string portalLink) =>
        ("You're now on " + newPlanName,
            $"""
            Hi {firstName},

            Your plan has been upgraded to {newPlanName}. Your visit schedule will update accordingly — view details in your portal.

            {portalLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) AnnualSwitchEmail(string firstName, string planName, DateTime renewalDate) =>
        ("You're now on annual billing",
            $"""
            Hi {firstName},

            You're switched to annual billing for {planName}. Your next renewal is {renewalDate:dddd d MMMM yyyy}.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) EscalationAckEmail(string firstName, string summary, int slaHours) =>
        ("We've received your request",
            $"""
            Hi {firstName},

            Thanks for getting in touch. Your request ({summary}) has been passed to our team. We'll respond within {slaHours} hours.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) EscalationResolvedEmail(string firstName, string resolution) =>
        ("Your request has been resolved",
            $"""
            Hi {firstName},

            We've closed your support request: {resolution}

            If anything still isn't right, reply to this email.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) AbandonEmail1(
        string firstName, string? planName, string? gardenSize, string signupLink, string cityArea) =>
        ("Finish setting up your garden care plan",
            $"""
            Hi {firstName},

            You started signing up for GardensSorted but didn't finish — no problem.
            {(planName is not null && gardenSize is not null ? $"\nYou chose {planName} for a {gardenSize} garden." : "")}

            Pick up where you left off — it takes about 2 minutes:

            {signupLink}

            Regular lawn, borders, and tidy on a schedule. Vetted local gardeners in {cityArea}.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) AbandonEmail2(string firstName, string? planName, string signupLink) =>
        ("Still thinking about garden maintenance?",
            $"""
            Hi {firstName},

            Garden care shouldn't mean chasing gardeners. With GardensSorted you subscribe once and we handle the schedule.
            {(planName is not null ? $"\nYour {planName} quote is waiting." : "")}

            Continue signup: {signupLink}

            Questions? Reply to this email — we're happy to help.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) AbandonEmail3(string firstName, string signupLink) =>
        ("Last reminder — your GardensSorted quote",
            $"""
            Hi {firstName},

            This is a final nudge — your signup is still open if you'd like regular garden maintenance without the hassle.

            {signupLink}

            If you've gone another way, no worries. We won't email again about this.

            — The GardensSorted team
            """);

    public static string AbandonSms(string signupLink) =>
        $"GardensSorted: you started signing up for regular garden care. Finish in 2 mins: {signupLink}";

    public static (string Subject, string Body) CheckoutAbandonEmail(string firstName, string planName, string checkoutLink) =>
        ("Complete your GardensSorted subscription",
            $"""
            Hi {firstName},

            Your account is set up and your {planName} plan is ready — we just need payment to activate your first visits.

            Complete checkout: {checkoutLink}

            Your garden details and availability are saved. First visit within 14 days of activation.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) WaitlistEmail(string firstName, string postcode) =>
        ("We're not in " + postcode + " yet — you're on the list",
            $"""
            Hi {firstName},

            Thanks for your interest. We don't cover {postcode} yet, but we've added you to our waitlist and will email you when we launch in your area.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) AnnualNudgeEmail(string firstName, string portalLink) =>
        ("Save ~2 months with annual billing",
            $"""
            Hi {firstName},

            You've been with us for two months — hope the garden's looking good.

            Switch to annual billing and save roughly two months compared to paying monthly. Same visits, same gardener, less admin.

            Switch in your portal: {portalLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) ReviewAskEmail(string firstName, string reviewLink) =>
        ("How was your first visit?",
            $"""
            Hi {firstName},

            Your first GardensSorted visit is done — we'd love to know how it went.

            If you're happy, a quick Google review helps other homeowners find us:

            {reviewLink}

            If anything wasn't right, reply here and we'll sort it.

            — The GardensSorted team
            """);

    public static string ReviewAskSms(string reviewLink) =>
        $"GardensSorted: hope your first visit went well! A quick Google review helps us: {reviewLink}";

    public static (string Subject, string Body) ReferralEmail(string firstName, string referralLink) =>
        ("Give a neighbour £25 off — get £25 credit",
            $"""
            Hi {firstName},

            Know someone who'd like a garden that's looked after without the hassle?

            Share your link: {referralLink}

            You both get £25 credit after their second paid month.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) SeasonalEmail(string firstName, string cityArea) =>
        ("Autumn garden prep — leaf clearance add-on",
            $"""
            Hi {firstName},

            Leaves are starting to fall. We're offering a one-off autumn leaf clearance add-on for existing subscribers in {cityArea}.

            Request in your portal or reply to this email for a quote.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) WinbackEmail(string firstName) =>
        ("We'd love to have you back",
            $"""
            Hi {firstName},

            We noticed you cancelled your GardensSorted subscription. If timing or cost was the issue, we'd like to help — we can discuss pausing instead of cancelling, or adjusting your plan.

            Reply to this email or chat with us in the portal.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) ProviderApplyAck(string firstName) =>
        ("Application received — GardensSorted",
            $"""
            Hi {firstName},

            Thanks for applying to join GardensSorted as a gardener. We're reviewing your application and will email you once approved.

            — The GardensSorted team
            """);

    public static (string Subject, string Body) ProviderApproved(string firstName, string providerLink) =>
        ("You're approved — start claiming visits",
            $"""
            Hi {firstName},

            You're approved on GardensSorted. Sign in to view available visits in your area:

            {providerLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) ProviderDispatchEmail(
        DateTime visitDate, string outcode, string window, string providerLink) =>
        ("New visit available — " + visitDate.ToString("dd MMM"),
            $"""
            New visit available on {visitDate:dddd d MMMM} in {outcode}.

            Window: {window}

            Claim in your portal: {providerLink}

            — The GardensSorted team
            """);

    public static string ProviderDispatchSms(DateTime visitDate, string outcode, string providerLink) =>
        $"GardensSorted: new visit available {visitDate:dd MMM} in {outcode}. Claim in app: {providerLink}";

    public static string ProviderVisitReminderSms(DateTime visitDate, string outcode, string window) =>
        $"GardensSorted reminder: visit tomorrow {visitDate:dd MMM} in {outcode}. {window}.";

    public static string ProviderVisitCancelSms(DateTime visitDate, string outcode) =>
        $"GardensSorted: visit on {visitDate:dd MMM} in {outcode} was cancelled.";

    public static (string Subject, string Body) ProviderPayoutEmail(
        string firstName, decimal amount, DateTime periodEnd, string? notes, string providerLink) =>
        ("Payment sent — £" + amount.ToString("F2"),
            $"""
            Hi {firstName},

            We've marked £{amount:F2} as paid for visits through {periodEnd:dddd d MMMM yyyy}.
            {(notes is not null ? $"\n{notes}" : "")}

            View earnings: {providerLink}

            — The GardensSorted team
            """);

    public static (string Subject, string Body) OpsPaymentFailed(string customerEmail, Guid subscriptionId) =>
        ("Payment failed — " + customerEmail,
            $"Subscription {subscriptionId} for {customerEmail} is past due. Follow up in admin.");

    public static (string Subject, string Body) OpsVisitUnclaimed(DateTime visitDate, string postcode, Guid visitId) =>
        ("Unclaimed visit in 5 days — " + postcode,
            $"Visit {visitId} on {visitDate:yyyy-MM-dd} at {postcode} — no provider claimed. Assign manually in admin.");

    public static (string Subject, string Body) OpsProviderApply(string name, string email, string phone) =>
        ("New provider application — " + name,
            $"New provider application from {name} ({email}, {phone}). Review in admin.");

    public static (string Subject, string Body) OpsEscalation(string reason, Guid escalationId) =>
        ("New support escalation",
            $"Escalation {escalationId}: {reason}. Review in admin.");

    public static string FormatVisitList(IEnumerable<DateTime> dates) =>
        string.Join("\n", dates.Select(d => $"• {d:dddd d MMMM yyyy}"));

    public static string WindowOrDefault(string? window) =>
        string.IsNullOrWhiteSpace(window) ? "your chosen window" : window;
}
