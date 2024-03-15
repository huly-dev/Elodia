//
// © 2024 Hardcore Engineering, Inc. All Rights Reserved.
// Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//

import { type OptParams } from './types'

export type ResourceId = string & { __tag: 'resource' }

export function makeResourceId(
  plugin: string,
  category: string,
  name: string,
): ResourceId {
  return `${plugin}:${category}:${name}` as ResourceId
}

export function parseResourceId(id: ResourceId): [string, string, string] {
  const [plugin, category, name] = id.split(':')
  return [plugin, category, name]
}

interface ResourceOptions<R = any> {
  __resource: R
  metadata: OptParams
}

export class ResourceDescriptor<R = any> {
  readonly id: ResourceId
  readonly options: ResourceOptions<R>

  constructor(id: ResourceId, options: ResourceOptions<R>) {
    this.id = id
    this.options = options
  }
}

export function $res<R>(metadata: OptParams): ResourceOptions<R> {
  return { metadata } as ResourceOptions<R>
}

type CategoryOptions = Record<string, ResourceOptions>
type PluginOptions = Record<string, CategoryOptions>

type CategoryDescriptors = Record<string, ResourceDescriptor<any>>
type PluginDescriptors = Record<string, CategoryDescriptors>

type CategoryOptionsToDescriptors<R extends CategoryOptions> = {
  [K in keyof R]: R[K] extends ResourceOptions<infer T>
    ? ResourceDescriptor<T>
    : never
}

type PluginOptionsToDescriptors<R extends PluginOptions> = {
  [K in keyof R]: CategoryOptionsToDescriptors<R[K]>
}

function category<R extends CategoryOptions>(
  plugin: string,
  category: string,
  resources: R,
): CategoryOptionsToDescriptors<R> {
  const result: CategoryDescriptors = {}
  for (const key in resources) {
    result[key] = new ResourceDescriptor(
      makeResourceId(plugin, category, key),
      resources[key],
    )
  }
  return result as CategoryOptionsToDescriptors<R>
}

export function plugin<O extends PluginOptions>(
  name: string,
  resources: O,
): PluginOptionsToDescriptors<O> {
  const result: PluginDescriptors = {}
  for (const key in resources) {
    result[key] = category(name, key, resources[key])
  }
  return result as PluginOptionsToDescriptors<O>
}
