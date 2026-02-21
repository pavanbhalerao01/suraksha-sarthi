import React, { useState } from "react";

const SKILLS = [
  "First Aid",
  "Medical Assistance",
  "Rescue Operations",
  "Logistics",
  "Food Distribution",
  "Shelter Management",
  "Crowd Control",
  "Communication",
  "Technical Support",
  "Water Purification",
  "Drought Relief",
  "Flood Response",
  "Earthquake Response",
  "Landslide Response",
];

export default function SkillsSelect({ value, onChange }: { value: string[]; onChange: (skills: string[]) => void }) {
  function toggleSkill(skill: string) {
    const updated = value.includes(skill)
      ? value.filter(s => s !== skill)
      : [...value, skill];
    onChange(updated);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SKILLS.map(skill => (
        <button
          key={skill}
          type="button"
          className={`px-3 py-1 rounded border ${value.includes(skill) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
          onClick={() => toggleSkill(skill)}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}
