class Contest
  @currentElement: null
  @sourceCanvas
  @sourceContext
  @destinationCanvas
  @destinationContext
  @canvasWidth = 800
  @canvasHeight = 600

  @loadElements: (callback) ->
    counter = 0
    for element in elements
      element.loadData ->
        counter++
        callback() if counter is elements.length
  
  @drawElements: (callback) ->
    counter = 0
    visibleElements = (element for element in elements when element.visible)
    callback() if visibleElements.length is 0
    for element in visibleElements
      do (element) ->
        element.getImage ->
          Contest.sourceContext.drawImage(
            @
            element.offset.x
            element.offset.y
            Math.floor(@width * element.scale)
            Math.floor(@height * element.scale)
          )
          counter++
          callback() if counter is visibleElements.length

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
    settings = $('#settings')
    settings.empty()

    show = $('<div>', id: 'show')
    colors = $('<div>', id: 'colors')
    scale = $('<div>', id: 'scale')

    # show
    input = $('<input>', type: 'checkbox')
      .attr('checked', @currentElement.visible)
      .on 'change', (e) ->
        Contest.currentElement.visible = !Contest.currentElement.visible
        Contest.redrawCanvas()

    show.append(input).append('Отобразить').appendTo(settings)

    # colors
    for color, index in @currentElement.colors
      do (color, index) ->
        colors.append(color.title).appendTo(settings)
        $('<div>', id: 'color_' + index, class: 'element_color')
        .css('background-color', color.color)
        .ColorPicker
          color: color.color
          onShow: (colpkr) ->
            $(colpkr).fadeIn(500)
            false
          onHide: (colpkr) ->
            $(colpkr).fadeOut(500)
            false
          onChange: (hsb, hex, rgb) ->
            color.color = '#' + hex
            $('#color_' + index).css 'background-color', color.color
            Contest.redrawCanvas()
        .appendTo(colors)

    # scale
    if @currentElement.drag
      scale.append('Масштаб').appendTo(settings)
      $('<div>').slider(
        min: 0
        max: 200
        value: @currentElement.scale * 100
        slide: (event, ui) ->
          Contest.currentElement.scale = ui.value / 100
          Contest.redrawCanvas()
      )
      .appendTo(scale)
      scale.appendTo(settings)


  @init: ->
    @loadElements ->
      Contest.initCanvas()
      Contest.showToolBar()

  @initCanvas: ->
    drag = false
    mouseX = mouseY = primaryX = primaryY = 0

    @sourceCanvas = $('#source_canvas').attr
      width: @canvasWidth
      height: @canvasHeight

    @destinationCanvas = $('#destination_canvas').attr
      width: @canvasWidth
      height: @canvasHeight
    .on 'mousedown', (e) ->
      if Contest.currentElement
        drag = true
        mouseX = e.pageX
        mouseY = e.pageY
        primaryX = Contest.currentElement.offset.x
        primaryY = Contest.currentElement.offset.y
    .on 'mouseup', (e) ->
      drag = false
    .on 'mouseout', (e) ->
      drag = false
    .on 'mousemove', (e) ->
      if drag && Contest.currentElement.drag
        Contest.currentElement.offset.x = primaryX + e.pageX - mouseX
        Contest.currentElement.offset.y = primaryY + e.pageY - mouseY
        Contest.redrawCanvas()

    @sourceCanvas = @sourceCanvas[0]
    @destinationCanvas = @destinationCanvas[0]

    @sourceContext = @sourceCanvas.getContext('2d')
    @destinationContext = @destinationCanvas.getContext('2d')

    @redrawCanvas()

  @clearCanvas: ->
    @sourceContext.clearRect(0, 0, @canvasWidth, @canvasHeight)

  @copyCanvas: ->
    imageData = @sourceContext.getImageData(0, 0, @canvasWidth, @canvasHeight)
    @destinationContext.putImageData(imageData, 0, 0)

  @redrawCanvas: ->
    @clearCanvas()
    @drawElements ->
      Contest.copyCanvas()

@.Contest = Contest





