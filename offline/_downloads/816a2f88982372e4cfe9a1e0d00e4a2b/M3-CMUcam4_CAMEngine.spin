{{
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CMUcam4 Engine
//
// Author: Kwabena W. Agyeman
// Updated: 10/26/2012
// Designed For: P8X32A
// Version: 1.00
//
// Copyright (c) 2012 Kwabena W. Agyeman
// See end of file for terms of use.
//
// Update History:
//
// v1.00 - Original release - 10/26/2012
//
// Only for the CMUcam4.
//
// Nyamekye,
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}}

CON ' The pin number defined below are for reference only - the code must be changed to move them.

  _CAM_D2_PIN = 0
  _CAM_D3_PIN = 1 
  _CAM_D4_PIN = 2 
  _CAM_D5_PIN = 3 
  _CAM_D6_PIN = 4 
  _CAM_D7_PIN = 5 
  _CAM_D8_PIN = 6 
  _CAM_D9_PIN = 7 

  _CAM_D0_PIN = 8
  _CAM_D1_PIN = 9 

  _CAM_XCLK_PIN = 10
  _CAM_PCLK_PIN = 11 
  _CAM_VSYNC_PIN = 12 
  _CAM_HREF_PIN = 13 

  _CAM_PWDN_PIN = 14
  _CAM_RESET_PIN = -1 

  _SD_CD = 15
  _SD_DO = 16
  _SD_CLK = 17
  _SD_DI = 18
  _SD_CS = 19
  _SD_WP = -1

  _I2C_CLOCK_PIN = 28
  _I2C_DATA_PIN = 29 

  _SCCB_CAMERA_WRITE_ADDRESS = $60
  _SCCB_CAMERA_READ_ADDRESS = (_SCCB_CAMERA_WRITE_ADDRESS | $1)

  _CAMERA_PLL_RESET_ADDRESS = $3E
  _CAMERA_PLL_RESET_VALUE = $D0 

  _CAMERA_SOFTWARE_RESET_ADDRESS = $12
  _CAMERA_SOFTWARE_RESET_VALUE = $80 

  _CAMERA_PLL_RESET_COUNT = 2
  _CAMERA_PLL_RESET_TIMEOUT = 200 

  _CAMERA_SCCB_TIMEOUT = 200 
  _CAMERA_XCLK_TIMEOUT = 10  

  _CAMERA_CLOCK_FREQUENCY = (1 << 31)
  _CAMERA_CLOCK_COUNTER = ((%00100 << 26) + _CAM_XCLK_PIN) 

  _DRIVER_HREF_FREQUENCY = 1
  _DRIVER_HREF_COUNTER = %0_01010_000
  
  _CAMERA_H_RES = 640
  _CAMERA_V_RES = 480

  _CAM_H_DIV = 5
  _CAM_V_DIV = 5 

  _CAMERA_H_WIN = (_CAMERA_H_RES / _CAM_H_DIV)
  _CAMERA_V_WIN = (_CAMERA_V_RES / _CAM_V_DIV) 

  _CAMERA_MIN_H = 0
  _CAMERA_MAX_H = (_CAMERA_H_WIN - 1) 
  _CAMERA_MIN_V = 0
  _CAMERA_MAX_V = (_CAMERA_V_WIN - 1) 

  _FB_SIZE_BYTES = (_CAMERA_H_WIN * _CAMERA_V_WIN) ' In bytes
  _TB_SIZE_BYTES = (256 / 8) ' In bits
  _BB_SIZE_BYTES = (((_CAMERA_H_WIN * _CAMERA_V_WIN) + 7) / 8) ' In bits
  _HB_SIZE_BYTES = (256 * 2) ' In words
  
  _FB_SIZE_LONGS = ((_FB_SIZE_BYTES + 3) / 4)
  _TB_SIZE_LONGS = ((_TB_SIZE_BYTES + 3) / 4)
  _BB_SIZE_LONGS = ((_BB_SIZE_BYTES + 3) / 4)
  _HB_SIZE_LONGS = ((_HB_SIZE_BYTES + 3) / 4)
  
VAR ' Do not rearrange this data structure. 

  long inputVector ' Command
  long outputVector ' True or false
  
  long frameBuffer[_FB_SIZE_LONGS] ' Bytes
  long thresholdBuffer[_TB_SIZE_LONGS] ' Bits
  long bitmapBuffer[_BB_SIZE_LONGS] ' Bits
  long histogramBuffer[_HB_SIZE_LONGS] ' Words

CON ' Load frame operation options.
  
  _CAM_FB_SHIFT = 0
  _CAM_FB_MASK = ($3 << _CAM_FB_SHIFT)

  _CAM_BB_SHIFT = (_CAM_FB_SHIFT + 2)
  _CAM_BB_MASK = ($3 << _CAM_BB_SHIFT)  

  _CAM_HB_SHIFT = (_CAM_BB_SHIFT + 2)
  _CAM_HB_MASK = ($3 << _CAM_HB_SHIFT)
 
  _CAM_FB_OLD = (0 << _CAM_FB_SHIFT) ' frameBuffer := oldFrame
  _CAM_FB_NEW = (1 << _CAM_FB_SHIFT) ' frameBuffer := newFrame
  _CAM_FB_AVERAGE = (2 << _CAM_FB_SHIFT) ' frameBuffer := ((oldFrame + newFrame) / 2) 
  _CAM_FB_DIFFERENCE = (3 << _CAM_FB_SHIFT) ' frameBuffer := ||(oldFrame - newFrame)

  _CAM_BB_OLD = (0 << _CAM_BB_SHIFT) ' bitmapBuffer := thresholdBuffer[oldFrame] 
  _CAM_BB_NEW = (1 << _CAM_BB_SHIFT) ' bitmapBuffer := thresholdBuffer[newFrame]
  _CAM_BB_AVERAGE = (2 << _CAM_BB_SHIFT) ' bitmapBuffer := thresholdBuffer[(oldFrame + newFrame) / 2]   
  _CAM_BB_DIFFERENCE = (3 << _CAM_BB_SHIFT) ' bitmapBuffer := thresholdBuffer[||(oldFrame - newFrame)]  

  _CAM_HB_OLD = (0 << _CAM_HB_SHIFT) ' histogramBuffer := oldFrame 
  _CAM_HB_NEW = (1 << _CAM_HB_SHIFT) ' histogramBuffer := newFrame 
  _CAM_HB_AVERAGE = (2 << _CAM_HB_SHIFT) ' histogramBuffer := ((oldFrame + newFrame) / 2) 
  _CAM_HB_DIFFERENCE = (3 << _CAM_HB_SHIFT) ' histogramBuffer := ||(oldFrame - newFrame)

  _CAM_UPDATE_BITMAP = (1 << (_CAM_HB_SHIFT + 2))
  _CAM_UPDATE_HISTOGRAM = (1 << (_CAM_HB_SHIFT + 3))  

