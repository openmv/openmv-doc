{{
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CMUcam4 Terminal
//
// Author: Kwabena W. Agyeman
// Updated: 11/16/2012
// Designed For: P8X32A
// Version: 1.00
//
// Copyright (c) 2012 Kwabena W. Agyeman
// See end of file for terms of use.
//
// Update History:
//
// v1.00 - Original release - 11/16/2012
//
// Only for the CMUcam4.
//
// Nyamekye,
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}}

OBJ

  cam: "CMUcam4_CAMEngine.spin"
  com: "Full-Duplex_COMEngine.spin"

CON

  _CLKMODE = XTAL1 + PLL16X
  _XINFREQ = 6_000_000

  _PUSH_BUTTON_PIN = 20
  _POWER_LED_PIN = 21

  _SERIAL_TX_PIN = 30
  _SERIAL_RX_PIN = 31

  _DEFAULT_BAUDRATE = 19_200
  _DEFAULT_EXTRA_STOP_BITS = 0

  _SERIAL_BYTES = 256 ' Includes the null terminator.
  _SERIAL_LONGS = ((_SERIAL_BYTES + 3) / 4)

  _NEWLINE = com#Carriage_Return
  _TAB = com#Horizontal_Tab
  _BACKSPACE = com#Backspace
  _NULL = com#Null

  _MAIN_WAIT = 3 ' In seconds.

  _CLKSEL_MASK = (%111 << 0)
  _OSCM_MASK = (%11 << 3)
  _OSCENA_MASK = (%1 << 5)
  _PLLENA_MASK = (%1 << 6)
  _RESET_MASK = (%1 << 7)

  _PLL_OSC_OSCM_MASK = (_PLLENA_MASK | _OSCENA_MASK | _OSCM_MASK)

  _RC_SLOW_MODE = 1
  _RC_FAST_MODE = 0 

  _RC_SLOW_FREQUENCY = 20_000
  _RC_FAST_FREQUENCY = 12_000_000

  _PLL_STABILIZE_TIME = 10_000
  _OSC_STABILIZE_TIME = 100
  
PUB main | resultReturn, byteBuffer, byteCounter, byteArray[_SERIAL_LONGS] 

  com.COMEngineStart(_SERIAL_RX_PIN, _SERIAL_TX_PIN, _DEFAULT_BAUDRATE)
  waitcnt((clkfreq * _MAIN_WAIT) + cnt) 
  
  com.receiverFlush
  com.stopBitTiming(_DEFAULT_EXTRA_STOP_BITS)
  com.writeByte(_NEWLINE)
  
  repeat
  
    longfill(@byteArray, byteCounter := 0, _SERIAL_LONGS)
    com.writeByte(">")

    repeat
      byteBuffer := com.readByte

      if(byteBuffer == _TAB)
        byteBuffer := " "

      if((byteBuffer == _BACKSPACE) and byteCounter)
        byteArray.byte[--byteCounter] := _NULL

      if(     (" " =< byteBuffer) and (byteBuffer =< "~") {
        } and (byteCounter < constant(_SERIAL_BYTES - 1)) )
        if(("a" =< byteBuffer) and (byteBuffer =< "z"))
          byteBuffer -= constant("a" - "A")

        byteArray.byte[byteCounter++] := byteBuffer
    while(byteBuffer <> _NEWLINE)

    resultReturn := \programParser(@byteArray)
    com.writeString(resultReturn)

PRI programParser(stringPointer)

  stringPointer := STRToken(stringPointer)

  LF_wrapper(stringPointer)
  LFAB_wrapper(stringPointer)
  LFAH_wrapper(stringPointer)
  LFABAH_wrapper(stringPointer)

  SFB_wrapper(stringPointer)
  STB_wrapper(stringPointer)
  SBB_wrapper(stringPointer)
  SHB_wrapper(stringPointer)  

  IC_wrapper(stringPointer) 
  FC_wrapper(stringPointer) 

  HTTFBQ1_wrapper(stringPointer)
  HTTFBQ2_wrapper(stringPointer)
  HTTFBQ3_wrapper(stringPointer)
  HTTFBQ4_wrapper(stringPointer)

  AGC_wrapper(stringPointer)
  AWB_wrapper(stringPointer)
  BS_wrapper(stringPointer)
  CS_wrapper(stringPointer)
  VFS_wrapper(stringPointer)
  HMS_wrapper(stringPointer)  

  HistogramBasedMotionDetector(stringPointer)
  HBMDWithoutDebug(stringPointer)    
  
  ifnot(strsize(stringPointer))
    abort string("ACK", _NEWLINE)

  abort string("NCK", _NEWLINE)

