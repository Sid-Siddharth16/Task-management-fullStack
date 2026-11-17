import { Suspense } from "react";
import { Outlet } from "react-router";
import { FullPageSpinner } from "../../components/ui/Spinner";

// Top-level shell: each nested layout has its own Suspense so it stays mounted
// while a page chunk loads; this one catches top-level lazy pages (e.g. 404).
export default function RootLayout() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Outlet />
    </Suspense>
  );
}