PUB loadFrame(FBOperation)

  '' Preform an operation on the frame buffer.
  ''
  '' Frame buffer operation options:
  ''
  '' _CAM_FB_OLD -> frameBuffer := oldFrame
  '' _CAM_FB_NEW -> frameBuffer := newFrame
  '' _CAM_FB_AVERAGE -> frameBuffer := ((oldFrame + newFrame) / 2) 
  '' _CAM_FB_DIFFERENCE -> frameBuffer := ||(oldFrame - newFrame)
  ''
  '' Note: frameBuffer == oldFrame.
  ''
  '' Return true on success and false on failure.

  return CAM_Helper(FBOperation)
 
PUB loadFrameAndBitmap(FBOperation, BBOperation) 

  '' Preform an operation on the frame buffer and the bitmap buffer.
  ''
  '' Frame buffer operation options:
  ''
  '' _CAM_FB_OLD -> frameBuffer := oldFrame
  '' _CAM_FB_NEW -> frameBuffer := newFrame
  '' _CAM_FB_AVERAGE -> frameBuffer := ((oldFrame + newFrame) / 2) 
  '' _CAM_FB_DIFFERENCE -> frameBuffer := ||(oldFrame - newFrame)
  ''
  '' Bitmap buffer operation options: 
  ''
  '' _CAM_BB_OLD -> bitmapBuffer := thresholdBuffer[oldFrame] 
  '' _CAM_BB_NEW -> bitmapBuffer := thresholdBuffer[newFrame]
  '' _CAM_BB_AVERAGE -> bitmapBuffer := thresholdBuffer[(oldFrame + newFrame) / 2]   
  '' _CAM_BB_DIFFERENCE -> bitmapBuffer := thresholdBuffer[||(oldFrame - newFrame)]  
  ''
  '' Note: frameBuffer == oldFrame.
  ''
  '' Return true on success and false on failure.

  return CAM_Helper(FBOperation | BBOperation | _CAM_UPDATE_BITMAP)

PUB loadFrameAndHistogram(FBOperation, HBOperation) 

  '' Preform an operation on the frame buffer and the histogram buffer.
  ''
  '' Frame buffer operation options:
  ''
  '' _CAM_FB_OLD -> frameBuffer := oldFrame
  '' _CAM_FB_NEW -> frameBuffer := newFrame
  '' _CAM_FB_AVERAGE -> frameBuffer := ((oldFrame + newFrame) / 2) 
  '' _CAM_FB_DIFFERENCE -> frameBuffer := ||(oldFrame - newFrame)
  ''
  '' Histogram buffer operation options: 
  ''
  '' _CAM_HB_OLD -> histogramBuffer := oldFrame 
  '' _CAM_HB_NEW -> histogramBuffer := newFrame 
  '' _CAM_HB_AVERAGE -> histogramBuffer := ((oldFrame + newFrame) / 2) 
  '' _CAM_HB_DIFFERENCE -> histogramBuffer := ||(oldFrame - newFrame)  
  ''
  '' Note: frameBuffer == oldFrame.
  ''
  '' Return true on success and false on failure.

  return CAM_Helper(FBOperation | HBOperation | _CAM_UPDATE_HISTOGRAM)

PUB loadFrameAndBitampAndHistogram(FBOperation, BBOperation, HBOperation) 

  '' Preform an operation on the frame buffer, the bitmap buffer, and the histogram buffer.
  ''
  '' Frame buffer operation options:
  ''
  '' _CAM_FB_OLD -> frameBuffer := oldFrame
  '' _CAM_FB_NEW -> frameBuffer := newFrame
  '' _CAM_FB_AVERAGE -> frameBuffer := ((oldFrame + newFrame) / 2) 
  '' _CAM_FB_DIFFERENCE -> frameBuffer := ||(oldFrame - newFrame)
  ''
  '' Bitmap buffer operation options: 
  ''
  '' _CAM_BB_OLD -> bitmapBuffer := thresholdBuffer[oldFrame] 
  '' _CAM_BB_NEW -> bitmapBuffer := thresholdBuffer[newFrame]
  '' _CAM_BB_AVERAGE -> bitmapBuffer := thresholdBuffer[(oldFrame + newFrame) / 2]   
  '' _CAM_BB_DIFFERENCE -> bitmapBuffer := thresholdBuffer[||(oldFrame - newFrame)]
  ''
  '' Histogram buffer operation options: 
  ''
  '' _CAM_HB_OLD -> histogramBuffer := oldFrame 
  '' _CAM_HB_NEW -> histogramBuffer := newFrame 
  '' _CAM_HB_AVERAGE -> histogramBuffer := ((oldFrame + newFrame) / 2) 
  '' _CAM_HB_DIFFERENCE -> histogramBuffer := ||(oldFrame - newFrame)  
  ''
  '' Note: frameBuffer == oldFrame.
  ''
  '' Return true on success and false on failure.

  return CAM_Helper(FBOperation | BBOperation | HBOperation | constant(_CAM_UPDATE_BITMAP | _CAM_UPDATE_HISTOGRAM))

PUB histogramToThresholdFeedBackQ1(indexCutoff, valueCutoff) | buffer, counter

  '' Sets all threshold buffer bits corresponding to histogram bins that have a bin index greater than or equal to
  '' indexCutoff and bin value greater than or equal to valueCutoff. All other threshold buffer bits are zeroed.
  ''
  '' Returns -1 on error.

  if((indexCutoff < 0) or (255 < indexCutoff) or (valueCutoff < 0) or (65_535 < valueCutoff))
    return -1
  
  repeat counter from 0 to 255
    setThresholdBufferValue(counter, 0)
  
    if(indexCutoff =< counter)
      buffer := getHistogramBufferValue(counter)

      if(valueCutoff =< buffer)  
        setThresholdBufferValue(counter, 1)

PUB histogramToThresholdFeedBackQ2(indexCutoff, valueCutoff) | buffer, counter

  '' Sets all threshold buffer bits corresponding to histogram bins that have a bin index less than or equal to
  '' indexCutoff and bin value greater than or equal to valueCutoff. All other threshold buffer bits are zeroed.
  ''
  '' Returns -1 on error.

  if((indexCutoff < 0) or (255 < indexCutoff) or (valueCutoff < 0) or (65_535 < valueCutoff))
    return -1
  
  repeat counter from 0 to 255
    setThresholdBufferValue(counter, 0)
  
    if(counter =< indexCutoff)
      buffer := getHistogramBufferValue(counter)

      if(valueCutoff =< buffer)  
        setThresholdBufferValue(counter, 1)

