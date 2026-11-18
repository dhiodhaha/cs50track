import { z } from "zod";

export const materialSchema = z.object({
  id: z.string(),
  unitIds: z.array(z.string()),
  title: z.string(),
  kind: z.enum([
    "overview",
    "notes",
    "transcript",
    "assignment",
    "section",
    "short",
    "slides",
    "source",
    "audio",
    "video",
    "subtitles",
    "guide",
  ]),
  format: z.string(),
  delivery: z.enum(["document", "file", "stream", "external"]),
  sourceUrl: z.string().url(),
  localUrl: z.string().nullable(),
  bytes: z.number().nonnegative(),
  sha256: z.string().nullable(),
  fetchedAt: z.string(),
});
export type CourseMaterial = z.infer<typeof materialSchema>;
export const materialManifestSchema = z.object({
  version: z.literal(1),
  edition: z.literal(2026),
  fetchedAt: z.string(),
  attribution: z.string(),
  license: z.string(),
  licenseUrl: z.string().url(),
  materials: z.array(materialSchema),
  warnings: z.array(z.string()),
});
export type MaterialManifest = z.infer<typeof materialManifestSchema>;
export const courseDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceUrl: z.string().url(),
  fetchedAt: z.string(),
  html: z.string(),
  headings: z.array(
    z.object({ id: z.string(), title: z.string(), level: z.number() }),
  ),
});
export type CourseDocument = z.infer<typeof courseDocumentSchema>;
export const MATERIAL_MANIFEST_URL = "/course/2026/manifest.json";
export function materialHash(id: string) {
  return `#learn/material/${encodeURIComponent(id)}`;
}
