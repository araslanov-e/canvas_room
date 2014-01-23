class Contest
  @currentElement: null
  @canvas
  @canvasWidth = 800
  @canvasHeight = 600
  @context

  @loadElements: (callback) ->
    counter = 0

    # загружаем объекты в память
    for element in elements
      element.loadData ->
        counter++
        callback() if counter is elements.length
  
  @drawElements: ->
    for element in elements when element.visible
      do (element) ->
        element.getImage ->
          Contest.context.drawImage(@, element.offset.x, element.offset.y)

  @showToolBar: ->
    for element in elements
      do (element) ->
        element.getImage ->
          $('#toolbar').append @
          @onclick = ->
            $('#toolbar .active').removeClass 'active'
            $(@).addClass 'active'
            Contest.currentElement = element
            Contest.showElementSettings()

  @showElementSettings: ->
    $('#settings').empty()

    # 
    $('<input>', type: 'checkbox')
    .attr('checked', @currentElement.visible)
    .appendTo('#settings')
    .on 'change', (e) ->
      Contest.currentElement.visible = !Contest.currentElement.visible
      Contest.redrawCanvas()
      #e.preventDefault()

  @init: ->
    @loadElements ->
      Contest.initCanvas()
      Contest.showToolBar()

  @initCanvas: ->
    drag = false
    x = y = 0
    ex = ey = 0
    @canvas = $('#sourceCanvas').attr
      width: @canvasWidth
      height: @canvasHeight
    .on 'mousedown', (e) ->
      drag = true
      x = e.pageX
      y = e.pageY
      ex = Contest.currentElement.offset.x
      ey = Contest.currentElement.offset.y
    .on 'mouseup', (e) ->
      drag = false
    .on 'mouseout', (e) ->
      drag = false
    .on 'mousemove', (e) ->
      if drag && Contest.currentElement.drag
        Contest.currentElement.offset.x = ex + e.pageX - x
        Contest.currentElement.offset.y = ey + e.pageY - y
        Contest.redrawCanvas()

    @canvas = @canvas[0]

    #if typeof G_vmlCanvasManager != "undefined"
      #@canvas = G_vmlCanvasManager.initElement(@canvas)

    @context = @canvas.getContext('2d')
    @redrawCanvas()

    console.log 'draw canvas'

  @clearCanvas: ->
    @context.clearRect(0, 0, @canvasWidth, @canvasHeight)

  @redrawCanvas: ->
    @clearCanvas()
    @drawElements()

@.Contest = Contest