PUB histogramToThresholdFeedBackQ3(indexCutoff, valueCutoff) | buffer, counter

  '' Sets all threshold buffer bits corresponding to histogram bins that have a bin index less than or equal to
  '' indexCutoff and bin value less than or equal to valueCutoff. All other threshold buffer bits are zeroed.
  ''
  '' Returns -1 on error.

  if((indexCutoff < 0) or (255 < indexCutoff) or (valueCutoff < 0) or (65_535 < valueCutoff))
    return -1
  
  repeat counter from 0 to 255
    setThresholdBufferValue(counter, 0)
  
    if(counter =< indexCutoff)
      buffer := getHistogramBufferValue(counter)

      if(buffer =< valueCutoff)  
        setThresholdBufferValue(counter, 1)        

PUB histogramToThresholdFeedBackQ4(indexCutoff, valueCutoff) | buffer, counter

  '' Sets all threshold buffer bits corresponding to histogram bins that have a bin index greater than or equal to
  '' indexCutoff and bin value less than or equal to valueCutoff. All other threshold buffer bits are zeroed.
  ''
  '' Returns -1 on error.

  if((indexCutoff < 0) or (255 < indexCutoff) or (valueCutoff < 0) or (65_535 < valueCutoff))
    return -1
  
  repeat counter from 0 to 255
    setThresholdBufferValue(counter, 0)
  
    if(indexCutoff =< counter)
      buffer := getHistogramBufferValue(counter)

      if(buffer =< valueCutoff)  
        setThresholdBufferValue(counter, 1)

PRI CAM_Helper(command) ' Controls the camera driver.

  inputVector := command
  outputVector := false

  command := cognew(@CAM_Initialization, @inputVector)

  if(!command)

    result := cnt 
    repeat until(outputVector)
    
      if((cnt - result) => clkfreq)
        cogstop(command)
        return false
    
    return true   
  
DAT ' Camera driver. 

                        org     0

CAM_Initialization      mov     CAM_IPointer,           par                       ' Setup input pointer and value.
                        rdlong  CAM_IValue,             CAM_IPointer              '

                        mov     CAM_OPointer,           CAM_IPointer              ' Setup output pointer and value.
                        add     CAM_OPointer,           #4                        '
                        rdlong  CAM_OValue,             CAM_OPointer              '

                        mov     CAM_FBPointer,          CAM_OPointer              ' Setup frame buffer pointer.
                        add     CAM_FBPointer,          #4                        '
                        
                        mov     CAM_TBPointer,          CAM_FBPointer             ' Setup threshold buffer pointer.
                        add     CAM_TBPointer,          CAM_FBSize                '
                        
                        mov     CAM_BBPointer,          CAM_TBPointer             ' Setup difference buffer pointer.
                        add     CAM_BBPointer,          #_TB_SIZE_BYTES           '

                        mov     CAM_HBPointer,          CAM_BBPointer             ' Setup difference histogram pointer.
                        add     CAM_HBPointer,          CAM_BBSize                '

                        mov     CAM_MainBuffer,         CAM_IValue                ' Setup frame buffer operation.
                        and     CAM_MainBuffer,         #_CAM_FB_MASK             '
                        cmp     CAM_MainBuffer,         #_CAM_FB_OLD wz           '
if_z                    movd    CAM_FBOperationMOVD,    #CAM_OldY                 '
                        cmp     CAM_MainBuffer,         #_CAM_FB_NEW wz           '
if_z                    movd    CAM_FBOperationMOVD,    #CAM_NewY                 '
                        cmp     CAM_MainBuffer,         #_CAM_FB_AVERAGE wz       '
if_z                    movd    CAM_FBOperationMOVD,    #CAM_AverageY             '
                        cmp     CAM_MainBuffer,         #_CAM_FB_DIFFERENCE wz    '
if_z                    movd    CAM_FBOperationMOVD,    #CAM_DifferenceY          '

                        mov     CAM_MainBuffer,         CAM_IValue                ' Setup bitmap buffer operation.
                        and     CAM_MainBuffer,         #_CAM_BB_MASK             '
                        cmp     CAM_MainBuffer,         #_CAM_BB_OLD wz           '
if_z                    movs    CAM_BBOperationMOVS,    #CAM_OldY                 '
                        cmp     CAM_MainBuffer,         #_CAM_BB_NEW wz           '
if_z                    movs    CAM_BBOperationMOVS,    #CAM_NewY                 '
                        cmp     CAM_MainBuffer,         #_CAM_BB_AVERAGE wz       '
if_z                    movs    CAM_BBOperationMOVS,    #CAM_AverageY             '
                        cmp     CAM_MainBuffer,         #_CAM_BB_DIFFERENCE wz    '
if_z                    movs    CAM_BBOperationMOVS,    #CAM_DifferenceY          '

                        mov     CAM_MainBuffer,         CAM_IValue                ' Setup histogram buffer operation.
                        and     CAM_MainBuffer,         #_CAM_HB_MASK             '
                        cmp     CAM_MainBuffer,         #_CAM_HB_OLD wz           '
if_z                    movs    CAM_HBOperationMOVS,    #CAM_OldY                 '
                        cmp     CAM_MainBuffer,         #_CAM_HB_NEW wz           '
if_z                    movs    CAM_HBOperationMOVS,    #CAM_NewY                 '
                        cmp     CAM_MainBuffer,         #_CAM_HB_AVERAGE wz       '
if_z                    movs    CAM_HBOperationMOVS,    #CAM_AverageY             '
                        cmp     CAM_MainBuffer,         #_CAM_HB_DIFFERENCE wz    '
if_z                    movs    CAM_HBOperationMOVS,    #CAM_DifferenceY          '

                        test    CAM_IValue,             #_CAM_UPDATE_BITMAP wz    ' Setup bitmap buffer update.
if_z                    mov     CAM_UpdateBitmapMOV,    #0                        '

                        test    CAM_IValue,             #_CAM_UPDATE_HISTOGRAM wc ' Setup histogram buffer update.
if_c                    add     CAM_UpdateHistogramADD, #1                        '

             if_c       mov     CAM_MainCounter,        #_HB_SIZE_LONGS           ' Zero histogram buffer.
             if_c       mov     CAM_MainBuffer,         CAM_HBPointer             '
             if_c       mov     CAM_YCounter,           #0                        '
CAM_ZeroLoop if_c       wrlong  CAM_YCounter,           CAM_MainBuffer            '
             if_c       add     CAM_MainBuffer,         #4                        '
             if_c       djnz    CAM_MainCounter,        #CAM_ZeroLoop             '

