import CurrentSubscriptionCard from "@/components/billing/CurrentSubscriptionCard";
import PlanComparisonGrid from "@/components/billing/PlanComparisonGrid";
import PaymentMethodCard from "@/components/billing/PaymentMethodCard";
import BillingHistoryTable from "@/components/billing/BillingHistoryTable";

export default function Page() {
  return (
    <div className="space-y-5">
      <CurrentSubscriptionCard />

      <PlanComparisonGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PaymentMethodCard />
        <BillingHistoryTable />
      </div>
    </div>
  );
}
