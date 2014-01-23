class Color
  constructor: (hash) ->
    for property of hash
      @[property] = hash[property]

class Element
  constructor: (hash) ->
    for property of hash
      @[property] = hash[property]

  loadData: (callback) ->
    $.get @url, (data) =>
      @data = data
      console.log 'loaded ' + @url
      callback()
    , 'text'

  getImage: (callback) ->
    img = new Image
    img.src = 'data:image/svg+xml;base64,' + utf8_to_b64(@replaceData())
    img.onload = callback
    img

  replaceData: ->
    data = @data
    for color in @colors
      expression = new RegExp color.replace, 'g'
      data = data.replace(expression, color.color)
    data

@.elements = [
  new Element(
    url: 'images/rooms/стены.svg'
    colors: [
      new Color(
        title: 'Стены'
        replace: '#D1D3D4'
        color: '#FFFFFF'
      )
      new Color(
        title: 'Потолок'
        replace: '#808285'
        color: '#FFFFFF'
      )
      new Color(
        title: 'Пол'
        replace: '#58595B'
        color: '#FFFFFF'
      )
    ]
    visible: true
    drag: false
    offset:
      x: 0
      y: 0
  )
  new Element(
    url: 'images/windows/window.svg'
    colors: []
    visible: false
    drag: true
    offset:
      x: 0
      y: 0
  )
  new Element(
    url: 'images/blinds/blind.svg'
    colors: [
      new Color(
        title: 'Шторы'
        replace: '#FEFEFE'
        color: '#FFFFFF'
      )
    ]
    visible: false
    drag: true
    offset:
      x: 0
      y: 0
  )
]