' The counter module is configured below to count the rising edges of the HREF signal. This is done so that the processor can
' stay in sync with the camera sensor. By default, the camera sensor sends 480 lines where each line is 640 pixels. The pixels
' in each line are sent in YUV422 format. This means that for every 2 pixels, 4 bytes are sent. The first byte is the Y 
' component of the first pixel and the second byte is the U component of the first and second pixel. The next two bytes are  
' the Y component of the second pixel and the V component of the first and second pixel.  
                        
                        mov     CAM_MainCounter,        #_CAMERA_V_WIN            ' Setup main loop counter.
                        
                        mov     frqa,                   #_DRIVER_HREF_FREQUENCY   ' Setup counter.
                        movs    ctra,                   #_CAM_HREF_PIN            '
                        movi    ctra,                   #_DRIVER_HREF_COUNTER     '

                        waitpeq CAM_VSYNCMask,          CAM_VSYNCMask             ' Wait for VSYNC signal.

CAM_MainLoop            movd    CAM_MovLoopMOVD,        #CAM_YBuffer              ' Setup mov loop.
                        mov     CAM_YCounter,           #_CAMERA_H_WIN            '

' The loop below reads in the Y component from every 5th pixel coming out of the camera sensor. By default, the camera sensor
' is configured to send 640 pixels per line in the image. So, the below code reads in the Y component of 128 pixels in the
' image. However, because of the time it takes to align instruction execution to the pixel stream, the first 4 pixels of the
' 640 pixels sent by the camera sensor are dropped. To account for this, the default camera sensor image window has been
' shifted left by 4 pixels. 

                        waitpne CAM_HREFMask,           CAM_HREFMask              ' Wait for the rising HREF edge.
                        mov     phsa,                   #0                        '
                        waitpeq CAM_HREFMask,           CAM_HREFMask              '

                        mov     CAM_MainBuffer,         #(4 + 7 + 8)              ' Align instructions - can be 18, 19, or 20.
                        add     CAM_MainBuffer,         cnt                       '
                        waitcnt CAM_MainBuffer,         #0                        '
                        
CAM_MovLoop             mov     CAM_MainBuffer,         ina                       ' ina[7..0] == 8-bit Y/Y <- Pixel 4 + n
                        and     CAM_MainBuffer,         #$FF                      ' ina[7..0] == 8-bit U/V
CAM_MovLoopMOVD         mov     CAM_YBuffer,            CAM_MainBuffer            ' ina[7..0] == 8-bit Y/Y <- Pixel 5 + n 
                        add     CAM_MovLoopMOVD,        CAM_DestinationInc        ' ina[7..0] == 8-bit V/U
                        nop                                                       ' ina[7..0] == 8-bit Y/Y <- Pixel 6 + n 
                        nop                                                       ' ina[7..0] == 8-bit U/V
                        nop                                                       ' ina[7..0] == 8-bit Y/Y <- Pixel 7 + n 
                        nop                                                       ' ina[7..0] == 8-bit V/U 
                        nop                                                       ' ina[7..0] == 8-bit Y/Y <- Pixel 8 + n
                        djnz    CAM_YCounter,           #CAM_MovLoop              ' ina[7..0] == 8-bit U/V

' The loop below processes the pixels that were captured by the above loop. The processing of the captured line of pixels has
' to be completed in less than (((120 + ((640 + 120) * (_CAM_V_DIV - 1))) * 2) * 4) clock cycles in order to capture the next
' line of pixels from the camera. So, this means the below loop has 25,280 clock cycles to finish processing the captured
' line of pixels and execute the above code to wait for the rising edge of the HREF signal to stay in sync with the camera
' sensor. The below code is carefully written to hit all the hub access windows in order to meet this timing deadline. Note:
' The HSYNC interval is the number 120 above. Also, the below only code takes 18,496 clock cycles to execute in the worst
' case scenario to process 128 pixels. So, more logic can be added to the below loop without causing problems.  

                        movs    CAM_HubLoopMOVS,        #CAM_YBuffer              ' Setup hub loop.
                        mov     CAM_YCounter,           #(_CAMERA_H_WIN / 32)     '
                        mov     CAM_BitCounter,         #32                       '
                        
CAM_HubLoop             rdbyte  CAM_OldY,               CAM_FBPointer             ' Get old and new. 
CAM_HubLoopMOVS         mov     CAM_NewY,               CAM_YBuffer               '

                        mov     CAM_AverageY,           CAM_OldY                  ' Average old and new.
                        add     CAM_AverageY,           CAM_NewY                  ' 
                        shr     CAM_AverageY,           #1                        '

                        mov     CAM_DifferenceY,        CAM_OldY                  ' Compute difference.
                        sub     CAM_DifferenceY,        CAM_NewY                  '
                        abs     CAM_DifferenceY,        CAM_DifferenceY           '

CAM_BBOperationMOVS     mov     CAM_MainBuffer,         CAM_OldY                  ' Choose values.
                        mov     CAM_TBLongIndex,        CAM_MainBuffer            '
                        mov     CAM_TBBitIndex,         CAM_MainBuffer            ' 
CAM_FBOperationMOVD     wrbyte  CAM_OldY,               CAM_FBPointer             '  

                        add     CAM_FBPointer,          #1                        ' Increment pointers.
                        add     CAM_HubLoopMOVS,        #1                        '

                        shr     CAM_TBLongIndex,        #5                        ' Compute threshold buffer index.  
                        shl     CAM_TBLongIndex,        #2                        '
                        add     CAM_TBLongIndex,        CAM_TBPointer             '
                        and     CAM_TBBitIndex,         #$1F                      '

                        rdlong  CAM_MainBuffer,         CAM_TBLongIndex           ' Threshold pixel.   
                        shr     CAM_MainBuffer,         CAM_TBBitIndex            '
                        test    CAM_MainBuffer,         #1 wc                     '
                        rcr     CAM_BitBuffer,          #1                        ' 

CAM_HBOperationMOVS     mov     CAM_HBBinAddress,       CAM_OldY                  ' Compute histogram bin address. 
                        shl     CAM_HBBinAddress,       #1                        '
                        add     CAM_HBBinAddress,       CAM_HBPointer             '

                        rdword  CAM_HBBinValue,         CAM_HBBinAddress          ' Increment histogram bin value.
CAM_UpdateHistogramADD  add     CAM_HBBinValue,         #0                        '
                        sub     CAM_BitCounter,         #1 wz                     '         
                        wrword  CAM_HBBinValue,         CAM_HBBinAddress          '
if_nz                   jmp     #CAM_HubLoop                                      ' 
                        mov     CAM_BitCounter,         #32                       '
                        
CAM_UpdateBitmapMOV     wrlong  CAM_BitBuffer,          CAM_BBPointer             ' Write out binary bitmap. 
                        add     CAM_BBPointer,          #4                        '
                        djnz    CAM_YCounter,           #CAM_HubLoop              ' 
                        
