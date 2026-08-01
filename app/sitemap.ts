import type { MetadataRoute } from "next";import {calculators} from "./site-data";import {siteConfig} from "./site-config";
export default function sitemap():MetadataRoute.Sitemap{return ["","calculators","guides","about","contact","privacy","terms",...calculators.map(x=>x[0])].map(x=>({url:`${siteConfig.url}/${x}`,changeFrequency:"monthly"}))}
