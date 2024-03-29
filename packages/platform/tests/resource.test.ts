//
//   Huly® Platform™ Core • platform/resource.test.ts
//   Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
//
// © 2024 Hardcore Engineering Inc. All Rights Reserved.
//

import { expect, test } from 'bun:test'

import { createLocale, createPlatform, createResourceType, type ResourceId } from '../src/platform'

const xtest = 'xtest'

type XResourceTypeId = typeof xtest

type Primitive = string | number | boolean
type Params = Record<string, Primitive>

type IntlString<P extends Params> = ResourceId<XResourceTypeId, P>

const translate = <P extends Params>(i18n: IntlString<P>, params: P): string =>
  i18n.pluginId + '-' + i18n.type.id + '-' + i18n.key + '-' + JSON.stringify(params)

const locale = createLocale('en')
const platform = createPlatform(locale, { out: console.log }).loadModule({
  id: 'xtest',
  api: {},
  resources: {
    xtest: {
      type: createResourceType<XResourceTypeId, Params>(xtest),
      factory:
        <P extends Params>() =>
        (i18n: IntlString<P>) =>
        (params: P) =>
          translate(i18n, params),
    },
  },
})

const plugin = platform.plugin('xxx', (factories) => ({
  xtest: {
    Key1: factories.xtest<{ year: 2024 }>(),
  },
}))

test('resource', () => {
  expect(plugin.xtest.Key1({ year: 2024 })).toBe('xxx-xtest-Key1-{"year":2024}')
})