' Because the above code takes more time than the HSYNC interval, the processor inadvertently skipped some number of lines of 
' pixels sent by the camera sensor. The below piece of code throttles the processor by waiting for the right number of lines 
' to go by that should be skipped per frame. So, the processor will wait to make sure 5 lines have gone by before continuing.                         
                     
                        mov     CAM_MainBuffer,         #_CAM_V_DIV               ' Sync with frame line.
CAM_RefLoop             cmp     CAM_MainBuffer,         phsa wz, wc               '
if_nz_and_nc            jmp     #CAM_RefLoop                                      '
                        djnz    CAM_MainCounter,        #CAM_MainLoop             ' 

                        neg     CAM_MainBuffer,         #1                        ' Signal the other core and shutdown.
                        wrlong  CAM_MainBuffer,         CAM_OPointer              '
                        cogid   CAM_MainBuffer                                    ' 
                        cogstop CAM_MainBuffer                                    '

CAM_HREFMask            long    (|<_CAM_HREF_PIN)
CAM_VSYNCMask           long    (|<_CAM_VSYNC_PIN)

CAM_FBSize              long    _FB_SIZE_BYTES                                    
CAM_BBSize              long    _BB_SIZE_BYTES                                       

CAM_DestinationInc      long    $200

CAM_FBPointer           res     1
CAM_TBPointer           res     1
CAM_BBPointer           res     1
CAM_HBPointer           res     1

CAM_IPointer            res     1
CAM_OPointer            res     1

CAM_IValue              res     1
CAM_OValue              res     1

CAM_TBBitIndex          res     1
CAM_TBLongIndex         res     1

CAM_HBBinAddress        res     1
CAM_HBBinValue          res     1

CAM_MainCounter         res     1
CAM_MainBuffer          res     1

CAM_BitCounter          res     1
CAM_BitBuffer           res     1

CAM_OldY                res     1
CAM_NewY                res     1

CAM_AverageY            res     1
CAM_DifferenceY         res     1

CAM_YCounter            res     1
CAM_YBuffer             res     _CAMERA_H_WIN

                        fit     496

PUB getFrameBufferAddress '' Return the address of the frame buffer. This is a pointer to 128 x 96 bytes.

  return @frameBuffer

PUB getThresholdBufferAddress '' Return the address of the threshold buffer. This is a pointer to 256 bits.

  return @thresholdBuffer   

PUB getBitmapBufferAddress '' Returns the address of the bitmap buffer. This is a pointer to 128 x 96 bits.   

  return @bitmapBuffer

PUB getHistogramBufferAddress '' Returns the address of the histogram buffer. This is a pointer to 256 words. 

  return @histogramBuffer

PUB getFrameBufferValue(xPos, yPos) '' Get a pixel value in the frame buffer. Return -1 on error.

  if((xPos < _CAMERA_MIN_H) or (_CAMERA_MAX_H < xPos) or (yPos < _CAMERA_MIN_V) or (_CAMERA_MAX_V < yPos))
    return -1

  return frameBuffer.byte[xPos + (_CAMERA_H_WIN * yPos)]      

PUB setFrameBufferValue(xPos, yPos, value) '' Set a pixel value in the frame buffer. Return -1 on error. 

  if((xPos < _CAMERA_MIN_H) or (_CAMERA_MAX_H < xPos) or (yPos < _CAMERA_MIN_V) or (_CAMERA_MAX_V < yPos))
    return -1

  frameBuffer.byte[xPos + (_CAMERA_H_WIN * yPos)] := value 
  
PUB getThresholdBufferValue(index)

  '' Get a threshold bit value in the threshold bit buffer. Return -1 on error.

  if((index < 0) or (255 < index))
    return -1

  return ((thresholdBuffer[index >> 5] >> (index & $1F)) & 1) 
  
PUB setThresholdBufferValue(index, value) | longNumber, bitNumber

  '' Set a threshold bit value in the threshold bit buffer. Return -1 on error. 

  if((index < 0) or (255 < index))
    return -1

  longNumber := (index >> 5)
  bitNumber := (index & $1F)
     
  thresholdBuffer[longNumber] := ((thresholdBuffer[longNumber] & (!(|<bitNumber))) | ((|<bitNumber) & (not(not(value & 1)))))

PUB getBitmapBufferValue(xPos, yPos) '' Return a bit value in the bitmap buffer. Return -1 on error.

  if((xPos < _CAMERA_MIN_H) or (_CAMERA_MAX_H < xPos) or (yPos < _CAMERA_MIN_V) or (_CAMERA_MAX_V < yPos))
    return -1

  return ((bitmapBuffer[(xPos >> 5) + (yPos * constant(_CAMERA_H_WIN / 32))] >> (xPos & $1F)) & 1)     

PUB getHistogramBufferValue(index) '' Return a bin value in the histogram buffer. Return -1 on error.

  if((index < 0) or (255 < index))
    return -1

  return histogramBuffer.word[index]

OBJ fat: "SD-MMC_FATEngine.spin"

CON

  _BMP_FILE_HEADER_SIZE = 14
  _BMP_INFO_HEADER_SIZE = 40
  _BMP_GRAYSCALE_COLOR_SIZE = 256
  _BMP_BINARY_COLOR_TABLE_SIZE = 2

  _BMP_HEAD_GREYSCALE_SIZE = (_BMP_FILE_HEADER_SIZE + _BMP_INFO_HEADER_SIZE + (_BMP_GRAYSCALE_COLOR_SIZE * 4)) ' Bytes.

DAT BMPHeaderGreyscale

  byte byte "BM" ' Bitmap signature.
  byte long (_BMP_HEAD_GREYSCALE_SIZE + _FB_SIZE_BYTES)
  byte word 0 ' Reserved.
  byte word 0 ' Reserved.
  byte long _BMP_HEAD_GREYSCALE_SIZE ' Offest to pixel array.

  byte long _BMP_INFO_HEADER_SIZE ' DIB header size.
  byte long +_CAMERA_H_WIN ' Pixel width.
  byte long -_CAMERA_V_WIN ' Pixel height.
  byte word 1 ' Number of color planes.
  byte word 8 ' Bits per pixel.
  byte long 0 ' Bit fields.
  byte long _FB_SIZE_BYTES ' Number of bytes in pixel array.
  byte long 0 ' Horizontal pixels per meter.
  byte long 0 ' Vertical pixels per meter.
  byte long _BMP_GRAYSCALE_COLOR_SIZE ' Number of colors in the palette.
  byte long _BMP_GRAYSCALE_COLOR_SIZE ' Number of important colors in the palette.

