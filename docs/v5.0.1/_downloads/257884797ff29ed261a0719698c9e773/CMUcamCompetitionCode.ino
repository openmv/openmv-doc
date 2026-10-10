#include <stdio.h>
#include <CMUcam4.h>

void cmucamSetup();
void getCmucamData(int, int, boolean, boolean, boolean);

int x_blob; // X-coordinate returned by CMUcam4 (range, min and max defined below)
int x_blob_10;    // For temporary input
int x_blob_1;     // For temporary input 
#define camera_pixel_range 65 // Range of pixels on camera  
#define camera_pixel_max   95 // Camera pixel range max
#define camera_pixel_min   35 // Camera pixel range min

#define LED_PIN 20  

#define CYCLES_MAX 5  //num data points to collect

CMUcam4 cam;

int color;

#define RED (1)
#define GREEN (1 << 1)
#define BLUE (1 << 2)

//switches for debug board
#define redSwitch   3
#define greenSwitch 4
#define blueSwitch  5

//boxes for targets
#define LEFT_X 30
#define RIGHT_X 105  //prev 100
#define TOP_Y 30  //prev 30
#define MID1_Y (TOP_Y + 20)
#define MID2_Y (TOP_Y + 40)
#define BOT_Y (TOP_Y + 60)

int cmucamState;

int xData[30];
int yData[30];

struct circle {
  boolean moving; 
  int xPos;
};

circle redTarget;
circle greenTarget;
circle blueTarget;

int targetTrackingColor = -1;

#define RED_RH 180
#define RED_RL 255
#define RED_GH 50 
#define RED_GL 180
#define RED_BH 80 
#define RED_BL 200

#define BLUE_RH 0
#define BLUE_RL 150 
#define BLUE_GH 120 
#define BLUE_GL 210
#define BLUE_BH 80 
#define BLUE_BL 180

#define GREEN_RH 0 
#define GREEN_RL 180
#define GREEN_GH 60 
#define GREEN_GL 130
#define GREEN_BH 140
#define GREEN_BL 255

int lastTargetShot = -1;  //initially no target shot

/*
 * void cmucamSetup()
 *
 * CMUcam4 set up routine
 */
void cmucamSetup()
{
  pinMode(LED_PIN, OUTPUT);
  
  cam.begin();
  cam.LEDOn(10);
  
  delay(5000);
  
  cam.autoGainControl(0);
  cam.autoWhiteBalance(0);
  
  
  cam.LEDOff();
  
  int result = cam.getButtonState();
  
  if(result >= 0)
  {
    digitalWrite(LED_PIN, result ? HIGH : LOW);
  }  
}

/*
 * void resetTrackingData()
 *
 * Resets all the tracking data
 */

void resetTrackingData()
{
  //reset tracking data
  redTarget.moving = false;
  redTarget.xPos = 0;
  greenTarget.moving = false;
  greenTarget.xPos = 0;
  blueTarget.moving = false;
  blueTarget.xPos = 0;
}

/*

int getCMUcamData(int, int, boolean, boolean, boolean)

mode: 0 - normal
      1 - check specific color (trackLastColor) if dynamic
      2 - check specific color (trackLastColor) if static
      3 - look for dynamic target
      4 - look for static target
      
if mode == 1 or mode == 2
  if returned value > 0, bad miss
  if returned value == 0, good confirm hit
  
if mode == 3 or mode == 4
  returned value is color needed to hit
*/

