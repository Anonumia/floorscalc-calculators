import type { MetadataRoute } from "next";import {calculators,guides} from "./site-data";
export default function sitemap():MetadataRoute.Sitemap{const base="https://floorwise-calculators.sites.openai.com";return ["","calculators","guides","about","contact","privacy","terms",...calculators.map(x=>x[0]),...guides.map(x=>`guides/${x[0]}`)].map(x=>({url:`${base}/${x}`,changeFrequency:"monthly"}))}
