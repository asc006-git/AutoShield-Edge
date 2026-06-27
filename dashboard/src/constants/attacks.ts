import { AttackType } from "@/context/PipelineContext";

export interface AttackOption {
  id: AttackType;
  label: string;
  desc: string;
}

export const ATTACKS: AttackOption[] = [
  { id: "normal", label: "Normal", desc: "Baseline nominal traffic" },
  { id: "dos", label: "DoS Flood", desc: "CAN gateway saturation" },
  { id: "fuzzy", label: "Fuzzing", desc: "Payload byte injection" },
  { id: "gear", label: "Gear Spoofing", desc: "TCU signal manipulation" },
  { id: "rpm", label: "RPM Spoofing", desc: "ECU velocity override" },
];
