import React, { useEffect, useState } from "react";
import { TopBar } from "../../components/layout/TopBar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuthStore } from "../../store/authStore";
import { useAlertStore } from "../../store/alertStore";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/utils";

export default function AlertsPage() {
  const { user } = useAuthStore();
  const { alerts, setAlerts, resolveAlert } = useAlertStore();
  const [elderId, setElderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const elderRes = await api.get("/elders/me");
        const elder = elderRes.data.data;
        setElderId(elder.id);
        const res = await api.get(`/alerts/${elder.id}`);
        setAlerts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [user]);

  const handleSOS = async () => {
    if (!elderId) return;
    setSosLoading(true);
    try {
      await api.post("/alerts/sos", { elderId });
      toast.success("SOS alert sent to your family!");
      // Refetch alerts immediately
      const res = await api.get(`/alerts/${elderId}`);
      setAlerts(res.data.data);
    } catch {
      toast.error("Failed to send SOS");
    } finally {
      setSosLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`);
      resolveAlert(alertId);
      toast.success("Alert resolved");
    } catch {
      toast.error("Failed to resolve alert");
    }
  };

  const getSeverityVariant = (severity: string) => {
    if (severity === "critical") return "red";
    if (severity === "high") return "red";
    if (severity === "medium") return "yellow";
    return "gray";
  };

  const getAlertIcon = (type: string) => {
    if (type === "sos") return "🆘";
    if (type === "missed_medication") return "💊";
    if (type === "low_mood") return "😔";
    return "⚠️";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div>
      <TopBar title="Alerts" />
      <div className="p-6 space-y-6">
        {user?.role === "elder" && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-800">Emergency SOS</h3>
                <p className="text-sm text-red-600 mt-1">
                  Press to alert your family immediately
                </p>
              </div>
              <Button
                variant="danger"
                size="lg"
                loading={sosLoading}
                onClick={handleSOS}
                className="text-2xl px-8 py-4"
              >
                🆘 SOS
              </Button>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Alert History
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({alerts.filter((a) => !a.resolved).length} unresolved)
            </span>
          </h3>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400 text-center py-4">
                No alerts yet
              </p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={alert.resolved ? "opacity-60" : ""}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getAlertIcon(alert.alertType)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(alert.triggeredAt)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          label={alert.severity}
                          variant={
                            getSeverityVariant(alert.severity) as
                              | "red"
                              | "yellow"
                              | "gray"
                          }
                        />
                        {alert.resolved && (
                          <Badge label="Resolved" variant="green" />
                        )}
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
