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
    img.src = 'data:image/svg+xml;base64,' + utf8_to_b64(@data)
    img.onload = callback
    img

@.elements = [
  new Element(
    url: 'images/room.svg'
    color: '#FEFEFE'
    visible: true
    drag: false
    offset:
      x: 0
      y: 0
  )
  new Element(
    url: 'images/window.svg'
    color: '#FEFEFE'
    visible: false
    drag: true
    offset:
      x: 0
      y: 0
  )
  new Element(
    url: 'images/blind.svg'
    color: '#FEFEFE'
    visible: false
    drag: true
    offset:
      x: 0
      y: 0
  )
]
