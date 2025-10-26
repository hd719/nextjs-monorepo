import { Suspense } from "react";

import { createClient } from "@/app/utils/supabase/server";
import Header from "@/components/Header";

export default function NavServer(): React.JSX.Element {
  return (
    <Suspense fallback={<Header />}>
      <DynamicNav />
    </Suspense>
  );
}

async function DynamicNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Header userEmail={user?.email || undefined} />;
}
