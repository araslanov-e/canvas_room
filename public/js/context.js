var canvas,
    ctx,
    windowImage = new Image(),
    blindImage = new Image(),
    outlineLayerData,
    colorLayerData,
		drawingAreaX = 0,
		drawingAreaY = 0,
		drawingAreaWidth,
		drawingAreaHeight,
    curColor = {
			r: 101,
			g: 155,
			b: 65
		};

window.onload = function(){
  canvas = document.getElementById('contest')     
  ctx = canvas.getContext('2d')

  drawingAreaWidth = canvas.width
  drawingAreaHeight = canvas.height

  windows = document.getElementById('windows').getElementsByTagName('img')
  for(var i = 0; i < windows.length; i++) {
    windows[i].onmousedown = function(){
      windowImage.src = this.src;
      canvas.width = canvas.width
      outlineLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      colorLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      draw();
    }
  }

  blinds = document.getElementById('blinds').getElementsByTagName('img')
  for(var i = 0; i < blinds.length; i++) {
    blinds[i].onmousedown = function(){
      blindImage.src = this.src;
      canvas.width = canvas.width
      outlineLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      colorLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      draw();
    }
  }

  function draw() {
    canvas.width = canvas.width
    ctx.putImageData(colorLayerData, 0, 0);
    drawRoom()
    drawObject(blindImage, 'destination-over')
    drawObject(windowImage, 'destination-over')
    console.info('drawing')
  }

  drawRoom = function() {
    ctx.beginPath()
    ctx.lineWidth = 3;
    
    ctx.moveTo(0, 0)
    ctx.lineTo(100, 40)

    ctx.moveTo(canvas.width, 0)
    ctx.lineTo(canvas.width-40, 100)

    ctx.moveTo(canvas.width, canvas.height)    
    ctx.lineTo(canvas.width-100, canvas.height-100)    

    ctx.moveTo(0, canvas.height)    
    ctx.lineTo(0, canvas.height-50)    

    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.rect(50, 50, canvas.width-100, canvas.height-100)

    ctx.stroke()
  }

  drawObject = function(obj, composite) {
    //obj.src = obj.src
    if (isImageOk(obj)) {
      ctx.globalCompositeOperation = composite
      ctx.drawImage(obj, canvas.width/2-obj.width/2, canvas.height/2-obj.height/2); 
      console.info('load')
      outlineLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      obj.onload = function() {
        ctx.globalCompositeOperation = composite
        ctx.drawImage(obj, canvas.width/2-obj.width/2, canvas.height/2-obj.height/2); 
        outlineLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.info('onload')
      }
    }
  }

  isImageOk = function(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) { return false; }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) { return false; }

    // No other way of checking: assume it’s ok.
    return true;
  }

  matchOutlineColor = function (r, g, b, a) {
    return (r + g + b < 100 && a === 255);
  }

  matchStartColor = function (pixelPos, startR, startG, startB) {
    var r = outlineLayerData.data[pixelPos],
      g = outlineLayerData.data[pixelPos + 1],
      b = outlineLayerData.data[pixelPos + 2],
      a = outlineLayerData.data[pixelPos + 3];

    // If current pixel of the outline image is black
    if (matchOutlineColor(r, g, b, a)) {
      return false;
    }

    r = colorLayerData.data[pixelPos];
    g = colorLayerData.data[pixelPos + 1];
    b = colorLayerData.data[pixelPos + 2];

    // If the current pixel matches the clicked color
    if (r === startR && g === startG && b === startB) {
      return true;
    }

    // If current pixel matches the new color
    if (r === curColor.r && g === curColor.g && b === curColor.b) {
      return false;
    }

    return true;
  }

  colorPixel = function (pixelPos, r, g, b, a) {
    colorLayerData.data[pixelPos] = r;
    colorLayerData.data[pixelPos + 1] = g;
    colorLayerData.data[pixelPos + 2] = b;
    colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;
  }

  floodFill = function (startX, startY, startR, startG, startB) {
    var newPos,
      x,
      y,
      pixelPos,
      reachLeft,
      reachRight,
      drawingBoundLeft = drawingAreaX,
      drawingBoundTop = drawingAreaY,
      drawingBoundRight = drawingAreaX + drawingAreaWidth - 1,
      drawingBoundBottom = drawingAreaY + drawingAreaHeight - 1,
      pixelStack = [[startX, startY]];

    while (pixelStack.length) {

      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];

      // Get current pixel position
      pixelPos = (y * canvas.width + x) * 4;

      // Go up as long as the color matches and are inside the canvas
      while (y >= drawingBoundTop && matchStartColor(pixelPos, startR, startG, startB)) {
        y -= 1;
        pixelPos -= canvas.width * 4;
      }

      pixelPos += canvas.width * 4;
      y += 1;
      reachLeft = false;
      reachRight = false;

      // Go down as long as the color matches and in inside the canvas
      while (y <= drawingBoundBottom && matchStartColor(pixelPos, startR, startG, startB)) {
        y += 1;

        colorPixel(pixelPos, curColor.r, curColor.g, curColor.b);

        if (x > drawingBoundLeft) {
          if (matchStartColor(pixelPos - 4, startR, startG, startB)) {
            if (!reachLeft) {
              // Add pixel to stack
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < drawingBoundRight) {
          if (matchStartColor(pixelPos + 4, startR, startG, startB)) {
            if (!reachRight) {
              // Add pixel to stack
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        pixelPos += canvas.width * 4;
      }
    }
  }

  paintAt = function (startX, startY) {

    var pixelPos = (startY * canvas.width + startX) * 4,
      r = colorLayerData.data[pixelPos],
      g = colorLayerData.data[pixelPos + 1],
      b = colorLayerData.data[pixelPos + 2],
      a = colorLayerData.data[pixelPos + 3];

    if (r === curColor.r && g === curColor.g && b === curColor.b) {
      // Return because trying to fill with the same color
      return;
    }

    if (matchOutlineColor(r, g, b, a)) {
      // Return because clicked outline
      return;
    }

    console.info(startX + ' ' + startY + ' | ' + r + g + b)

    floodFill(startX, startY, r, g, b)

    draw()
  }

  canvas.onmousedown = function(e) {
    var mouseX = e.pageX - this.offsetLeft,
        mouseY = e.pageY - this.offsetTop;
    console.info('Mouse:'+mouseX + ' ' + mouseY)
    
    paintAt(mouseX, mouseY)
  }

  drawRoom()
  // Test for cross origin security error (SECURITY_ERR: DOM Exception 18)
  try {
    outlineLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (ex) {
    window.alert("Application cannot be run locally. Please run on a server.");
    return;
  }
  //canvas.width = canvas.width
  colorLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  console.info(colorLayerData)
}