CON

  _BMP_HEAD_BINARY_SIZE = (_BMP_FILE_HEADER_SIZE + _BMP_INFO_HEADER_SIZE + (_BMP_BINARY_COLOR_TABLE_SIZE * 4)) ' Bytes. 

DAT BMPHeaderBinary

  byte byte "BM" ' Bitmap signature.
  byte long (_BMP_HEAD_BINARY_SIZE + _BB_SIZE_BYTES)
  byte word 0 ' Reserved.
  byte word 0 ' Reserved.
  byte long _BMP_HEAD_BINARY_SIZE ' Offest to pixel array.

  byte long _BMP_INFO_HEADER_SIZE ' DIB header size.
  byte long +_CAMERA_H_WIN ' Pixel width.
  byte long -_CAMERA_V_WIN ' Pixel height.
  byte word 1 ' Number of color planes.
  byte word 1 ' Bits per pixel.
  byte long 0 ' Bit fields.
  byte long _BB_SIZE_BYTES ' Number of bytes in pixel array.
  byte long 0 ' Horizontal pixels per meter.
  byte long 0 ' Vertical pixels per meter.
  byte long _BMP_BINARY_COLOR_TABLE_SIZE ' Number of colors in the palette.
  byte long _BMP_BINARY_COLOR_TABLE_SIZE ' Number of important colors in the palette.

  byte long $00_00_00 ' Black.
  byte long $FF_FF_FF ' White.

PUB saveFrameBuffer

  '' Saves the frame buffer to the SD card as a BMP file. Returns 0 on success and an error number on failure. 
  ''
  '' Automatically names the file 00001_F.BMP, 00002_F.BMP, etc.

  result := \saveFrameBufferGuard
  return fat.partitionError 

PRI saveFrameBufferGuard | temp

  autoNameStart(string("_F.BMP"))

  fat.writeData(@BMPHeaderGreyscale, constant(_BMP_FILE_HEADER_SIZE + _BMP_INFO_HEADER_SIZE))

  repeat temp from 0 to 255
    fat.writeLong((temp << 16) | (temp << 8) | temp)

  fat.writeData(@frameBuffer, _FB_SIZE_BYTES)

  autoNameStop   

PUB saveThresholdBuffer

  '' Saves the threshold buffer to the SD card as a CSV file. Returns 0 on success and an error number on failure. 
  ''
  '' Automatically names the file 00001_T.CSV, 00002_T.CSV, etc.

  result := \saveThresholdBufferGuard
  return fat.partitionError 
  
PRI saveThresholdBufferGuard | index

  autoNameStart(string("_T.CSV"))

  ' Write header...
  fat.writeString(string("Index,Value", 13, 10))

  ' Write data...
  repeat index from 0 to 255
    fat.writeString(DECOut(index))
    fat.writeByte(",")
    fat.writeString(DECOut(getThresholdBufferValue(index)))
    fat.writeString(string(13, 10))

  autoNameStop
  
PUB saveBitmapBuffer

  '' Saves the bitmap buffer to the SD card as a BMP file. Returns 0 on success and an error number on failure. 
  ''
  '' Automatically names the file 00001_B.BMP, 00002_B.BMP, etc.

  result := \saveBitmapBufferGuard
  return fat.partitionError

PRI saveBitmapBufferGuard | temp

  autoNameStart(string("_B.BMP"))

  fat.writeData(@BMPHeaderBinary, _BMP_HEAD_BINARY_SIZE)

  repeat temp from 0 to constant(_BB_SIZE_BYTES - 1)
    fat.writeByte(bitmapBuffer.byte[temp] >< 8)
    
  autoNameStop

PUB saveHistogramBuffer

  '' Saves the histogram buffer to the SD card as a CSV file. Returns 0 on success and an error number on failure.
  ''
  '' Automatically names the file 00001_H.CSV, 00002_H.CSV, etc.

  result := \saveHistogramBufferGuard 
  return fat.partitionError
  
PRI saveHistogramBufferGuard | index

  autoNameStart(string("_H.CSV"))

  ' Write header...
  fat.writeString(string("Index,Value", 13, 10))

  ' Write data...
  repeat index from 0 to 255
    fat.writeString(DECOut(index))
    fat.writeByte(",")
    fat.writeString(DECOut(getHistogramBufferValue(index)))
    fat.writeString(string(13, 10))

  autoNameStop

CON ' String processing...

  _AUTO_NAME_STRING_SIZE = 5 ' Five zeros... 

  _AUTO_NAME_NA_SIZE_B = 12
  _AUTO_NAME_NA_SIZE_L = ((_AUTO_NAME_NA_SIZE_B + 3) / 4)
  
  _DEC_OUT_TEMP_STRING_SIZE = 3 ' Signed 10 digit string plus NULL character.

  _NULL = 0 ' ASCII 0
  _QUOTATION_MARKS = 34 ' ASCII 34  

VAR long tokenStringPointer, tempString[_DEC_OUT_TEMP_STRING_SIZE] ' String processing variables.

