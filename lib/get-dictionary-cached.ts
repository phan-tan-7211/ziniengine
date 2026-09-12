import "server-only"

import { cache } from "react"
import { getDictionary as loadDictionary } from "./get-dictionary"

export const getDictionary = cache(loadDictionary)