PRI LF_wrapper(stringPointer)

  if(strcomp(stringPointer, string("LF")))
    com.writeString(string("Load Frame returned: "))
    com.writeString(DECOut(not(cam.loadFrame(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)

PRI LFAB_wrapper(stringPointer)

  if(strcomp(stringPointer, string("LFAB")))
    com.writeString(string("Load Frame And Bitmap returned: "))
    com.writeString(DECOut(not(cam.loadFrameAndBitmap(DECIn(STRToken(_NULL)), DECIn(STRToken(_NULL)) << 2))))
    abort string(_NEWLINE)

PRI LFAH_wrapper(stringPointer)

  if(strcomp(stringPointer, string("LFAH")))
    com.writeString(string("Load Frame And Histogram returned: "))
    com.writeString(DECOut(not(cam.loadFrameAndHistogram(DECIn(STRToken(_NULL)), DECIn(STRToken(_NULL)) << 4))))
    abort string(_NEWLINE)

PRI LFABAH_wrapper(stringPointer)

  if(strcomp(stringPointer, string("LFABAH")))         
    com.writeString(string("Load Frame And Bitmap And Histogram returned: "))
    com.writeString(DECOut(not(cam.loadFrameAndBitampAndHistogram( DECIn(STRToken(_NULL)), {
                                                                 } DECIn(STRToken(_NULL)) << 2, {
                                                                 } DECIn(STRToken(_NULL)) << 4  ))))
    abort string(_NEWLINE)

PRI SFB_wrapper(stringPointer)

  if(strcomp(stringPointer, string("SFB"))) 
    com.writeString(string("Save Frame Buffer returned: "))
    result := \cam.saveFrameBuffer
    com.writeString(DECOut(result))
    abort string(_NEWLINE)

PRI STB_wrapper(stringPointer)

  if(strcomp(stringPointer, string("STB")))
    com.writeString(string("Save Threshold Buffer returned: "))
    result := \cam.saveThresholdBuffer
    com.writeString(DECOut(result))
    abort string(_NEWLINE)
 
PRI SBB_wrapper(stringPointer)

  if(strcomp(stringPointer, string("SBB")))   
    com.writeString(string("Save Bitmap Buffer returned: "))
    result := \cam.saveBitmapBuffer
    com.writeString(DECOut(result))
    abort string(_NEWLINE)

PRI SHB_wrapper(stringPointer)  

  if(strcomp(stringPointer, string("SHB")))
    com.writeString(string("Save Histogram Buffer returned: "))
    result := \cam.saveHistogramBuffer 
    com.writeString(DECOut(result))
    abort string(_NEWLINE)

PRI IC_wrapper(stringPointer)

  if(strcomp(stringPointer, string("IC")))
    com.writeString(string("Init Camera returned: "))
    com.writeString(DECOut(not(cam.initCamera)))
    abort string(_NEWLINE)
 
PRI FC_wrapper(stringPointer)

  if(strcomp(stringPointer, string("FC")))
    com.writeString(string("Fini Camera returned: "))
    com.writeString(DECOut(not(cam.finiCamera)))
    abort string(_NEWLINE) 

PRI HTTFBQ1_wrapper(stringPointer)

  if(strcomp(stringPointer, string("HTTFBQ1")))
    com.writeString(string("Histogram To Threshold Feed Back Q1 returned: "))
    com.writeString(DECOut(cam.histogramToThresholdFeedBackQ1(DECIn(STRToken(_NULL)), DECIn(STRToken(_NULL)))))
    abort string(_NEWLINE)  

PRI HTTFBQ2_wrapper(stringPointer)

  if(strcomp(stringPointer, string("HTTFBQ2")))
    com.writeString(string("Histogram To Threshold Feed Back Q2 returned: "))
    com.writeString(DECOut(cam.histogramToThresholdFeedBackQ2(DECIn(STRToken(_NULL)), DECIn(STRToken(_NULL)))))
    abort string(_NEWLINE)

PRI HTTFBQ3_wrapper(stringPointer)

  if(strcomp(stringPointer, string("HTTFBQ3")))
    com.writeString(string("Histogram To Threshold Feed Back Q3 returned: "))
    com.writeString(DECOut(cam.histogramToThresholdFeedBackQ3(DECIn(STRToken(_NULL)), DECIn(STRToken(_NULL)))))
    abort string(_NEWLINE)

PRI HTTFBQ4_wrapper(stringPointer)

  if(strcomp(stringPointer, string("HTTFBQ4")))
    com.writeString(string("Histogram To Threshold Feed Back Q4 returned: "))
    com.writeString(DECOut(cam.histogramToThresholdFeedBackQ4(DECIn(STRToken(_NULL)), DECIn(STRToken(_NULL)))))
    abort string(_NEWLINE)        

PRI AGC_wrapper(stringPointer)

  if(strcomp(stringPointer, string("AGC")))
    com.writeString(string("Automatic Gain Control Setting returned: "))
    com.writeString(DECOut(not(cam.AGCSetting(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)

PRI AWB_wrapper(stringPointer)

  if(strcomp(stringPointer, string("AWB")))
    com.writeString(string("Automatic White Balance Setting returned: "))
    com.writeString(DECOut(not(cam.AWBSetting(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)

PRI BS_wrapper(stringPointer)

  if(strcomp(stringPointer, string("BS")))
    com.writeString(string("Brightness Setting returned: "))
    com.writeString(DECOut(not(cam.brightnessSetting(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)

PRI CS_wrapper(stringPointer)

  if(strcomp(stringPointer, string("CS")))
    com.writeString(string("Contrast Setting returned: "))
    com.writeString(DECOut(not(cam.contrastSetting(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)

PRI VFS_wrapper(stringPointer)

  if(strcomp(stringPointer, string("VFS")))
    com.writeString(string("Vertical Flip Setting returned: "))
    com.writeString(DECOut(not(cam.verticalFlipSetting(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)

PRI HMS_wrapper(stringPointer)

  if(strcomp(stringPointer, string("HMS")))
    com.writeString(string("Horizontal Mirror Setting returned: "))
    com.writeString(DECOut(not(cam.horizontalMirrorSetting(DECIn(STRToken(_NULL))))))
    abort string(_NEWLINE)    

CON

  _CRITICAL_VALUE_50_00 = 254 ' 50.00% Percent Confidence Test - X(a, v) = X(0.5000, 256 - 1) = 254.3 = 254 
  _CRITICAL_VALUE_90_00 = 284 ' 90.00% Percent Confidence Test - X(a, v) = X(0.1000, 256 - 1) = 284.3 = 284
  _CRITICAL_VALUE_95_00 = 293 ' 95.00% Percent Confidence Test - X(a, v) = X(0.0500, 256 - 1) = 293.2 = 293
  _CRITICAL_VALUE_99_00 = 311 ' 99.00% Percent Confidence Test - X(a, v) = X(0.0100, 256 - 1) = 310.5 = 311      
  _CRITICAL_VALUE_99_50 = 317 ' 99.50% Percent Confidence Test - X(a, v) = X(0.0050, 256 - 1) = 316.9 = 317
  _CRITICAL_VALUE_99_90 = 331 ' 99.90% Percent Confidence Test - X(a, v) = X(0.0010, 256 - 1) = 330.5 = 331
  _CRITICAL_VALUE_99_95 = 336 ' 99.95% Percent Confidence Test - X(a, v) = X(0.0005, 256 - 1) = 335.9 = 336
  _CRITICAL_VALUE_99_99 = 348 ' 99.99% Percent Confidence Test - X(a, v) = X(0.0001, 256 - 1) = 347.7 = 348

  ' http://www.mpi-hd.mpg.de/astrophysik/HEA/internal/Numerical_Recipes/f14-3.pdf
  ' http://www.stat.tamu.edu/~west/applets/chisqdemo.html

  _MINIMUM_SAMPLE_RATE = 0  
  _MAXIMUM_SAMPLE_RATE = 7 

  ' Debouncing Policy:
  '
  ' 1 hit in a row to activate.
  ' 32 misses in a row to deactive.

  ' NOTE: Average lag adds a hysteresis of about 2 minutes. 

PRI HistogramBasedMotionDetector(stringPointer) | i, j, k, x, sampleRate, criticalValue, HBAverage[128] 

  if(strcomp(stringPointer, string("HBMD")))                
    com.writeString(string("Histogram Based Motion Detector: "))

    outa[_POWER_LED_PIN] := 0
    dira[_POWER_LED_PIN] := 1

    sampleRate := _MAXIMUM_SAMPLE_RATE
    criticalValue := _CRITICAL_VALUE_95_00
    
    cam.initCamera
    waitcnt(clkfreq + cnt)     
    cam.loadFrame(cam#_CAM_FB_NEW)
    j := k := 0

    'cam.AGCSetting(false)
    'cam.AWBSetting(false)
      
    repeat
      com.writeString(DECOut(sampleRate))

      if(sampleRate < constant(_MAXIMUM_SAMPLE_RATE / 2)) 
        cam.finiCamera
      
      waitcnt(((clkfreq * 1) >> sampleRate) + cnt)

      if(sampleRate < constant(_MAXIMUM_SAMPLE_RATE / 2))       
        cam.initCamera
        waitcnt(clkfreq + cnt)         

      repeat i from 0 to 255 ' Average histograms.
        HBAverage.word[i] := ((HBAverage.word[i] + cam.getHistogramBufferValue(i)) / 2)
      
      cam.loadFrameAndHistogram(cam#_CAM_FB_AVERAGE, cam#_CAM_HB_DIFFERENCE)        

      ifnot(j~~) ' Initialize histogram buffer average.
        wordmove(@HBAverage, cam.getHistogramBufferAddress, 256)  
      
      x := 0
      
      repeat i from 0 to 255 ' Compute chi square value.
        x += ( ( (HBAverage.word[i] - cam.getHistogramBufferValue(i)) * (HBAverage.word[i] - cam.getHistogramBufferValue(i)) ) {
             } / (HBAverage.word[i] + cam.getHistogramBufferValue(i)) )

      x := (||(x => criticalValue))
      k := ((k << 1) | x)
      
      outa[_POWER_LED_PIN] := (k <> 0)

      if(x) ' When triggered...
        sampleRate := ((sampleRate - 2) #> _MINIMUM_SAMPLE_RATE) ' Slow down...

        case criticalValue ' Make threshold easier to trigger.

          _CRITICAL_VALUE_50_00: criticalValue := _CRITICAL_VALUE_50_00
          _CRITICAL_VALUE_90_00: criticalValue := _CRITICAL_VALUE_50_00
          _CRITICAL_VALUE_95_00: criticalValue := _CRITICAL_VALUE_90_00
          _CRITICAL_VALUE_99_00: criticalValue := _CRITICAL_VALUE_95_00          
          _CRITICAL_VALUE_99_50: criticalValue := _CRITICAL_VALUE_99_00
          _CRITICAL_VALUE_99_90: criticalValue := _CRITICAL_VALUE_99_50
          _CRITICAL_VALUE_99_95: criticalValue := _CRITICAL_VALUE_99_90
          _CRITICAL_VALUE_99_99: criticalValue := _CRITICAL_VALUE_99_95
         
      else ' When not triggered...  
        sampleRate := ((sampleRate + 1) <# _MAXIMUM_SAMPLE_RATE) ' Speed up...
        
        case criticalValue ' Make threshold harder to trigger.

          _CRITICAL_VALUE_50_00: criticalValue := _CRITICAL_VALUE_90_00
          _CRITICAL_VALUE_90_00: criticalValue := _CRITICAL_VALUE_95_00
          _CRITICAL_VALUE_95_00: criticalValue := _CRITICAL_VALUE_99_00
          _CRITICAL_VALUE_99_00: criticalValue := _CRITICAL_VALUE_99_50                                                          
          _CRITICAL_VALUE_99_50: criticalValue := _CRITICAL_VALUE_99_90
          _CRITICAL_VALUE_99_90: criticalValue := _CRITICAL_VALUE_99_95
          _CRITICAL_VALUE_99_95: criticalValue := _CRITICAL_VALUE_99_99
          _CRITICAL_VALUE_99_99: criticalValue := _CRITICAL_VALUE_99_99

      repeat com.receivedNumber
        if(com.readByte == _NEWLINE)
          dira[_POWER_LED_PIN] := outa[_POWER_LED_PIN] := 0
          cam.finiCamera
          abort

      com.writeByte(_BACKSPACE)

PRI HBMDWithoutDebug(stringPointer) | i, j, k, x, sampleRate, criticalValue, HBAverage[128]

  if(strcomp(stringPointer, string("HBMDWD")))                              
    com.writeString(string("Histogram Based Motion Detector Without Debug"))              

    com.COMEngineStop
    
    outa[_POWER_LED_PIN] := 0
    dira[_POWER_LED_PIN] := 1

    sampleRate := _MAXIMUM_SAMPLE_RATE
    criticalValue := _CRITICAL_VALUE_95_00
    
    cam.initCamera
    waitcnt(clkfreq + cnt)     
    cam.loadFrame(cam#_CAM_FB_NEW)
    j := k := 0
    
    repeat

      if(sampleRate < constant(_MAXIMUM_SAMPLE_RATE / 2)) 
        cam.finiCamera
   
      waitcnt(((clkfreq * 10) >> sampleRate) + cnt)

      if(sampleRate < constant(_MAXIMUM_SAMPLE_RATE / 2))       
        cam.initCamera
        waitcnt(clkfreq + cnt)         

      repeat i from 0 to 255 ' Average histograms.
        HBAverage.word[i] := ((HBAverage.word[i] + cam.getHistogramBufferValue(i)) / 2)
      
      cam.loadFrameAndHistogram(cam#_CAM_FB_AVERAGE, cam#_CAM_HB_DIFFERENCE)        

      ifnot(j~~) ' Initialize histogram buffer average.
        wordmove(@HBAverage, cam.getHistogramBufferAddress, 256)  
      
      x := 0
      
      repeat i from 0 to 255 ' Compute chi square value.
        x += ( ( (HBAverage.word[i] - cam.getHistogramBufferValue(i)) * (HBAverage.word[i] - cam.getHistogramBufferValue(i)) ) {
             } / (HBAverage.word[i] + cam.getHistogramBufferValue(i)) )

      x := (||(x => criticalValue))
      k := ((k << 1) | x)
      
      outa[_POWER_LED_PIN] := (k <> 0)

      if(x) ' When triggered...
        sampleRate := ((sampleRate - 2) #> _MINIMUM_SAMPLE_RATE) ' Slow down...

        case criticalValue ' Make threshold easier to trigger.

          _CRITICAL_VALUE_50_00: criticalValue := _CRITICAL_VALUE_50_00
          _CRITICAL_VALUE_90_00: criticalValue := _CRITICAL_VALUE_50_00
          _CRITICAL_VALUE_95_00: criticalValue := _CRITICAL_VALUE_90_00
          _CRITICAL_VALUE_99_00: criticalValue := _CRITICAL_VALUE_95_00         
          _CRITICAL_VALUE_99_50: criticalValue := _CRITICAL_VALUE_99_00
          _CRITICAL_VALUE_99_90: criticalValue := _CRITICAL_VALUE_99_50
          _CRITICAL_VALUE_99_95: criticalValue := _CRITICAL_VALUE_99_90
          _CRITICAL_VALUE_99_99: criticalValue := _CRITICAL_VALUE_99_95
         
      else ' When not triggered...  
        sampleRate := ((sampleRate + 1) <# _MAXIMUM_SAMPLE_RATE) ' Speed up...
        
        case criticalValue ' Make threshold harder to trigger.

          _CRITICAL_VALUE_50_00: criticalValue := _CRITICAL_VALUE_90_00
          _CRITICAL_VALUE_90_00: criticalValue := _CRITICAL_VALUE_95_00
          _CRITICAL_VALUE_95_00: criticalValue := _CRITICAL_VALUE_99_00
          _CRITICAL_VALUE_99_00: criticalValue := _CRITICAL_VALUE_99_50                                                          
          _CRITICAL_VALUE_99_50: criticalValue := _CRITICAL_VALUE_99_90
          _CRITICAL_VALUE_99_90: criticalValue := _CRITICAL_VALUE_99_95
          _CRITICAL_VALUE_99_95: criticalValue := _CRITICAL_VALUE_99_99
          _CRITICAL_VALUE_99_99: criticalValue := _CRITICAL_VALUE_99_99        
 
CON _DEC_OUT_TEMP_STRING_SIZE = 3 ' Signed 10 digit string plus NULL character.

VAR long tokenStringPointer, tempString[_DEC_OUT_TEMP_STRING_SIZE] ' String processing variables.

PRI STRToken(stringPointer) ' Splits a string into tokens.

' Notes:
'
' StringPointer - The address of the string to tokenize. Zero to continue tokenizing.
'
' Returns a pointer to an individual token from the tokenized string.

  if(stringPointer)
    tokenStringPointer := stringPointer

  if(tokenStringPointer)
    tokenStringPointer := result := STRTrim(tokenStringPointer)

    stringPointer := " "

    if(byte[tokenStringPointer] == com#Quotation_Marks)
      result := (STRTrim(++tokenStringPointer))

      stringPointer := com#Quotation_Marks

    repeat while(byte[tokenStringPointer])
      if(byte[tokenStringPointer++] == stringPointer)
        byte[tokenStringPointer][-1] := _NULL
        quit

PRI STRTrim(stringPointer) ' Trims leading white space from a string.

' Notes:
'
' StringPointer - The address of the string to trim.
'
' Returns a pointer to the trimmed string.

  if(stringPointer)
    result := --stringPointer
    repeat ' Format saves two bytes.
    while(byte[++result] == " ")

PRI DECOut(integer) | sign ' Integer to string.

' Notes:
'
' Integer - The integer to convert.
'
' Returns a pointer to the converted integer string.

  longfill(@tempString, 0, _DEC_OUT_TEMP_STRING_SIZE)
  sign := (integer < 0)

  repeat result from 10 to 1
    tempString.byte[result] := ((||(integer // 10)) + "0")
    integer /= 10

  result := @tempString
  repeat ' Format saves two bytes.
  while(byte[++result] == "0")
  result += (not(byte[result]))

  if(sign)
    byte[--result] := "-"

PRI DECIn(stringPointer) | sign ' String to integer.

' Notes:
'
' StringPointer - The string to convert.
'
' Returns the converted string's integer value.

  if(stringPointer := STRTrim(stringPointer))
    sign := ((byte[stringPointer] == "-") | 1)
    stringPointer -= ((sign == -1) or (byte[stringPointer] == "+"))

    if(byte[stringPointer] == "0")
      if((byte[stringPointer + 1] == "X") or (byte[stringPointer + 1] == "x"))
        return (HEXIn(stringPointer + 2) * sign)

    repeat (strsize(stringPointer) <# 10)
      if((byte[stringPointer] < "0") or ("9" < byte[stringPointer]))
        quit

      result := ((result * 10) + (byte[stringPointer++] & $F))
    result *= sign

PRI HEXOut(integer) ' Integer to string.

' Notes:
'
' Integer - The integer to convert.
'
' Returns a pointer to the converted integer string.

  bytemove(@tempString, string("0x00000000h"), 12)

  repeat result from constant(7 + 2) to constant(0 + 2)
    tempString.byte[result] := lookupz((integer & $F): "0".."9", "A".."F")
    integer >>= 4

  return @tempString

PRI HEXIn(stringPointer) ' String to integer.

' Notes:
'
' StringPointer - The string to convert.
'
' Returns the converted string's integer value.

  if(stringPointer)

    repeat (strsize(stringPointer) <# 8)
      ifnot(("0" =< byte[stringPointer]) and (byte[stringPointer] =< "9"))
        ifnot(("A" =< byte[stringPointer]) and (byte[stringPointer] =< "F"))
          quit

        result += constant(($A - ("A" & $F)) -> 4)
      result := ((result <- 4) + (byte[stringPointer++] & $F))

{{

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                  TERMS OF USE: MIT License
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}}