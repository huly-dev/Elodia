/**
 * © 2024 Hardcore Engineering, Inc. All Rights Reserved.
 * Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
 *
 * Huly Platform Package.
 */

import { Console } from './console'
import { Platform, Void } from './platform'

export const platform = Platform.plugin('platform', {
  const: {
    N42: Platform.success(42),
  },
  service: {
    Console: Platform.success(Console),
  },
})

const code = Platform.code(function* () {
  const value = yield Platform.success(42)
  console.log('inside program', value)
  return Void
})

Platform.run(code)
