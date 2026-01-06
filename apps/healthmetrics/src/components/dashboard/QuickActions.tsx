import { UtensilsCrossed, Dumbbell, Scale } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const actions = [
  {
    id: "add-food",
    icon: UtensilsCrossed,
    label: "Add Food",
    description: "Log a meal or snack",
    route: ROUTES.DIARY,
  },
  {
    id: "log-exercise",
    icon: Dumbbell,
    label: "Log Exercise",
    description: "Record your workout",
    route: ROUTES.EXERCISE,
  },
  {
    id: "add-weight",
    icon: Scale,
    label: "Add Weight",
    description: "Track your progress",
    route: ROUTES.PROFILE,
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  const handleActionClick = (route: string) => {
    navigate({ to: route });
  };

  return (
    <section className="dashboard-actions-section">
      <h2 className="dashboard-actions-heading">Quick Actions</h2>

      <div className="dashboard-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              variant="supporting"
              className="dashboard-action-card focusable-card"
              tabIndex={0}
              role="button"
              aria-label={`${action.label}: ${action.description}`}
              onClick={() => handleActionClick(action.route)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleActionClick(action.route);
                }
              }}
            >
              <div className="dashboard-action-button">
                <div className="dashboard-action-icon-container">
                  <Icon className="dashboard-action-icon" aria-hidden="true" />
                </div>
                <div className="dashboard-action-content">
                  <p className="dashboard-action-label">{action.label}</p>
                  <p className="dashboard-action-description">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
