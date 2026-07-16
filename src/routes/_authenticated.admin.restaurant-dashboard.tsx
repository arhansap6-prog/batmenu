import { createFileRoute } from "@tanstack/react-router";
import { requireRestaurantAdmin } from "@/middleware/roleMiddleware";

export const Route = createFileRoute("/_authenticated/admin/restaurant-dashboard")({
  beforeLoad: ({ context }) => requireRestaurantAdmin(context),
  component: RestaurantDashboard,
});

export default function RestaurantDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Restaurant Admin Dashboard</h1>
        <p className="text-gray-600">View your menu, manage items, and track orders</p>
        {/* Restaurant specific features */}
      </div>
    </div>
  );
}