int getCmucamData(int mode, int trackLastColor, boolean skipRed, boolean skipGreen, boolean skipBlue)
{
  cmucamState = 0;
  
  //parse inputs
  if(mode == 0)
  {
    skipRed = false;
    skipGreen = false;
    skipBlue = false;
  }
  else if(mode == 1 || mode == 2)
  {
    if(trackLastColor == RED)
    {
      skipGreen = true;
      skipBlue = true;
    }
    else if(trackLastColor == GREEN)
    {
      skipRed = true;
      skipBlue = true;
    }
    else if(trackLastColor == BLUE)
    {
      skipGreen = true;
      skipRed = true;
    }
  }
  
  int redMax, redMin, greenMax, greenMin, blueMax, blueMin;
  
  //cycle
  while(1)
  {
    CMUCAM4_track_data_t data;
    
    if(cmucamState == 0 && skipRed == false)
    {
      //red
      cam.setTrackingParameters(RED_RL, RED_RH, RED_GL, RED_GH, RED_BL, RED_BH);
      cam.setTrackingWindow(LEFT_X, TOP_Y, RIGHT_X, MID1_Y);
    }
    else if(cmucamState == 1 && skipGreen == false)
    {
      //green
       cam.setTrackingParameters(GREEN_RL, GREEN_RH, GREEN_GL, GREEN_GH, GREEN_BL, GREEN_BH);
      cam.setTrackingWindow(LEFT_X, MID1_Y, RIGHT_X, MID2_Y);  
    }
    else if(cmucamState == 2 && skipBlue == false)
    {
      //blue
      cam.setTrackingParameters(BLUE_RL, BLUE_RH, BLUE_GL, BLUE_GH, BLUE_BL, BLUE_BH);
      cam.setTrackingWindow(LEFT_X, MID2_Y, RIGHT_X, BOT_Y);  
    }
    else if(cmucamState == 4)
    {
       //failed?
       return -1;
    }
    
    if(cmucamState < 3)
    {
      cam.trackColor(); // Start streaming
      
      int cycles = 0;
      
      //get data from camera
      do
      {
        cam.waitStream();
        cam.parseTPacket(&data);
        
        xData[cmucamState*CYCLES_MAX + cycles] = (int) data.centroidX;
        yData[cmucamState*CYCLES_MAX + cycles] = (int) data.centroidY;
        
        // For bus pirate debug.
        //Serial.print("1337");
        
        cycles++;
      }
      while(cycles < CYCLES_MAX);
      
      //process the data immediately for analysis
      
      //analyze red
      if(cmucamState == 0 && skipRed == false)
      {
        int redSum = 0;
        int redZero = 0;
        int redDiv = CYCLES_MAX;
        
        redMin = xData[0];
        redMax = xData[0];
        
        for(int i = 0; i < CYCLES_MAX; i++)
        {
          if(xData[i] != 0)
          {
            redSum += xData[i];
            
            if(xData[i] > redMax)
              redMax = xData[i];
            
            if(xData[i] < redMin)
              redMin = xData[i];
          }
          else if(xData[i] == 0)
            redZero++;
        }
        
        if(redZero >= 2)
        {
          redTarget.xPos = 0;
          DEBUG_PRINTLN("Red Multiple not seen");
        }
        else if(abs(redSum/redDiv - xData[0]) > 2 || abs(redMax - redMin) > 2)
        {
          DEBUG_PRINTLN("Red Moving");
          redTarget.moving = true;
          
          if(mode == 1 || mode == 3) //tracking dynamic
          {
            return RED;
          }
          else if(mode == 2)
          {
            return 0;  //good
          }
        }
        else
        {
          DEBUG_PRINTLN("Red Not Moving");
          DEBUG_PRINT("Final X Position: ");
          DEBUG_PRINTLN(redSum/redDiv);
  
          redTarget.xPos = redSum/redDiv;
          
          if(mode == 2 || mode == 4)  //tracking static
          {
            return RED;
          }
          else if(mode == 1)
          {
            return 0; //good
          }
        }
      }
      else if(cmucamState == 1 && skipGreen == false)  //analyze green
      {
        int greenSum = 0;
        int greenZero = 0;
        int greenDiv = CYCLES_MAX;
        
        greenMin = xData[CYCLES_MAX];
        greenMax = xData[CYCLES_MAX];
        
        for(int i = 0; i < CYCLES_MAX; i++)
        {   
          if(xData[CYCLES_MAX + i] != 0)
          {
            greenSum += xData[CYCLES_MAX + i];
            
            if(xData[CYCLES_MAX + i] > redMax)
              greenMax = xData[CYCLES_MAX + i];
            
            if(xData[CYCLES_MAX + i] < redMin)
              greenMin = xData[CYCLES_MAX + i];
            
          }
          else if(xData[CYCLES_MAX + i] == 0)
            greenZero++;
        }
        
        if(greenZero >= 2)
        {
          greenTarget.xPos = 0;
          DEBUG_PRINTLN("Green Multiple not seen");
        }
        else if(abs(greenSum/greenDiv - xData[CYCLES_MAX]) > 2 || abs(greenMax - greenMin) > 2)
        {
          DEBUG_PRINTLN("Green Moving");
          greenTarget.moving = true;
          
          if(mode == 1 || mode == 3) //tracking dynamic
          {
            return RED;
          }
          else if(mode == 2)
          {
            return 0;  //good
          }
        }
        else
        {
          DEBUG_PRINTLN("Green Not Moving");
          DEBUG_PRINT("Final X Position: ");
          DEBUG_PRINTLN(greenSum/CYCLES_MAX);
          
          greenTarget.xPos = greenSum/CYCLES_MAX;
          
          if(mode == 2 || mode == 4)  //tracking static
          {
            return GREEN;
          }
          else if(mode == 1)
          {
            return 0; //good
          }
        }
      }
      else if(cmucamState == 2 && skipBlue == false)  //analyze blue
      {
        int blueSum = 0;
        int blueZero = 0;
        int blueDiv = CYCLES_MAX;
        
        blueMin = xData[CYCLES_MAX*2];
        blueMax = xData[CYCLES_MAX*2];
        
        for(int i = 0; i < CYCLES_MAX; i++)
        {   
          if(xData[2*CYCLES_MAX + i] != 0)
          {
            blueSum += xData[2*CYCLES_MAX + i];
            
            if(xData[CYCLES_MAX*2 + i] > redMax)
              blueMax = xData[CYCLES_MAX*2 + i];
            
            if(xData[CYCLES_MAX + i] < redMin)
              blueMin = xData[CYCLES_MAX*2 + i];
          }
          else if(xData[2*CYCLES_MAX + i] == 0)
            blueZero++;
        }
        
        if(blueZero >= 2)
        {
          blueTarget.xPos = 0;
          DEBUG_PRINTLN("Blue Multiple not seen");
        }
        else if(abs(blueSum/blueDiv - xData[2*CYCLES_MAX]) > 2 || abs(blueMax - blueMin) > 2)
        {
          DEUBUG_PRINTLN("Blue Moving");
          
          blueTarget.moving = true;
          
          if(mode == 1 || mode == 3) //tracking dynamic
          {
            return RED;
          }
          else if(mode == 2)
          {
            return 0;  //good
          }
        }
        else
        {
          DEBUG_PRINTLN("Blue Not Moving");
          DEBUG_PRINT("Final X Position: ");
          DEBUG_PRINTLN(blueSum/CYCLES_MAX);
          
          blueTarget.xPos = blueSum/CYCLES_MAX;
          
          if(mode == 2 || mode == 4)  //tracking static
          {
            return BLUE;
          }
          else if(mode == 1)
          {
            return 0; //good
          }
        }
      }
    
      cam.stopStream(); // Stop streaming
    }
    
    cmucamState++;
  }
}

