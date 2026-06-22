import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-3">
        <p className="text-5xl font-bold text-muted-foreground">404</p>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-[#d4a24e] hover:bg-[#b58634]">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
