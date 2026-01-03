import { UtensilsCrossed, Dumbbell, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const actions = [
  {
    id: "add-food",
    icon: UtensilsCrossed,
    label: "Add Food",
    description: "Log a meal or snack",
  },
  {
    id: "log-exercise",
    icon: Dumbbell,
    label: "Log Exercise",
    description: "Record your workout",
  },
  {
    id: "add-weight",
    icon: Scale,
    label: "Add Weight",
    description: "Track your progress",
  },
];

export function QuickActions() {
  return (
    <section className="dashboard-actions-section">
      <h2 className="dashboard-actions-heading">Quick Actions</h2>

      <div className="dashboard-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id} className="dashboard-action-card">
              <Button variant="ghost" className="dashboard-action-button">
                <div className="dashboard-action-icon-container">
                  <Icon className="dashboard-action-icon" />
                </div>
                <div className="dashboard-action-content">
                  <p className="dashboard-action-label">{action.label}</p>
                  <p className="dashboard-action-description">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