/*
 * void trackTarget()
 *
 * This code returns when the target has reached an edge.
 * We know that it will take approximately two seconds for
 * the target to reach the center of the board, which is
 * the target zone for our shooting
 */

void trackTarget()
{
  CMUCAM4_track_data_t data;
  
  cmucamState = 0;
  int iter = 0;
  int trackingX[30];
  
  enum dir {left, right, none};
  dir d = none;
  
  if(targetTrackingColor == 0)
  {
    //red
    cam.setTrackingParameters(180, 255, 50, 180, 80, 200);
    cam.setTrackingWindow(LEFT_X, TOP_Y, RIGHT_X, MID1_Y);
  }
  else if(targetTrackingColor == 1)
  {
    //green
    cam.setTrackingParameters(0, 150, 120, 210, 80, 180);
    cam.setTrackingWindow(LEFT_X, MID1_Y, RIGHT_X, MID2_Y);  
  }
  else if(targetTrackingColor == 2)
  {
    //blue
    cam.setTrackingParameters(0, 180, 60, 130, 140, 255);
    cam.setTrackingWindow(LEFT_X, MID2_Y, RIGHT_X, BOT_Y);  
  }
  
  while(1)
  {
    if(cmucamState == 0)
    {
      cam.trackColor(); // Start streaming
      
      while(1)
      {
        cam.waitStream();
        cam.parseTPacket(&data);
        
        trackingX[iter] = (int) data.centroidX;
        
        if(iter > 2)
        {
          if(d == none)
          {
            if(trackingX[iter] > trackingX[iter - 2])  //is the target moving right?
            {
              d = right;
            }
            else if(trackingX[iter] < trackingX[iter - 2]) //is the target moving left?
            {
              d = left;
            }
          }
          else if(d == right)
          {
            if(trackingX[iter] < trackingX[iter - 2]) //is the target moving left?
            {
              break;
            }
          }
          else if(d == left)
          {
            if(trackingX[iter] > trackingX[iter - 2])  //is the target moving right?
            {
              break;
            }
          }
        }
        
        iter++;
      }
    
      cam.stopStream(); // Stop streaming
      
      return; //target has been found
    }
    else if(cmucamState == 1)
    {
      if(d == right)
      {
        DEBUG_PRINTLN("Target is moving to the center from the right");
      }
      else if(d == left)
      {
        DEBUG_PRINTLN("Target is moving to the center from the left");
      }
    }
    
    cmucamState++;
  }
}
