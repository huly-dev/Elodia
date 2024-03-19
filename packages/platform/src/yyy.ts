//
// © 2024 Hardcore Engineering, Inc. All Rights Reserved.
// Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// · platform/resource.ts
//

import { mapObjects } from './util'

// R E S O U R C E  M A N A G E M E N T

export type PluginId = string & { __tag: 'plugin-id' }
export type ResourceTypeId<I extends string> = I & { __tag: 'resource-type-id' }
export type ResourceType<I extends string, T> = {
  id: ResourceTypeId<I>
  type: T
}

export type ResourceId<I extends string, T> = {
  pluginId: PluginId
  resourceType: ResourceType<I, T>
  key: string
}

type Resource<I extends string, T> = any & { __id: I; __type: T }

type ResourceConstructor<I extends string, T, R> = (resource: Resource<I, T>) => R
type ResourceConstructors = Record<string, ResourceConstructor<any, any, any>>

type Resources<C extends ResourceConstructors> = {
  [K in keyof C]: C[K] extends ResourceConstructor<infer I, infer T, infer R>
    ? R & {
        __id: I
        __type: T
      }
    : never
}

interface PluginResourceConstructors {
  [key: string]: ResourceConstructors
}
interface PluginResourceConstuctorsOfType<I extends string> {
  [type: string]: Record<string, ResourceConstructor<I, any, any>>
}

// export const applyConstructors = <I extends string, T, C extends ResourceConstructors>(
//   pluginId: PluginId,
//   resourceType: ResourceType<I, T>,
//   constructors: C,
// ): Resources<C> => mapObjects(constructors, (constructor, key) => constructor({ pluginId, resourceType, key })) as any

// export const extractAndApplyConstructorsOfType = <I extends string, T, P extends PluginResourceConstructors>(
//   pluginId: PluginId,
//   resourceType: ResourceType<I, T>,
//   pluginConstructors: P,
// ): PluginResourceConstuctorsOfType<I> =>
//   mapObjects(pluginConstructors[resourceType.id], (constructor, key) => constructor({ pluginId, resourceType, key }))

// export interface ResourceProvider<I extends string, T, C extends ResourceConstructors> {
//   resourceType: ResourceType<I, T>
//   constructors: C
// }

type InferredResource<R extends ResourceConstructor<any, any, any>> = ReturnType<R>

// Type to infer the shape of the constructed resource object from a given PluginResourceConstructors object
type InferredResources<P extends PluginResourceConstructors> = {
  [K in keyof P]: P[K] extends Record<string, infer R>
    ? R extends ResourceConstructor<any, any, any>
      ? InferredResource<R>
      : never
    : never
}

export const createResources = <P extends PluginResourceConstructors, T extends Array<ResourceProvider<any, any, any>>>(
  providers: T,
  pluginId: PluginId,
  pluginConstructors: P,
) => providers.map((provider) => extractAndApplyConstructorsOfType(pluginId, provider.resourceType, pluginConstructors))

export const createResources2 = <
  P extends PluginResourceConstructors,
  T extends Array<ResourceProvider<any, any, any>>,
>(
  providers: T,
  pluginId: PluginId,
  pluginConstructors: P,
): InferredResources<P> => {
  return providers.reduce((acc, provider) => {
    const resourceObjects = extractAndApplyConstructorsOfType(pluginId, provider.resourceType, pluginConstructors)
    acc[provider.resourceType.id as keyof InferredResources<P>] = resourceObjects as InferredResource<
      typeof resourceObjects
    >
    return acc
  }, {} as InferredResources<P>) // Replace any with a more specific type if possible
}

// R E S O U R C E  P R O V I D E R

// export function createResourceProvider<F extends ResourceConstructors>(constructors: F): ResourceProvider<F> {
//   return {
//     constructors,
//   }
// }

// TEST

// type IntlResourceTypeId = 'i18n'

// type Primitive = string | number | boolean
// type Params = Record<string, Primitive>

// type IntlStringType<P extends Params> = ResourceType<IntlResourceTypeId, P>
// type IntlString<P extends Params> = Resource<IntlResourceTypeId, P>

// const translate = <P extends Params>(i18n: IntlString<P>, params: P): string => i18n.key + JSON.stringify(params)
// const i18n = <P(i18n: IntlString<P>) => (params: P) => translate(i18n, params)