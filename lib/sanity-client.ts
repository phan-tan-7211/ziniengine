import { createClient } from "next-sanity"
import { runtimeConfig } from "@/lib/runtime-config"

const baseSanityConfig = {
  projectId: runtimeConfig.sanityProjectId,
  dataset: runtimeConfig.sanityDataset,
  apiVersion: runtimeConfig.sanityApiVersion,
}

// Public website reads should prefer Sanity's CDN. The site only reads published
// documents through this client, so the CDN removes avoidable API latency on
// list/detail navigation. Use sanityDirectClient only for read-after-write or
// explicitly fresh server-side operations.
export const sanityClient = createClient({
  ...baseSanityConfig,
  useCdn: true,
})

export const sanityCdnClient = sanityClient

export const sanityDirectClient = createClient({
  ...baseSanityConfig,
  useCdn: false,
})
