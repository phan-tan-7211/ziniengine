import "server-only"

import { cache } from "react"
import { getDictionary as loadDictionary } from "@/lib/get-dictionary"

export const getDictionary = cache(loadDictionary)
