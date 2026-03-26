import { buildPolicyMapSearch, parsePolicyMapSearch } from '@/utils/policyMapUrl'
import { expect, test } from 'vitest'

test('builds and parses filters', () => {
  const search = buildPolicyMapSearch({
    q: 'AI',
    region: '上海',
    types: ['补贴', '人才'],
    audiences: ['一人公司'],
    updatedWithinDays: 30,
  })

  const parsed = parsePolicyMapSearch(search)
  expect(parsed).toEqual({
    q: 'AI',
    region: '上海',
    types: ['补贴', '人才'],
    audiences: ['一人公司'],
    updatedWithinDays: 30,
  })
})
