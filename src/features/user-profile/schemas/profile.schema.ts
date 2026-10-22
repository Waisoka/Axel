import { z } from 'zod'
import { DISPLAY_NAME_MAX, DISPLAY_NAME_MIN } from '../constants'

export const displayNameSchema = z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN)
    .max(DISPLAY_NAME_MAX)
