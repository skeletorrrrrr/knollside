import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getOrCreateBusiness } from "@/lib/business";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const business = await getOrCreateBusiness(supabase, user);

  return (
    <div className="min-h-screen bg-stone">
      <DashboardNav businessName={business.name} slug={business.slug} />
      <div className="max-w-3xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
