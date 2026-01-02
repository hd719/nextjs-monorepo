import { UtensilsCrossed, Dumbbell, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "./QuickActions.module.css";

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
    <section className={styles.section}>
      <h2 className={styles.heading}>Quick Actions</h2>

      <div className={styles.grid}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id} className={styles.actionCard}>
              <Button variant="ghost" className={styles.actionButton}>
                <div className={styles.iconContainer}>
                  <Icon className={styles.icon} />
                </div>
                <div className={styles.content}>
                  <p className={styles.label}>{action.label}</p>
                  <p className={styles.description}>{action.description}</p>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
