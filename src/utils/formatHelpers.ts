export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit", // gives 01–12
    day: "2-digit",
  });
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "critical":
      return "bg-red-500 border-health-red text-white";
    case "stable":
      return "bg-health-green border-health-green text-white";
    case "improving":
      return "bg-health-blue border-health-blue text-white";
    case "active":
      return "bg-health-green border-health-green text-white";
    case "completed":
      return "bg-muted text-muted-foreground";
    case "scheduled":
      return "bg-health-blue border-health-blue text-white";
    case "synced":
      return "bg-green-500 border-green-500 text-white";
    case "pending sync":
      return "bg-amber-500 border-amber-500 text-white";
    case "sync error":
      return "bg-red-500 border-red-500 text-white";
    default:
      return "bg-secondary border-secondary text-secondary-foreground";
  }
};

export const formatSyncStatus = (lastSynced: string | null) => {
  if (!lastSynced) return "Never synced";

  const lastSyncedDate = new Date(lastSynced);
  const now = new Date();
  const diffMinutes = Math.floor(
    (now.getTime() - lastSyncedDate.getTime()) / (1000 * 60)
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  return formatDate(lastSynced);
};

// New AI-related formatting helpers
export const formatConfidenceScore = (score: number) => {
  // Format a confidence score (0-1) as a percentage with appropriate color
  const percentage = Math.round(score * 100);

  if (percentage >= 90) {
    return { value: `${percentage}%`, color: "text-green-600" };
  } else if (percentage >= 70) {
    return { value: `${percentage}%`, color: "text-blue-600" };
  } else if (percentage >= 50) {
    return { value: `${percentage}%`, color: "text-amber-600" };
  } else {
    return { value: `${percentage}%`, color: "text-red-600" };
  }
};

export const formatAiResponseTime = (ms: number) => {
  // Format AI response time in a human-readable way
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  }
};

export const getAiRecommendationStatus = (recommendation: string) => {
  // Parse AI recommendation text to determine status level
  const lowercaseRec = recommendation.toLowerCase();

  if (
    lowercaseRec.includes("urgent") ||
    lowercaseRec.includes("immediate") ||
    lowercaseRec.includes("critical")
  ) {
    return "urgent";
  } else if (
    lowercaseRec.includes("recommend") ||
    lowercaseRec.includes("consider") ||
    lowercaseRec.includes("advised")
  ) {
    return "recommended";
  } else if (
    lowercaseRec.includes("optional") ||
    lowercaseRec.includes("may")
  ) {
    return "optional";
  } else {
    return "informational";
  }
};

export const getAiRecommendationColor = (status: string) => {
  // Get color for AI recommendation based on status
  switch (status) {
    case "urgent":
      return "border-red-300 bg-red-50 text-red-800";
    case "recommended":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "optional":
      return "border-blue-300 bg-blue-50 text-blue-800";
    case "informational":
    default:
      return "border-gray-300 bg-gray-50 text-gray-800";
  }
};

export const formatAiTrend = (trend: number) => {
  // Format trend values with appropriate indicators
  if (trend > 0) {
    return {
      value: `+${trend.toFixed(1)}%`,
      label: "Increasing",
      color: "text-red-600",
    };
  } else if (trend < 0) {
    return {
      value: `${trend.toFixed(1)}%`,
      label: "Decreasing",
      color: "text-green-600",
    };
  } else {
    return {
      value: `${trend.toFixed(1)}%`,
      label: "Stable",
      color: "text-blue-600",
    };
  }
};
