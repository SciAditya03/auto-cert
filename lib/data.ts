import { supabase } from "./supabase";
import type {
  Achievement,
  LookupResult,
  Participant,
} from "./types";

function normaliseRegistration(value: string) {
  return value.trim().toUpperCase();
}

export async function lookupCertificateEligibility(
  registrationNumber: string
): Promise<LookupResult> {
  const reg = normaliseRegistration(registrationNumber);

  if (!reg) {
    return {
      registrationNumber: reg,
      participant: null,
      achievements: [],
    };
  }

  const [
    { data: participant, error: participantError },
    { data: achievements, error: achievementsError },
  ] = await Promise.all([
    supabase
      .from("participants")
      .select(
        "id, registration_number, name, eligible"
      )
      .eq("registration_number", reg)
      .eq("eligible", true)
      .maybeSingle(),

    supabase
      .from("achievements")
      .select(
        "id, registration_number, name, eligible"
      )
      .eq("registration_number", reg)
      .eq("eligible", true),
  ]);

  if (participantError) {
    console.error(
      "Participant lookup error:",
      participantError
    );

    throw new Error(
      `Participant lookup failed: ${participantError.message}`
    );
  }

  if (achievementsError) {
    console.error(
      "Achievement lookup error:",
      achievementsError
    );

    throw new Error(
      `Achievement lookup failed: ${achievementsError.message}`
    );
  }

  return {
    registrationNumber: reg,

    participant:
      (participant as Participant | null) ?? null,

    achievements:
      (achievements as Achievement[]) ?? [],
  };
}