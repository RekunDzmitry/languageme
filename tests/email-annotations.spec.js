import { expect, test } from '@playwright/test'

test.describe('email annotation resolution', () => {
  async function resolveInBrowser(page, userText, errors) {
    await page.goto('http://127.0.0.1:5173/')
    return page.evaluate(async ({ userText, errors }) => {
      const { resolveEmailAnnotations } = await import('http://127.0.0.1:5173/src/components/email/emailAnnotations.js')
      return resolveEmailAnnotations(userText, errors)
    }, { userText, errors })
  }

  test('keeps exact offsets unchanged', async ({ page }) => {
    const resolved = await resolveInBrowser(page, 'Ala ma kota', [
      {
        id: 'err_a',
        originalText: 'kota',
        correction: 'kot',
        startOffset: 7,
        endOffset: 11,
      },
    ])

    expect(resolved).toMatchObject([
      {
        annotationId: 'err_a',
        originalText: 'kota',
        startOffset: 7,
        endOffset: 11,
      },
    ])
  })

  test('repairs bad offsets to the nearest matching original text', async ({ page }) => {
    const text = 'chciałbym pójść, a potem chciałbym wrócić'
    const resolved = await resolveInBrowser(page, text, [
      {
        id: 'err_b',
        originalText: 'chciałbym',
        correction: 'chciałbym',
        startOffset: 24,
        endOffset: 32,
      },
    ])

    expect(resolved).toHaveLength(1)
    expect(resolved[0]).toMatchObject({
      annotationId: 'err_b',
      originalText: 'chciałbym',
      startOffset: 25,
      endOffset: 34,
    })
  })

  test('drops annotations whose text cannot be matched safely', async ({ page }) => {
    const resolved = await resolveInBrowser(page, 'Poprawny tekst', [
      {
        id: 'err_missing',
        originalText: 'nieistniejący',
        correction: 'tekst',
        startOffset: 0,
        endOffset: 5,
      },
    ])

    expect(resolved).toEqual([])
  })

  test('prefers shorter precise annotations over broad overlapping ranges', async ({ page }) => {
    const text = 'To jest wielka galeria sztuki'
    const resolved = await resolveInBrowser(page, text, [
      {
        id: 'broad',
        originalText: 'wielka galeria',
        correction: 'duża galeria',
        startOffset: 8,
        endOffset: 22,
      },
      {
        id: 'precise',
        originalText: 'wielka',
        correction: 'duża',
        startOffset: 8,
        endOffset: 14,
      },
    ])

    expect(resolved.map(err => err.annotationId)).toEqual(['precise'])
    expect(resolved[0]).toMatchObject({
      originalText: 'wielka',
      startOffset: 8,
      endOffset: 14,
    })
  })
})
