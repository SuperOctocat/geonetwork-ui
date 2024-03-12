import { getAsUrl, mapKeywords } from './atomic-operations'

describe('atomic operations', () => {
  describe('getAsUrl', () => {
    it('parses relative URL', () => {
      expect(getAsUrl('images/abc.png')).toEqual(
        new URL('http://localhost/images/abc.png')
      )
    })
    it('parses absolute URL', () => {
      expect(getAsUrl('/org/images/abc.png')).toEqual(
        new URL('http://localhost/org/images/abc.png')
      )
    })
    it('parses fully qualified URL', () => {
      expect(getAsUrl('https://myorg.net/images/abc.png')).toEqual(
        new URL('https://myorg.net/images/abc.png')
      )
    })
    it('parses www url without protocol, adding HTTPs', () => {
      expect(getAsUrl('www.myorg.net')).toEqual(
        new URL('https://www.myorg.net/')
      )
    })
  })
  describe('mapKeywords', () => {
    it('should map keywords from thesauri', () => {
      const thesauri = [
        {
          id: '1',
          theme: 'theme',
          keywords: [
            { en: 'keyword1', fr: 'mot-clé1' },
            { en: 'keyword2', fr: 'mot-clé2' },
          ],
        },
        {
          id: '2',
          theme: 'place',
          keywords: [
            { en: 'keyword3', fr: 'mot-clé3' },
            { en: 'keyword4', fr: 'mot-clé4' },
          ],
        },
      ]
      const expected = [
        { value: 'keyword1', type: 'theme', thesaurusId: '1' },
        { value: 'keyword2', type: 'theme', thesaurusId: '1' },
        { value: 'keyword3', type: 'place', thesaurusId: '2' },
        { value: 'keyword4', type: 'place', thesaurusId: '2' },
      ]
      expect(mapKeywords(thesauri, 'en')).toEqual(expected)
    })

    it('should default type to "other" if theme is not provided', () => {
      const thesauri = [
        {
          id: '1',
          theme: '',
          keywords: [
            { en: 'keyword1', fr: 'mot-clé1' },
            { en: 'keyword2', fr: 'mot-clé2' },
          ],
        },
      ]
      const expected = [
        { value: 'keyword1', type: 'other', thesaurusId: '1' },
        { value: 'keyword2', type: 'other', thesaurusId: '1' },
      ]
      expect(mapKeywords(thesauri, 'en')).toEqual(expected)
    })
  })
})
