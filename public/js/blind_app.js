var BlindApp = (function(){
  var canvas,
      context,
      canvasWidth = 800,
      canvasHeight = 600,
      windowsBlock = 'windows',
      blindsBlock = 'blinds',
      windowImage = new Image(),
      blindImage = new Image(),
      outlineLayerData,
      colorLayerData,
      curColor = {
        r: 255,
        g: 255,
        b: 255
      }

  // очистить canvas
  clearCanvas = function(){
    context.clearRect(0, 0, canvasWidth, canvasHeight)
    //canvas.width = canvas.width
  }

  // проверить загружен ли объект
  isImageOk = function(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) { return false }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) { return false }

    // No other way of checking: assume it’s ok.
    return true
  }

  // нарисовать комнату
  drawRoom = function() {
    context.beginPath()
    context.lineWidth = 3
    
    context.moveTo(0, 0)
    context.lineTo(100, 40)

    context.moveTo(canvasWidth, 0)
    context.lineTo(canvasWidth-100, 40)

    context.moveTo(canvasWidth, canvasHeight)    
    context.lineTo(canvasWidth-100, canvasHeight-100)    

    context.moveTo(0, canvasHeight)    
    context.lineTo(100, canvasHeight-100)    

    context.rect(0, 0, canvasWidth, canvasHeight)
    context.rect(100, 40, canvasWidth-200, canvasHeight-140)

    context.stroke()
  }

  // отобразить объект
  drawObject = function(obj, composite) {
    context.globalCompositeOperation = composite
    if (isImageOk(obj)) {
      context.drawImage(obj, canvasWidth/2-obj.width/2, canvasHeight/2-obj.height/2) 
      outlineLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight)
    } else {
      obj.onload = function() {
        context.drawImage(obj, canvasWidth/2-obj.width/2, canvasHeight/2-obj.height/2) 
        outlineLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight)
      }
    }
  }

  redraw = function() {
    clearCanvas()
    context.putImageData(colorLayerData, 0, 0)
    drawRoom()
    drawObject(blindImage, 'destination-over')
    drawObject(windowImage, 'destination-over')
  }

  // 
  matchOutlineColor = function (r, g, b, a) {
    return (r + g + b < 100 && a === 255)
  }

  // 
  matchStartColor = function (pixelPos, startR, startG, startB) {
    var r = outlineLayerData.data[pixelPos],
      g = outlineLayerData.data[pixelPos + 1],
      b = outlineLayerData.data[pixelPos + 2],
      a = outlineLayerData.data[pixelPos + 3]

    // If current pixel of the outline image is black
    if (matchOutlineColor(r, g, b, a)) {
      return false
    }

    r = colorLayerData.data[pixelPos]
    g = colorLayerData.data[pixelPos + 1]
    b = colorLayerData.data[pixelPos + 2]

    // If the current pixel matches the clicked color
    if (r === startR && g === startG && b === startB) {
      return true
    }

    // If current pixel matches the new color
    if (r === curColor.r && g === curColor.g && b === curColor.b) {
      return false
    }

    return true
  }

  // изменить цвет точку
  colorPixel = function (pixelPos, r, g, b, a) {
    colorLayerData.data[pixelPos] = r
    colorLayerData.data[pixelPos + 1] = g
    colorLayerData.data[pixelPos + 2] = b
    colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255
  }

  // закрасить контур 
  floodFill = function (startX, startY, startR, startG, startB) {
    var newPos,
        x,
        y,
        pixelPos,
        reachLeft,
        reachRight,
        drawingBoundLeft = 0,
        drawingBoundTop = 0,
        drawingBoundRight = canvasWidth - 1,
        drawingBoundBottom = canvasHeight - 1,
        pixelStack = [[startX, startY]]

    while (pixelStack.length) {
      newPos = pixelStack.pop()
      x = newPos[0]
      y = newPos[1]

      // Get current pixel position
      pixelPos = (y * canvasWidth + x) * 4

      // Go up as long as the color matches and are inside the canvas
      while (y >= drawingBoundTop && matchStartColor(pixelPos, startR, startG, startB)) {
        y--
        pixelPos -= canvasWidth * 4
      }

      pixelPos += canvasWidth * 4
      y++
      reachLeft = false
      reachRight = false

      // Go down as long as the color matches and in inside the canvas
      while (y <= drawingBoundBottom && matchStartColor(pixelPos, startR, startG, startB)) {
        y++

        colorPixel(pixelPos, curColor.r, curColor.g, curColor.b)

        if (x > drawingBoundLeft) {
          if (matchStartColor(pixelPos - 4, startR, startG, startB)) {
            if (!reachLeft) {
              // Add pixel to stack
              pixelStack.push([x - 1, y])
              reachLeft = true
            }
          } else if (reachLeft) {
            reachLeft = false
          }
        }

        if (x < drawingBoundRight) {
          if (matchStartColor(pixelPos + 4, startR, startG, startB)) {
            if (!reachRight) {
              // Add pixel to stack
              pixelStack.push([x + 1, y])
              reachRight = true
            }
          } else if (reachRight) {
            reachRight = false
          }
        }

        pixelPos += canvasWidth * 4
      }
    }
  }

  //
  paintAt = function (startX, startY) {
    var pixelPos = (startY * canvasWidth + startX) * 4,
        r = colorLayerData.data[pixelPos],
        g = colorLayerData.data[pixelPos + 1],
        b = colorLayerData.data[pixelPos + 2],
        a = colorLayerData.data[pixelPos + 3]

    if (r === curColor.r && g === curColor.g && b === curColor.b) {
      // Return because trying to fill with the same color
      return
    }

    if (matchOutlineColor(r, g, b, a)) {
      // Return because clicked outline
      return
    }

    floodFill(startX, startY, r, g, b)
    redraw()
  }
  
  // создание событий мыши
  createMouseEvents = function() {
    // нажатие на canvas
    canvas.onmousedown = function(e) {
      var mouseX = e.pageX - this.offsetLeft,
          mouseY = e.pageY - this.offsetTop
      console.info('Mouse:'+mouseX + ' ' + mouseY)
      
      paintAt(mouseX, mouseY)
    }
    
    // событие при выборе объекта 
    setObjectEvent = function(idBlock, obj){
      var list = document.getElementById(idBlock).getElementsByTagName('img')
      for(var i = 0; i < list.length; i++) {
        list[i].onmousedown = function(){
          obj.src = this.src
          clearCanvas()
          outlineLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight)
          colorLayerData = outlineLayerData
          redraw()
        }
      }
    }

    setObjectEvent(windowsBlock, windowImage)
    setObjectEvent(blindsBlock, blindImage)
  }

  init = function(id){
			// создание canvas (необходимо для IE, поскольку он не знает такой элемент)
			canvas = document.createElement('canvas')
			canvas.setAttribute('width', canvasWidth)
			canvas.setAttribute('height', canvasHeight)
			canvas.setAttribute('id', 'canvas')
			document.getElementById(id).appendChild(canvas)

			if (typeof G_vmlCanvasManager !== "undefined") {
				canvas = G_vmlCanvasManager.initElement(canvas)
			}

			// IE8 и ранее не поддерживают синтаксис: context = document.getElementById('canvas').getContext("2d")
			context = canvas.getContext("2d")

      // добавляем ColorPicker
      colorPicker = $('<div>', {id: 'color_picker'}).ColorPicker({
        color: '#ffffff',
        onShow: function (colpkr) {
          $(colpkr).fadeIn(500)
          return false
        },
        onHide: function (colpkr) {
          $(colpkr).fadeOut(500)
          return false;
        },          
        onChange: function(hsb, hex, rgb){
          curColor = rgb
          $('#color_picker').css('backgroundColor', '#' + hex);
        }
      })
      $('#'+id).append(colorPicker)

      drawRoom()  

      // Test for cross origin security error (SECURITY_ERR: DOM Exception 18)
      try {
        outlineLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight)
      } catch (ex) {
        window.alert("Приложение не может быть запущено локально. Попробуйте запустить на сервере.")
        return
      }
      clearCanvas()
      colorLayerData = context.getImageData(0, 0, canvasWidth, canvasHeight)

      createMouseEvents()
      redraw()
  }

	return {
		init: init
	}

}())