PRI autoNameStart(nameString) | nameBuffer, nameCounter, nameArray[_AUTO_NAME_NA_SIZE_L]

  ' Starts the file system driver.
  '
  ' Automatically creates a numbered file name.
  '
  ' Only copies the first 6 characters from "nameString". 
  '
  ' Aborts on error. 

  fat.FATEngineStart(_SD_DO, _SD_CLK, _SD_DI, _SD_CS, _SD_WP, _SD_CD, -1, -1, -1)
  fat.mountPartition(0) 
  
  fat.listEntries("W")
  repeat while(nameBuffer := fat.listEntries("N"))
    result #>= DECIn(nameBuffer)

  nameBuffer := DECOut((1 + (result~)) // 65_536)
  nameCounter := strsize(nameBuffer)

  bytefill(nameArray, _NULL, _AUTO_NAME_NA_SIZE_B) 
  bytemove(nameArray, string("00000"), _AUTO_NAME_STRING_SIZE)
  bytemove((nameArray + (_AUTO_NAME_STRING_SIZE - nameCounter)), nameBuffer, nameCounter)

  bytemove( nameArray + _AUTO_NAME_STRING_SIZE, nameString, {
          } (strsize(nameString) <# constant(_AUTO_NAME_NA_SIZE_B - _AUTO_NAME_STRING_SIZE - 1)) )

  fat.openFile(fat.newFile(nameArray), "W")

PRI autoNameStop

  ' Stops the file system driver.
  '
  ' Aborts on error.  

  fat.unmountPartition
  fat.FATEngineStop 
  
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

    if(byte[tokenStringPointer] == _QUOTATION_MARKS)
      result := (STRTrim(++tokenStringPointer))

      stringPointer := _QUOTATION_MARKS

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

CON ' Camera register data structure.

  ' byte0 = camera register write address
  ' byte1 = camera register write value
  ' byte2 = camera register write mask
  
  ' cr[address] = ((cr[address] & !mask) | (value & mask)) 
  
  _CR_LENGTH = 3
   
  _CR_ADDRESS = 0
  _CR_VALUE = 1 
  _CR_MASK = 2
  
PUB initCamera '' Turn the camera module on. Return true on success and false on failure.  

  frqa := _CAMERA_CLOCK_FREQUENCY
  ctra := _CAMERA_CLOCK_COUNTER
  
  outa[_CAM_XCLK_PIN] := 0
  dira[_CAM_XCLK_PIN] := 1

  dira[_CAM_PWDN_PIN] := outa[_CAM_PWDN_PIN] := 0
  waitcnt((clkfreq / _CAMERA_XCLK_TIMEOUT) + cnt)

  repeat _CAMERA_PLL_RESET_COUNT
    ifnot(SCCBWriteRegister(_CAMERA_PLL_RESET_ADDRESS, _CAMERA_PLL_RESET_VALUE))
      return false

    waitcnt((clkfreq / _CAMERA_PLL_RESET_TIMEOUT) + cnt)

  if(SCCBWriteRegister(_CAMERA_SOFTWARE_RESET_ADDRESS, _CAMERA_SOFTWARE_RESET_VALUE))
    waitcnt((clkfreq / _CAMERA_SCCB_TIMEOUT) + cnt)

    repeat result from 0 to constant((_CAMERA_INIT_NUMBER - 1) * (_CR_LENGTH - 1)) step (_CR_LENGTH - 1)
      ifnot(SCCBWriteRegister(Camera_Init_Data[result + _CR_ADDRESS], Camera_Init_Data[result + _CR_VALUE]))
        return false
        
    return true
        
CON _CAMERA_INIT_NUMBER = 129 ' See OmniVision OV9665 implementation guide and data sheet for more details.

DAT Camera_Init_Data ' 129 Registers

' Format - register, data

byte $D5, $FF
byte $D6, $3F
byte $3D, $3C
byte $11, $80
byte $2A, $00
byte $2B, $00
byte $3A, $D9
byte $3B, $00
byte $3C, $58
byte $3E, $D0
byte $71, $00
byte $15, $00
byte $D7, $10
byte $6A, $24
byte $85, $E7
byte $63, $00
byte $12, $40
byte $4D, $09
byte $17, $0C
byte $18, $5C
byte $19, $02
byte $1A, $3F
byte $03, $03
byte $32, $90
byte $2B, $00
byte $5C, $80
byte $36, $B4
byte $65, $10
byte $70, $02
byte $71, $9F
byte $64, $A4
byte $5C, $80
byte $43, $00
byte $5D, $55
byte $5E, $57
byte $5F, $21
byte $24, $3E
byte $25, $38
byte $26, $72
byte $14, $68
byte $0C, $38
byte $4F, $4F
byte $50, $42
byte $5A, $67
byte $7D, $30
byte $7E, $00
byte $82, $03
byte $7F, $00
byte $83, $07
byte $80, $03
byte $81, $04
byte $96, $F0
byte $97, $00
byte $92, $33
byte $94, $5A
byte $93, $3A
byte $95, $48
byte $91, $FC
byte $90, $FF
byte $8E, $4E
byte $8F, $4E
byte $8D, $13
byte $8C, $0C
byte $8B, $0C
byte $86, $9E
byte $87, $11
byte $88, $22
byte $89, $05
byte $8A, $03
byte $9B, $0E
byte $9C, $1C
byte $9D, $34
byte $9E, $5A
byte $9F, $68
byte $A0, $76
byte $A1, $82
byte $A2, $8E
byte $A3, $98
byte $A4, $A0
byte $A5, $B0
byte $A6, $BE
byte $A7, $D2
byte $A8, $E2
byte $A9, $EE
byte $AA, $18
byte $AB, $E7
byte $B0, $43
byte $AC, $04
byte $84, $40
byte $AD, $82
byte $D9, $11
byte $DA, $00
byte $AE, $10
byte $AB, $E7
byte $B9, $50
byte $BA, $3C
byte $BB, $50
byte $BC, $3C
byte $BD, $08
byte $BE, $19
byte $BF, $02
byte $C0, $08
byte $C1, $2A
byte $C2, $34
byte $C3, $2D
byte $C4, $2D
byte $C5, $00
byte $C6, $98
byte $C7, $18
byte $69, $48
byte $74, $C0
byte $7C, $28
byte $65, $11
byte $66, $00
byte $41, $C0
byte $5B, $24
byte $60, $82
byte $05, $07
byte $03, $03
byte $D2, $94
byte $C8, $06
byte $CB, $40
byte $CC, $40
byte $CF, $00
byte $D0, $20
byte $D1, $00
byte $C7, $18
byte $0D, $92
byte $0D, $90

PUB finiCamera '' Turn the camera module off. Return true on success and false on failure.

  if(SCCBCameraControl(@Camera_Fini_Data, _CAMERA_FINI_NUMBER))
    dira[_CAM_PWDN_PIN] := outa[_CAM_PWDN_PIN] := 1
    dira[_CAM_XCLK_PIN] := ctra := phsa := frqa := 0
    return true

CON _CAMERA_FINI_NUMBER = 4 ' See OmniVision OV9665 implementation guide and data sheet for more details.

DAT Camera_Fini_Data ' 4 Registers

' Format - register, data, mux mask

byte $3B, $00, $08
byte $39, $6A, $FF
byte $D5, $00, $FF
byte $D6, $00, $FF

PUB AGCSetting(onOrOff) '' Change auto gain control. Return true on success and false on failure.

  AGC_Switch_Data[_CR_VALUE] := (onOrOff <> false)
  return SCCBCameraControl(@AGC_Switch_Data, _AGC_SWITCH_NUMBER)

CON _AGC_SWITCH_NUMBER = 1 ' See OmniVision OV9665 implementation guide and data sheet for more details.

DAT AGC_Switch_Data ' 1 Register

' Format - register, data, mux mask

byte $13, $00, $04

PUB AWBSetting(onOrOff) '' Change auto white balance control. Return true on success and false on failure.

  AWB_Switch_Data[_CR_VALUE] := (onOrOff <> false)
  return SCCBCameraControl(@AWB_Switch_Data, _AWB_SWITCH_NUMBER)

CON _AWB_SWITCH_NUMBER = 1 ' See OmniVision OV9665 implementation guide and data sheet for more details.

DAT AWB_Switch_Data ' 1 Register

' Format - register, data, mux mask

byte $13, $00, $02

PUB brightnessSetting(brightness) '' Change brightness settings (-128 to 127). Return true on success and false on failure.

  Brightness_Switch_Data[_CR_VALUE] := ((||brightness) & $7F)
  Brightness_Switch_Data[_BRIGHTNESS_NEGATIVE_CR_VALUE] := (_BRIGHTNESS_DEFAULT | ((brightness < 0) & _BRIGHTNESS_NEGATIVE))
  return SCCBCameraControl(@Brightness_Switch_Data, _BRIGHTNESS_SWITCH_NUMBER)

CON _BRIGHTNESS_SWITCH_NUMBER = 3 ' See OmniVision OV9665 implementation guide and data sheet for more details.

  _BRIGHTNESS_DEFAULT = $10
  _BRIGHTNESS_NEGATIVE = $8
  _BRIGHTNESS_NEGATIVE_CR_VALUE = (_CR_VALUE + (_CR_LENGTH * 2))

DAT Brightness_Switch_Data ' 3 Registers

' Format - register, data, mux mask

byte $D1, $00, $FF
byte $C8, $04, $04
byte $C7, $00, $18

PUB contrastSetting(contrast) '' Change constrast settings (-32 to 31). Return true on success and false on failure.

  Contrast_Switch_Data[_CR_VALUE] := ((contrast // constant(_CONTRAST_MAXIMUM - _CONTRAST_MINIMUM + 1)) + _CONTRAST_DEFAULT)
  return SCCBCameraControl(@Contrast_Switch_Data, _CONTRAST_SWITCH_NUMBER)

CON _CONTRAST_SWITCH_NUMBER = 4 ' See OmniVision OV9665 implementation guide and data sheet for more details.

  _CONTRAST_DEFAULT = $20
  _CONTRAST_MAXIMUM = $1F
  _CONTRAST_MINIMUM = $0

DAT Contrast_Switch_Data ' 4 Registers

' Format - register, data, mux mask

byte $D0, $00, $FF
byte $64, $02, $02
byte $C8, $04, $04
byte $C7, $34, $34

PUB verticalFlipSetting(onOrOff) '' Change vertical flip settings. Return true on success and false on failure. 

  Vertical_Flip_Data[_CR_VALUE] := (onOrOff <> false)
  return SCCBCameraControl(@Vertical_Flip_Data, _VERTICAL_FLIP_NUMBER)

CON _VERTICAL_FLIP_NUMBER = 1 ' See OmniVision OV9665 implementation guide and data sheet for more details.

DAT Vertical_Flip_Data ' 1 Register

' Format - register, data, mux mask

byte $04, $00, $40

PUB horizontalMirrorSetting(onOrOff) '' Change horizontal mirror settings. Return true on success and false on failure. 

  Horizontal_Mirror_Data[_CR_VALUE] := (onOrOff <> false)
  return SCCBCameraControl(@Horizontal_Mirror_Data, _HORIZONTAL_MIRROR_NUMBER)

CON _HORIZONTAL_MIRROR_NUMBER = 2 ' See OmniVision OV9665 implementation guide and data sheet for more details.

DAT Horizontal_Mirror_Data ' 2 Registers

' Format - register, data, mux mask

byte $33, $00, $08
byte $04, $80, $80

PRI SCCBCameraControl(address, length) | index, temp ' Updates camera controls from data structures.

' Notes:
'
' Address - The address of the data structure.
' Length - The length of the data structure.
'
' Returns false on success and false on failure.

  length := ((length - 1) * _CR_LENGTH)

  repeat index from 0 to length step _CR_LENGTH

    ifnot(SCCBReadRegister(byte[address][index + _CR_ADDRESS], @temp))
      return false

    ifnot(SCCBWriteRegister( byte[address][index + _CR_ADDRESS], {
                           } ( (temp & (!byte[address][index + _CR_MASK])) | {
                           }   (byte[address][index + _CR_VALUE] & byte[address][index + _CR_MASK]) ) ) )
      return false

  return true    

PRI SCCBWriteRegister(register, data) ' Writes a camera register.

' Notes:
'
' Register - The register number to write.
' Data - The value to write.
'
' Returns true on success and false on failure.

  I2CStart
  result := I2CWrite(_SCCB_CAMERA_WRITE_ADDRESS)
  result and= I2CWrite(register)
  result and= I2CWrite(data)
  I2CStop

PRI SCCBReadRegister(register, longDataAddress) ' Reads a camera register.

' Notes:
'
' Register - The register number to read.
' LongDataAddress - The address of the value to store data to.
'
' Returns true on success and false on failure.

  I2CStart
  result := I2CWrite(_SCCB_CAMERA_WRITE_ADDRESS)
  result and= I2CWrite(register)
  I2CStop

  if(result)
    I2CStart
    result := I2CWrite(_SCCB_CAMERA_READ_ADDRESS)
    long[longDataAddress] := I2CRead(false)
    I2CStop

PRI I2CWrite(data) ' Write out data.

' Notes:
'
' Data - The 8 bit packet to transmit.
'
' Returns true if the receiving device ACK'ed and false if not.

  data := ((!data) >< 8)

  repeat 8 ' Write out all 8 data bits. Leave with clock low.
    dira[_I2C_DATA_PIN] := data
    dira[_I2C_CLOCK_PIN] := 0
    dira[_I2C_CLOCK_PIN] := 1
    data >>= 1

  ' Leave with clock low and data low.

  dira[_I2C_DATA_PIN] := 0
  dira[_I2C_CLOCK_PIN] := 0
  result := not(ina[_I2C_DATA_PIN])
  dira[_I2C_CLOCK_PIN] := 1
  dira[_I2C_DATA_PIN] := 1

PRI I2CRead(aknowledge) ' Read in data.

' Notes:
'
' Aknowledge - True to send the transmitting device an ACK and false to not send a NCK.
'
' Returns the received 8 bit packet.

  dira[_I2C_DATA_PIN] := 0

  repeat 8 ' Read in all 8 data bits. Leave with clock low.
    result <<= 1
    dira[_I2C_CLOCK_PIN] := 0
    result |= ina[_I2C_DATA_PIN]
    dira[_I2C_CLOCK_PIN] := 1

  ' Leave with the clock low and the data low.

  dira[_I2C_DATA_PIN] := (not(not(aknowledge)))
  dira[_I2C_CLOCK_PIN] := 0
  dira[_I2C_CLOCK_PIN] := 1
  dira[_I2C_DATA_PIN] := 1

PRI I2CStart ' Cause the I2C start condition.

  outa[_I2C_DATA_PIN] := 0
  dira[_I2C_DATA_PIN] := 1
  outa[_I2C_CLOCK_PIN] := 0
  dira[_I2C_CLOCK_PIN] := 1

PRI I2CStop ' Cause the I2C stop condition.

  dira[_I2C_CLOCK_PIN] := 0
  dira[_I2C_DATA_PIN] := 0

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