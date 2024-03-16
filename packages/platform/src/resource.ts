//
// © 2024 Hardcore Engineering, Inc. All Rights Reserved.
// Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//

export type Resource<T> = string & { __resource: T }

interface ResourceId<T> {
  __id: true
  value: T
}

type CategoryValues = { [key: string]: unknown }
type CategoryResources<V extends CategoryValues> = {
  [K in keyof V]: V[K] extends ResourceId<infer T> ? Resource<T> : V[K]
}

type PluginValues = Record<string, CategoryValues>
type PluginResources<R extends PluginValues> = {
  [K in keyof R]: CategoryResources<R[K]>
}

function mapObject<T, U>(
  values: Record<string, T>,
  prefix: string,
  fn: (prefix: string, value: T) => U,
): Record<string, U> {
  const result: Record<string, U> = {}
  for (const key in values) {
    result[key] = fn(prefix + ':' + key, values[key])
  }
  return result
}

const allResources = new Map<string, unknown>()

function addResource<T>(id: string, value: unknown): unknown {
  const ident = value as ResourceId<T>
  if (ident.__id) {
    const resolve = ident.value
    if (resolve) {
      allResources.set(id, value)
    }
    return id as Resource<T>
  } else {
    return value
  }
}

interface Identifiers {
  external<T>(): ResourceId<T>
  internal<T>(value: T): ResourceId<T>
}

const external = {
  __id: true,
} as ResourceId<void>

const ident: Identifiers = {
  external: <T,>(): ResourceId<T> => external as ResourceId<T>,
  internal: <T,>(value: T): ResourceId<T> => ({ __id: true, value }),
}

export function plugin<R extends PluginValues>(name: string, init: (ident: Identifiers) => R): PluginResources<R> {
  return mapObject(init(ident), name, (name, category) =>
    mapObject(category, name, (id, value) => addResource(id, value)),
  ) as PluginResources<R>
}
