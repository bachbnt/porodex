import { describe, expect, it } from 'vitest'
// @ts-expect-error plain JS module shared with the sync script
import { cleanDesc, resolveTokens } from '../scripts/lib/text.mjs'

describe('resolveTokens', () => {
  it('fills named variables and multiplies by the factor', () => {
    expect(resolveTokens('Deal @Damage@ (@Ratio*100@%)', { Damage: 120, Ratio: 0.15 })).toBe('Deal 120 (15%)')
  })

  it('shows per-star arrays as a / b / c', () => {
    expect(resolveTokens('@Damage@', { Damage: [100, 200, 300] })).toBe('100 / 200 / 300')
  })

  it('falls back from ModifiedX to X', () => {
    expect(resolveTokens('@ModifiedDamage@', { Damage: 50 })).toBe('50')
  })

  it('marks unknown variables and drops unit-property references', () => {
    expect(cleanDesc(resolveTokens('x @Nope@ y @TFTUnitProperty.:Foo@', {}))).toBe(
      'x <span class="x-var">?</span> y',
    )
  })
})

describe('cleanDesc', () => {
  it('keeps only br and span tags and escapes everything else', () => {
    const html = cleanDesc('<script>alert(1)</script><b>bold</b> a < b & c')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<b>')
    expect(html).toContain('a &lt; b &amp; c')
  })

  it('turns damage tags into classed spans and line breaks into <br>', () => {
    expect(cleanDesc('<magicDamage>10</magicDamage><br>next')).toBe('<span class="x-magic">10</span><br>next')
  })

  it('handles literal \\n sequences and joins adjacent scale icons', () => {
    expect(cleanDesc('a\\r\\nb')).toBe('a<br>b')
    expect(cleanDesc('%i:scaleAD%%i:scaleAP%', { lang: 'en' })).toBe('AD/AP')
  })

  it('localises icon labels', () => {
    expect(cleanDesc('%i:scaleAP%', { lang: 'vi' })).toBe('SMPT')
  })
})
