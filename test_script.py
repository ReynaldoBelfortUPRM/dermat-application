import RCM_LayerSeparation

import os
import time
import sys
import json
import numpy as np
import scipy.io
import matplotlib.image as img
from pprint import pprint
from PIL import Image

# Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    # Start timing
    t0 = time.time()

# -----------------------------Input management-----------------------------

    # Input: Filepath array original images is
    # Output: Matrix containing pixel values of all the images in the stack
    message = {
        "messageType": "status",
        "data": "Step 1: Preparing images..."
    }
    print json.dumps(message)
    sys.stdout.flush()

# Get our data as an array from read_in()
    ipmInput = read_in()
# Print ipmInput in json format 
    # pprint(ipmInput)

    file = open(ipmInput['originalImages'][0])
    # print file

# Open image to extract properties
    image = Image.open(ipmInput['originalImages'][0])
    # image.show()

# Extracts size tuple of the image
    size = image.size
    # print image.size

# Extracts amount of elements in the JSON array
    elementCount = len(ipmInput['originalImages'])
    # print elementCount

# Preallocate space for the data
    data = np.empty((size[1],size[0],elementCount),dtype=np.uint8)
      
# Add pixel data into zero array
    for i in range(0, elementCount):
        image = img.imread(ipmInput['originalImages'][i])
        image = image*255

        # Copies image pixels into data array
        for j in range(0, size[1]):
            for k in range(0, size[0]):
                data[j][k][i] = image[j][k]

    # Required files path (texton library and models)
    textFilesPath = "..\ipa-files"
    # Path where to output images
    outputImagesSavePath = ipmInput['appDataPath'] + '\characterized-images'
    # Path to access stored and load image matrix
    ImageArrayPath = ipmInput['appDataPath'] + '\ImageArray.mat'
    # If output folder does not exist, create it
    if not os.path.exists(outputImagesSavePath):
        os.makedirs(outputImagesSavePath)

    # Saves image matrix in .mat file to be accessed by the runtime
    # scipy.io.savemat(ImageArrayPath, {'imageData': data})
    
    # message["data"] = "Step 2: Data saved..."
    # print json.dumps(message)
    # sys.stdout.flush()  

    # t1 = time.time()
    # total = t1 - t0 
    # print('Total time: ' + repr(total) + ' seconds')
    # t0 = t1

    # ----------------------------Runtime management-----------------------------
    message["data"] = "Step 2: Classifying images..."
    print json.dumps(message)
    sys.stdout.flush()

    # # Initializes MATLAB runtime
    # matlabRuntime = RCM_LayerSeparation.initialize()

    # # Input: Matrix of pixel values,
    # #        Path to folder where texton library and models are stored,
    # #        Path to folder where characterized images will be stored
    # # Output: Vector containing the classification of each image in the stack

    # ipmOutput = matlabRuntime.RCM_LayerSeparation(data_mat,textFilesPath,outputImagesSavePath)
    # # print (ipmOutput)   #Test classifier output

    # # Terminate MATLAB runtime
    # matlabRuntime.terminate()
    
    # t1 = time.time()
    # total = t1 - t0 
    # print('Total time: ' + repr(total) + ' seconds')
    # t0 = t1

    # ----------------------------Output management-----------------------------
    ipmOutput = {
        "characterizedImages": [
            outputImagesSavePath + "\\Characterized_1.png",
            outputImagesSavePath + "\\Characterized_2.png",
            outputImagesSavePath + "\\Characterized_3.png",
            outputImagesSavePath + "\\Characterized_4.png",
            outputImagesSavePath + "\\Characterized_5.png",
            outputImagesSavePath + "\\Characterized_6.png",
            outputImagesSavePath + "\\Characterized_7.png",
            outputImagesSavePath + "\\Characterized_8.png",
            outputImagesSavePath + "\\Characterized_9.png",
            outputImagesSavePath + "\\Characterized_10.png",
            outputImagesSavePath + "\\Characterized_11.png"
        ],

        "LayersInfo": [
            {
                "LayerID":1,
                "LayerName":"Stratum Corneum",
                "LayerThickness":10,
                "LayerRange":[1,10]
            },
            {
                "LayerID":2,
                "LayerName":"Stratum Granulosum",
                "LayerThickness":6,
                "LayerRange":[11,16]
            },
            {
                "LayerID":3,
                "LayerName":"Stratum Spinosum",
                "LayerThickness":5,
                "LayerRange":[17,21]
            },
            {
                "LayerID":4,
                "LayerName":"Stratum Basale",
                "LayerThickness":8,
                "LayerRange":[22,29]
            },
            {
                "LayerID":5,
                "LayerName":"Dermis",
                "LayerThickness":7,
                "LayerRange":[30,36]
            },

        ]
    }
# Returns the JSON output to Electron in a single string
# (TEST OUTPUT)
    message["messageType"] = "results"
    message["data"] = ipmOutput
    print json.dumps(message)
    # print message
    sys.stdout.flush()
  
   
    # Write JSON string to file
    with open("ipmOutput.json","w") as outfile:
        json.dump(ipmOutput, outfile, indent = 3)
    # pprint(ipmOutput)

# Start process
# if __name__ == '__main__':
main()
