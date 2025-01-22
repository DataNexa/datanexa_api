import SearchTransform from "./SearchTransform"

SearchTransform

test('transformação de texto completo', () => {
    expect(SearchTransform("+palavra1+palavra2 palavra3   -palavra4 +palavra5")).toMatchObject({
        obrigatorias: [ 'palavra1 palavra2', 'palavra5' ],
        podeTer: [ 'palavra3' ],
        naoPodemTer: [ 'palavra4' ]
    })
})

test('transformação de texto apenas com palavras proibidas e compostas', () => {
    expect(SearchTransform(" -palavra1+palavra2+palavra3 -palavra4+palavra5")).toMatchObject({
        obrigatorias: [],
        podeTer: [],
        naoPodemTer: ['palavra1 palavra2 palavra3', 'palavra4 palavra5']
    })
})

