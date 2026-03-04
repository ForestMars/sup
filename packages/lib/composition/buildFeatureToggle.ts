import { FeatureToggle } from "@sup/domain/ports";
import { JsonFeatureToggle } from "@sup/infra/adapters";

export function buildFeatureToggle(env: string): FeatureToggle {
  if (env === "production") {
    // Could swap to LaunchDarkly here
    return new JsonFeatureToggle();
  }
  return new JsonFeatureToggle();
}
