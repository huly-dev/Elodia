//
// © 2024 Hardcore Engineering, Inc. All Rights Reserved.
// Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//

import { Resources } from './resource'
import type { IntlString, Params, ResourceId, Status, StatusFactory } from './types'
import { Result } from './types'

export const $status =
  <M extends Params = void, P extends M = M>(result: Result, message?: IntlString<M>) =>
  (id: ResourceId<StatusFactory<M, P>>) => ({
    id,
    create: (params: P) => ({ id, params, result, message }),
    cast: (status: Status<any, any>): Status<M, P> => {
      const statusId = status.id as string
      if (statusId !== id) {
        const errorStatus = platform.status.CantCastStatus.create({ id: statusId }) // TODO: CastExceptino
        throw new PlatformError(errorStatus)
      }
      return status
    },
  })

export const platform = Resources.plugin('platform', (_) => ({
  status: {
    UnknownError: _($status<{ message: string }>(Result.ERROR)),
    CantCastStatus: _($status<{ id: string }>(Result.ERROR)),
  },
}))

export function getStatus<M extends Params, P extends M>(error: Error) {
  if (error instanceof PlatformError) {
    return error.status as Status<M, P>
  }
  return platform.status.UnknownError.create({ message: error.message })
}

export class PlatformError<M extends Params, P extends M> extends Error {
  readonly status: Status<M, P>

  constructor(status: Status<M, P>) {
    super()
    this.status = status
  }
}